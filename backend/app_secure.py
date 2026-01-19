# app.py
# SISTEMA COMPLETO ENTERPRISE - VERSÃO SEGURA
# Inclui: JWT com bcrypt, Histórico, Exportação (PDF/Excel), WhatsApp e Google Sheets

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
from pathlib import Path
import shutil
import csv
import json
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import uuid
from typing import Optional, Dict, Any, List
import os
import requests
import io
from openpyxl import load_workbook, Workbook
import bcrypt
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Serviço de cache SQLite (opcional)
try:
    from cache_service import cache_service
except ImportError:
    cache_service = None
    print("⚠️  cache_service não encontrado, continuando sem cache...")

# =========================
# CONFIG COM VARIÁVEIS DE AMBIENTE
# =========================

# Validação de SECRET_KEY em produção
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("❌ ERRO: SECRET_KEY não configurada! Configure no arquivo .env")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRE_MIN = int(os.getenv("TOKEN_EXPIRE_MIN", "60"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="Chat IA Corporativo",
    description="API Enterprise para Análise de Relatórios com IA",
    version="2.0.0"
)

security = HTTPBearer()

# CORS configurável via variável de ambiente
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

# Validação temporariamente desabilitada para deploy inicial
# Após deploy do frontend, atualize ALLOWED_ORIGINS com a URL real do frontend
# if ENVIRONMENT == "production" and allowed_origins == ["*"]:
#     raise ValueError("❌ ERRO: CORS com '*' não é permitido em produção! Configure ALLOWED_ORIGINS no .env")

if allowed_origins == ["*"]:
    print("⚠️  AVISO: CORS configurado para permitir todas as origens (use apenas temporariamente)")
else:
    print(f"✅ CORS configurado para: {', '.join(allowed_origins)}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path("data")
BASE_DIR.mkdir(exist_ok=True)
LOGS_FILE = BASE_DIR / "logs.csv"
USERS_FILE = BASE_DIR / "users.json"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
EXPORTS_DIR = BASE_DIR / "exports"
EXPORTS_DIR.mkdir(exist_ok=True)

# Inicializar arquivo de logs
if not LOGS_FILE.exists():
    with open(LOGS_FILE, "w", encoding="utf-8") as f:
        f.write("timestamp,usuario,tipo,codvd,vendedor,registros\n")

# Arquivo de audit logs para ações administrativas
AUDIT_LOG_FILE = BASE_DIR / "audit_logs.csv"
if not AUDIT_LOG_FILE.exists():
    with open(AUDIT_LOG_FILE, "w", encoding="utf-8") as f:
        f.write("timestamp,admin_email,action,target_user,details\n")

# =========================
# GERENCIAMENTO SEGURO DE USUÁRIOS
# =========================

def hash_password(password: str) -> str:
    """Hash de senha usando bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verifica senha contra hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def load_users() -> Dict:
    """Carrega usuários do arquivo JSON"""
    if not USERS_FILE.exists():
        # Criar usuário admin padrão apenas na primeira vez
        default_users = {
            "admin@empresa.com": {
                "password": hash_password("Admin@2025!ChangeMe"),
                "role": "admin",
                "name": "Administrador",
                "created_at": datetime.now().isoformat()
            }
        }
        save_users(default_users)
        print("⚠️  IMPORTANTE: Usuário admin criado com senha padrão. ALTERE IMEDIATAMENTE!")
        print("   Email: admin@empresa.com")
        print("   Senha: Admin@2025!ChangeMe")
        return default_users
    
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_users(users: Dict):
    """Salva usuários no arquivo JSON"""
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


# Carregar usuários na inicialização
USERS_DB = load_users()

# =========================
# RATE LIMITING
# =========================

LOGIN_ATTEMPTS = {}  # email: {"count": int, "last_attempt": datetime}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_TIME = 15  # minutos

def check_rate_limit(email: str):
    """Verifica se o usuário excedeu o limite de tentativas"""
    now = datetime.utcnow()
    
    if email in LOGIN_ATTEMPTS:
        attempts = LOGIN_ATTEMPTS[email]
        time_diff = (now - attempts["last_attempt"]).total_seconds() / 60
        
        # Reset após lockout
        if time_diff > LOCKOUT_TIME:
            LOGIN_ATTEMPTS[email] = {"count": 1, "last_attempt": now}
            return True
        
        # Bloqueado
        if attempts["count"] >= MAX_LOGIN_ATTEMPTS:
            remaining = LOCKOUT_TIME - time_diff
            raise HTTPException(429, f"Muitas tentativas. Tente novamente em {int(remaining)} minutos")
        
        # Incrementar tentativas
        LOGIN_ATTEMPTS[email]["count"] += 1
        LOGIN_ATTEMPTS[email]["last_attempt"] = now
    else:
        LOGIN_ATTEMPTS[email] = {"count": 1, "last_attempt": now}
    
    return True

def reset_rate_limit(email: str):
    """Reseta tentativas após login bem-sucedido"""
    if email in LOGIN_ATTEMPTS:
        del LOGIN_ATTEMPTS[email]

# =========================
# JWT
# =========================

def criar_token(email: str, role: str = "user", token_type: str = "access", remember_me: bool = False):
    """Cria JWT token (access ou refresh)"""
    if token_type == "refresh":
        expire_delta = timedelta(days=30 if remember_me else 7)
    else:
        expire_delta = timedelta(days=30) if remember_me else timedelta(minutes=TOKEN_EXPIRE_MIN)
    
    payload = {
        "sub": email,
        "role": role,
        "type": token_type,
        "exp": datetime.utcnow() + expire_delta,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload["sub"]
        
        # Verificar se usuário ainda existe
        if email not in USERS_DB:
            raise HTTPException(403, "Usuário não encontrado")
            
        return {"email": email, "role": payload.get("role", "user")}
    except JWTError as e:
        raise HTTPException(403, f"Token inválido ou expirado: {str(e)}")


def require_admin(user_data = Depends(get_user)):
    """Dependency para garantir que apenas admins acessem endpoint"""
    if user_data["role"] != "admin":
        raise HTTPException(403, "Acesso negado. Privilégios de administrador necessários.")
    return user_data


def log_admin_action(admin_email: str, action: str, target_user: str, details: str = ""):
    """Registra ações administrativas no audit log"""
    try:
        with open(AUDIT_LOG_FILE, "a", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                datetime.now().isoformat(),
                admin_email,
                action,
                target_user,
                details
            ])
    except Exception as e:
        print(f"⚠️  Erro ao registrar audit log: {e}")

# =========================
# AUTH COM SEGURANÇA
# =========================

@app.post("/api/auth/login")
def login(credentials: Dict[str, Any] = Body(...)):
    email = credentials.get("email", "").strip().lower()
    password = credentials.get("password", "")
    remember_me = credentials.get("rememberMe", False)
    
    if not email or not password:
        raise HTTPException(400, "Email e senha são obrigatórios")
    
    # Validação de email
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Email inválido")
    
    # Rate limiting
    check_rate_limit(email)
    
    user = USERS_DB.get(email)
    if not user:
        raise HTTPException(401, "Credenciais inválidas")
    
    # Verificar senha com hash
    if not verify_password(password, user["password"]):
        raise HTTPException(401, "Credenciais inválidas")
    
    # Reset rate limit após sucesso
    reset_rate_limit(email)
    
    # Gerar tokens
    access_token = criar_token(email, user["role"], "access", remember_me)
    refresh_token = criar_token(email, user["role"], "refresh", remember_me)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": email,
        "user": {
            "email": email,
            "name": user["name"],
            "role": user["role"]
        }
    }


@app.post("/api/auth/register")
def register(credentials: Dict[str, Any] = Body(...)):
    email = credentials.get("email", "").strip().lower()
    password = credentials.get("password", "")
    name = credentials.get("name", "").strip()
    
    if not email or not password or not name:
        raise HTTPException(400, "Email, senha e nome são obrigatórios")
    
    # Validação de email
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Email inválido")
    
    # Validação de nome
    if len(name) < 3 or len(name) > 100:
        raise HTTPException(400, "Nome deve ter entre 3 e 100 caracteres")
    
    # Validação de senha forte
    if len(password) < 8:
        raise HTTPException(400, "Senha deve ter no mínimo 8 caracteres")
    
    import re
    if not re.search(r"[A-Z]", password):
        raise HTTPException(400, "Senha deve conter pelo menos 1 letra maiúscula")
    if not re.search(r"[0-9]", password):
        raise HTTPException(400, "Senha deve conter pelo menos 1 número")
    if not re.search(r"[!@#$%^&*]", password):
        raise HTTPException(400, "Senha deve conter pelo menos 1 caractere especial (!@#$%^&*)")
    
    # Recarregar usuários para evitar conflitos
    users = load_users()
    
    if email in users:
        raise HTTPException(400, "Email já cadastrado")
    
    # Criar novo usuário com senha hash
    users[email] = {
        "password": hash_password(password),
        "role": "user",
        "name": name,
        "created_at": datetime.now().isoformat()
    }
    
    save_users(users)
    
    # Atualizar cache em memória
    global USERS_DB
    USERS_DB = users
    
    return {
        "message": "Usuário criado com sucesso!",
        "user": {
            "email": email,
            "name": name,
            "role": "user"
        }
    }


@app.get("/api/auth/me")
def me(user_data = Depends(get_user)):
    email = user_data["email"]
    user = USERS_DB.get(email)
    
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    
    return {
        "email": email,
        "name": user["name"],
        "role": user["role"],
        "created_at": user.get("created_at")
    }


@app.post("/api/auth/change-password")
def change_password(data: Dict[str, Any] = Body(...), user_data = Depends(get_user)):
    """Permite usuário alterar sua própria senha"""
    email = user_data["email"]
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    
    if not old_password or not new_password:
        raise HTTPException(400, "Senhas antiga e nova são obrigatórias")
    
    if len(new_password) < 8:
        raise HTTPException(400, "Nova senha deve ter no mínimo 8 caracteres")
    
    users = load_users()
    user = users.get(email)
    
    if not user or not verify_password(old_password, user["password"]):
        raise HTTPException(401, "Senha antiga incorreta")
    
    # Atualizar senha
    users[email]["password"] = hash_password(new_password)
    users[email]["password_changed_at"] = datetime.now().isoformat()
    
    save_users(users)
    
    global USERS_DB
    USERS_DB = users
    
    return {"message": "Senha alterada com sucesso"}


# =========================
# GERENCIAMENTO DE USUÁRIOS (ADMIN)
# =========================

@app.get("/api/admin/users")
def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin_data = Depends(require_admin)
):
    """Lista todos os usuários com paginação e filtros (admin only)"""
    users = load_users()
    
    # Converter para lista com informações adicionais
    user_list = []
    for email, data in users.items():
        # Adicionar is_active se não existir
        if "is_active" not in data:
            data["is_active"] = True
        
        user_info = {
            "email": email,
            "name": data.get("name", ""),
            "role": data.get("role", "user"),
            "is_active": data.get("is_active", True),
            "created_at": data.get("created_at", ""),
            "last_login": data.get("last_login"),
            "password_changed_at": data.get("password_changed_at")
        }
        user_list.append(user_info)
    
    # Aplicar filtros
    if role:
        user_list = [u for u in user_list if u["role"] == role]
    
    if is_active is not None:
        user_list = [u for u in user_list if u["is_active"] == is_active]
    
    if search:
        search_lower = search.lower()
        user_list = [
            u for u in user_list 
            if search_lower in u["email"].lower() or search_lower in u["name"].lower()
        ]
    
    # Ordenar por data de criação (mais recentes primeiro)
    user_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Paginação
    total = len(user_list)
    start = (page - 1) * limit
    end = start + limit
    paginated_users = user_list[start:end]
    
    log_admin_action(admin_data["email"], "LIST_USERS", "all", f"page={page}, limit={limit}")
    
    return {
        "users": paginated_users,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@app.get("/api/admin/users/{email}")
def get_user_details(email: str, admin_data = Depends(require_admin)):
    """Obtém detalhes de um usuário específico (admin only)"""
    users = load_users()
    
    if email not in users:
        raise HTTPException(404, "Usuário não encontrado")
    
    user = users[email]
    
    return {
        "email": email,
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "is_active": user.get("is_active", True),
        "created_at": user.get("created_at", ""),
        "last_login": user.get("last_login"),
        "password_changed_at": user.get("password_changed_at")
    }


@app.patch("/api/admin/users/{email}")
def update_user(
    email: str,
    updates: Dict[str, Any] = Body(...),
    admin_data = Depends(require_admin)
):
    """Atualiza informações de um usuário (admin only)"""
    users = load_users()
    
    if email not in users:
        raise HTTPException(404, "Usuário não encontrado")
    
    # Campos permitidos para atualização
    allowed_fields = ["name", "role", "is_active"]
    updated_fields = []
    
    for field, value in updates.items():
        if field in allowed_fields:
            # Validações
            if field == "role" and value not in ["user", "vendedor", "admin"]:
                raise HTTPException(400, f"Role inválida: {value}")
            
            if field == "is_active" and not isinstance(value, bool):
                raise HTTPException(400, "is_active deve ser boolean")
            
            if field == "name" and (len(value) < 3 or len(value) > 100):
                raise HTTPException(400, "Nome deve ter entre 3 e 100 caracteres")
            
            users[email][field] = value
            updated_fields.append(field)
    
    if not updated_fields:
        raise HTTPException(400, "Nenhum campo válido para atualização")
    
    users[email]["updated_at"] = datetime.now().isoformat()
    users[email]["updated_by"] = admin_data["email"]
    
    save_users(users)
    
    global USERS_DB
    USERS_DB = users
    
    log_admin_action(
        admin_data["email"],
        "UPDATE_USER",
        email,
        f"fields={','.join(updated_fields)}"
    )
    
    return {
        "message": "Usuário atualizado com sucesso",
        "updated_fields": updated_fields,
        "user": {
            "email": email,
            "name": users[email].get("name"),
            "role": users[email].get("role"),
            "is_active": users[email].get("is_active")
        }
    }


@app.delete("/api/admin/users/{email}")
def delete_user(email: str, admin_data = Depends(require_admin)):
    """Deleta um usuário (admin only)"""
    # Não permitir que admin delete a si mesmo
    if email == admin_data["email"]:
        raise HTTPException(400, "Você não pode deletar sua própria conta")
    
    users = load_users()
    
    if email not in users:
        raise HTTPException(404, "Usuário não encontrado")
    
    # Backup do usuário antes de deletar
    deleted_user = users[email].copy()
    deleted_user["deleted_at"] = datetime.now().isoformat()
    deleted_user["deleted_by"] = admin_data["email"]
    
    del users[email]
    save_users(users)
    
    global USERS_DB
    USERS_DB = users
    
    log_admin_action(
        admin_data["email"],
        "DELETE_USER",
        email,
        f"name={deleted_user.get('name')}, role={deleted_user.get('role')}"
    )
    
    return {
        "message": "Usuário deletado com sucesso",
        "email": email
    }


@app.get("/api/admin/audit-logs")
def get_audit_logs(
    action: Optional[str] = None,
    target_user: Optional[str] = None,
    limit: int = 100,
    admin_data = Depends(require_admin)
):
    """Retorna logs de auditoria (admin only)"""
    if not AUDIT_LOG_FILE.exists():
        return {"logs": [], "total": 0}
    
    with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        logs = list(reader)
    
    # Aplicar filtros
    if action:
        logs = [log for log in logs if log["action"] == action]
    
    if target_user:
        logs = [log for log in logs if log["target_user"] == target_user]
    
    # Limitar resultados (mais recentes primeiro)
    logs = sorted(logs, key=lambda x: x["timestamp"], reverse=True)[:limit]
    
    return {
        "logs": logs,
        "total": len(logs)
    }

# =========================
# HISTÓRICO
# =========================

def salvar_log(usuario, tipo, codvd, vendedor, registros):
    linha = {
        "timestamp": datetime.now().isoformat(),
        "usuario": usuario,
        "tipo": tipo,
        "codvd": codvd,
        "vendedor": vendedor,
        "registros": registros
    }
    
    with open(LOGS_FILE, "a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "usuario", "tipo", "codvd", "vendedor", "registros"])
        writer.writerow(linha)


@app.get("/api/historico")
def obter_historico(user_data = Depends(get_user)):
    if not LOGS_FILE.exists():
        return []
    
    with open(LOGS_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

# =========================
# HEALTH CHECK
# =========================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "cache": cache_service is not None,
            "users_count": len(USERS_DB)
        }
    }


@app.get("/")
def root():
    return {
        "message": "Chat IA Backend - API Enterprise",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

# =========================
# CONTINUA COM OS OUTROS ENDPOINTS...
# (Mantenha os endpoints de upload, análise, etc. do arquivo original)
# =========================
