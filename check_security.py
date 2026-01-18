#!/usr/bin/env python3
"""
Script de Verificação de Segurança
Verifica se todas as configurações de segurança estão corretas
"""

import os
import sys
from pathlib import Path
import re

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

def check(message, condition, recommendation=""):
    """Verifica uma condição e imprime resultado"""
    if condition:
        print(f"{GREEN}✅ {message}{END}")
        return True
    else:
        print(f"{RED}❌ {message}{END}")
        if recommendation:
            print(f"{YELLOW}   💡 {recommendation}{END}")
        return False

def warn(message, recommendation=""):
    """Imprime um aviso"""
    print(f"{YELLOW}⚠️  {message}{END}")
    if recommendation:
        print(f"   💡 {recommendation}")

def info(message):
    """Imprime uma informação"""
    print(f"{BLUE}ℹ️  {message}{END}")

def main():
    print(f"\n{BLUE}{'='*60}")
    print("🔐 VERIFICAÇÃO DE SEGURANÇA DO PROJETO")
    print(f"{'='*60}{END}\n")
    
    issues_count = 0
    warnings_count = 0
    
    # 1. Verificar .env
    print(f"\n{BLUE}[1] Verificando arquivo .env{END}")
    env_exists = check(
        "Arquivo .env existe",
        Path(".env").exists(),
        "Execute: cp .env.example .env"
    )
    
    if env_exists:
        with open(".env", "r", encoding="utf-8") as f:
            env_content = f.read()
            
        # Verificar SECRET_KEY
        has_secret = check(
            "SECRET_KEY configurada no .env",
            "SECRET_KEY=" in env_content and "your-secret-key-here" not in env_content,
            "Gere uma: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )
        if not has_secret:
            issues_count += 1
            
        # Verificar ALLOWED_ORIGINS
        has_origins = check(
            "ALLOWED_ORIGINS configurada",
            "ALLOWED_ORIGINS=" in env_content,
            "Adicione: ALLOWED_ORIGINS=http://localhost:8080"
        )
        if not has_origins:
            issues_count += 1
            
        # Verificar ambiente
        if "ENVIRONMENT=production" in env_content:
            warn(
                "Ambiente configurado como PRODUCTION",
                "Certifique-se que DEBUG=False e CORS está restrito"
            )
            warnings_count += 1
    else:
        issues_count += 1
    
    # 2. Verificar .gitignore
    print(f"\n{BLUE}[2] Verificando .gitignore{END}")
    gitignore_exists = check(
        "Arquivo .gitignore existe",
        Path(".gitignore").exists(),
        "O .gitignore foi criado durante a correção"
    )
    
    if gitignore_exists:
        with open(".gitignore", "r", encoding="utf-8") as f:
            gitignore_content = f.read()
            
        check(
            ".env está no .gitignore",
            ".env" in gitignore_content,
            "Adicione '.env' ao .gitignore"
        )
        
        check(
            "*.db está no .gitignore",
            "*.db" in gitignore_content or "*.sqlite" in gitignore_content,
            "Adicione '*.db' ao .gitignore"
        )
    else:
        issues_count += 1
    
    # 3. Verificar backend
    print(f"\n{BLUE}[3] Verificando Backend{END}")
    
    backend_secure = check(
        "Backend seguro (app_secure.py) existe",
        Path("backend/app_secure.py").exists(),
        "O arquivo foi criado durante a correção"
    )
    
    if backend_secure:
        with open("backend/app_secure.py", "r", encoding="utf-8") as f:
            backend_content = f.read()
            
        check(
            "Backend usa bcrypt",
            "import bcrypt" in backend_content,
            "Instale: pip install bcrypt"
        )
        
        check(
            "Backend carrega .env",
            "load_dotenv()" in backend_content,
            "Adicione: from dotenv import load_dotenv"
        )
        
        check(
            "Backend valida SECRET_KEY",
            "SECRET_KEY = os.getenv" in backend_content,
            "Backend deve ler SECRET_KEY do ambiente"
        )
    else:
        issues_count += 1
    
    # Verificar se app.py original tem senhas
    if Path("backend/app.py").exists():
        with open("backend/app.py", "r", encoding="utf-8") as f:
            app_content = f.read()
            
        if '"password": "' in app_content and "hash" not in app_content.lower():
            warn(
                "backend/app.py ainda contém senhas em texto plano",
                f"Use backend/app_secure.py ao invés"
            )
            warnings_count += 1
    
    # 4. Verificar HTMLs
    print(f"\n{BLUE}[4] Verificando arquivos HTML{END}")
    
    html_files = list(Path(".").glob("*.html"))
    passwords_found = []
    
    for html_file in html_files:
        if html_file.name.startswith("test-") or "archive" in str(html_file):
            continue
            
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Procurar por senhas hardcoded
        password_pattern = r'value=["\']([^"\']*(?:admin|senha|password|123)[^"\']*)["\']\s+(?:type=["\']password|id=["\'].*[Pp]assword)'
        matches = re.findall(password_pattern, content, re.IGNORECASE)
        
        if matches:
            passwords_found.append((html_file.name, matches))
    
    if passwords_found:
        for filename, passwords in passwords_found:
            warn(
                f"Possível senha hardcoded em {filename}: {passwords[0][:20]}...",
                f"Remova valores padrão de campos de senha"
            )
            warnings_count += 1
    else:
        check("Nenhuma senha encontrada em HTMLs", True)
    
    # 5. Verificar dependências
    print(f"\n{BLUE}[5] Verificando dependências{END}")
    
    if Path("backend/requirements.txt").exists():
        with open("backend/requirements.txt", "r", encoding="utf-8") as f:
            requirements = f.read()
            
        check(
            "bcrypt está nas dependências",
            "bcrypt" in requirements,
            "Adicione: bcrypt==4.2.1"
        )
        
        check(
            "python-dotenv está nas dependências",
            "python-dotenv" in requirements,
            "Adicione: python-dotenv==1.0.1"
        )
        
        check(
            "python-jose está nas dependências",
            "python-jose" in requirements,
            "Adicione: python-jose[cryptography]"
        )
    else:
        warn("requirements.txt não encontrado")
        warnings_count += 1
    
    # 6. Verificar estrutura
    print(f"\n{BLUE}[6] Verificando estrutura do projeto{END}")
    
    check("Pasta archive/ existe", Path("archive").exists())
    check("Pasta docs/ existe", Path("docs").exists())
    check("config.js existe", Path("config.js").exists())
    check("README.md atualizado existe", Path("README.md").exists())
    
    # 7. Verificar Git
    print(f"\n{BLUE}[7] Verificando Git{END}")
    
    if Path(".git").exists():
        # Verificar se .env está commitado
        import subprocess
        try:
            result = subprocess.run(
                ["git", "ls-files", ".env"],
                capture_output=True,
                text=True
            )
            
            if result.stdout.strip():
                warn(
                    ".env está versionado no Git!",
                    "Execute: git rm --cached .env && git commit -m 'Remove .env'"
                )
                warnings_count += 1
            else:
                check(".env não está versionado no Git", True)
        except:
            info("Não foi possível verificar Git")
    
    # Resumo
    print(f"\n{BLUE}{'='*60}")
    print("📊 RESUMO DA VERIFICAÇÃO")
    print(f"{'='*60}{END}\n")
    
    if issues_count == 0 and warnings_count == 0:
        print(f"{GREEN}✅ TUDO OK! Projeto seguro e pronto para uso.{END}\n")
        return 0
    elif issues_count == 0:
        print(f"{YELLOW}⚠️  {warnings_count} aviso(s) encontrado(s).{END}")
        print(f"{YELLOW}   Revise as recomendações acima.{END}\n")
        return 0
    else:
        print(f"{RED}❌ {issues_count} problema(s) crítico(s) encontrado(s).{END}")
        if warnings_count > 0:
            print(f"{YELLOW}⚠️  {warnings_count} aviso(s) adicional(is).{END}")
        print(f"{RED}   Corrija os problemas antes de continuar.{END}\n")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Verificação cancelada.{END}")
        sys.exit(1)
