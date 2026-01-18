# 🎯 GUIA DE MIGRAÇÃO PARA VERSÃO SEGURA

## ✅ O que foi alterado

### Arquivos Criados
1. ✅ `.env` - Configurações locais com SECRET_KEY segura
2. ✅ `.env.example` - Template de configuração
3. ✅ `.gitignore` - Proteção de arquivos sensíveis
4. ✅ `config.js` - Configuração centralizada do frontend
5. ✅ `backend/app_secure.py` - Backend com segurança implementada
6. ✅ `README.md` - Documentação atualizada

### Arquivos Modificados
1. ✅ `app-premium.html` - Senhas removidas
2. ✅ `app-v2.html` - Senhas removidas
3. ✅ `backend/requirements.txt` - Adicionado reportlab

### Arquivos Organizados
1. ✅ Versões antigas movidas para `archive/`
2. ✅ Documentação movida para `docs/`
3. ✅ Backup do original: `backend/app.py.backup`

---

## 🚀 Como Começar a Usar

### Opção 1: Usar Backend Seguro (Recomendado)

```bash
# 1. Verificar se .env está configurado
cat .env  # ou type .env no Windows

# 2. Instalar dependências (se ainda não fez)
cd backend
pip install -r requirements.txt

# 3. Iniciar backend SEGURO
python -m uvicorn app_secure:app --reload --port 8000
```

### Opção 2: Migrar app.py Existente

Se você quer continuar usando `app.py`, copie as alterações de `app_secure.py`:

```bash
# Fazer backup
cp backend/app.py backend/app.py.old

# Copiar versão segura
cp backend/app_secure.py backend/app.py
```

---

## 🔐 Checklist de Segurança

Antes de ir para produção, verifique:

- [ ] `.env` existe e tem SECRET_KEY forte
- [ ] `.env` está no `.gitignore` (não vai para o GitHub)
- [ ] CORS configurado corretamente (`ALLOWED_ORIGINS`)
- [ ] Senha padrão do admin foi alterada
- [ ] `ENVIRONMENT=production` no .env de produção
- [ ] `DEBUG=False` em produção
- [ ] Backend rodando com `app_secure.py`
- [ ] HTTPS configurado (Render faz isso automaticamente)

---

## 📝 Variáveis de Ambiente Obrigatórias

No arquivo `.env`:

```env
# MUDE ESTES VALORES!
SECRET_KEY=dvOqtlpck99lN8a4i0tCA66IyljknSp4A2oaF8tUVZc  # Já gerado para você
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

# Ajuste conforme necessário
ENVIRONMENT=development
DEBUG=True
BACKEND_URL=http://localhost:8000
```

No **Render.com** (produção), configure:

```env
SECRET_KEY=<gere uma NOVA para produção>
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://seu-dominio.onrender.com,https://seu-frontend.com
```

---

## 🔄 Diferenças Principais

### Antes (app.py)
```python
# ❌ Senhas em texto plano
USERS_DB = {
    "admin@teste.com": {"password": "123456", ...}
}

# ❌ SECRET_KEY hardcoded
SECRET_KEY = "SECRET_EMPRESA_CHAT_AI_2025"

# ❌ Comparação direta
if user["password"] != password:
    raise HTTPException(401)
```

### Depois (app_secure.py)
```python
# ✅ Senhas hasheadas com bcrypt
users = load_users()  # Lê de users.json
{"password": "$2b$12$..."} 

# ✅ SECRET_KEY do ambiente
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY não configurada!")

# ✅ Verificação segura
if not verify_password(password, user["password"]):
    raise HTTPException(401)
```

---

## 🛠️ Comandos Úteis

### Gerar Nova SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Testar Backend
```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"Admin@2025!ChangeMe"}'
```

### Ver Logs
```bash
# Backend logs
tail -f backend/data/logs.csv

# Usuários cadastrados
cat backend/data/users.json
```

---

## 🔧 Resolução de Problemas

### "SECRET_KEY não configurada"
```bash
# Verifique se .env existe
ls -la .env  # ou dir .env

# Se não existir, copie do exemplo
cp .env.example .env

# Gere uma chave forte
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### "ModuleNotFoundError: No module named 'dotenv'"
```bash
pip install python-dotenv
```

### "Credenciais inválidas" após migração
O arquivo `users.json` precisa ser recriado com senhas hasheadas:

```bash
# Delete o arquivo antigo
rm backend/data/users.json

# Reinicie o backend (vai recriar com usuário admin)
python -m uvicorn app_secure:app --reload
```

### CORS Error
No `.env`, adicione a origem do frontend:
```env
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

---

## 📦 Deploy no Render

### 1. Atualizar render.yaml

Certifique-se que está usando `app_secure.py`:

```yaml
services:
  - type: web
    name: chat-ai-backend
    rootDir: backend
    startCommand: uvicorn app_secure:app --host 0.0.0.0 --port $PORT
```

### 2. Configurar Environment Variables no Render

No dashboard do Render, adicione:

```
SECRET_KEY = <gere uma NOVA chave forte>
ENVIRONMENT = production
DEBUG = False
ALLOWED_ORIGINS = https://seu-app.onrender.com
```

### 3. Deploy

```bash
git add .
git commit -m "Aplicar melhorias de segurança"
git push origin main
```

O Render vai fazer deploy automático.

---

## ✅ Teste Final

Após subir o backend:

1. **Health Check**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Deve retornar: `{"status": "healthy", ...}`

2. **Login**
   - Usuário: `admin@empresa.com`
   - Senha: `Admin@2025!ChangeMe`
   - Deve retornar um token JWT

3. **Trocar Senha**
   Use o endpoint `/api/auth/change-password`

---

## 📞 Precisa de Ajuda?

- Verifique os logs: `backend/data/logs.csv`
- Veja a documentação completa no `README.md`
- Abra uma issue no GitHub

---

**✨ Parabéns! Seu projeto agora está mais seguro!**

Data da migração: Janeiro 2026
