# 🚀 DEPLOY SIMPLIFICADO - 2 SERVIÇOS NO RENDER

## ✅ O que vai para o Render:

### 1. Backend (API FastAPI)
- Pasta: `backend/`
- Autenticação JWT + bcrypt
- Gerenciamento de usuários
- Upload e relatórios

### 2. Frontend (Static Site)
- Pasta: `.` (raiz)
- Login, Dashboard, Admin
- HTML + JavaScript puro

---

## 📋 PASSO A PASSO RÁPIDO

### PASSO 1: Deploy do Backend (5-10 min)

1. Acesse: **https://dashboard.render.com**
2. Clique em **"New +" → "Web Service"**
3. Conecte: `roseschroderry/projeto-`
4. Configure:

```
Name: chat-ai-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app_secure:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

5. **Environment Variables** (clique "Advanced"):

```
SECRET_KEY = [Clique em "Generate"]
ALLOWED_ORIGINS = *
ENVIRONMENT = production
PYTHON_VERSION = 3.11.9
```

6. Clique **"Create Web Service"**
7. ⏰ Aguarde 5-10 minutos
8. 📋 **COPIE A URL** (ex: `https://chat-ai-backend-xyz.onrender.com`)

---

### PASSO 2: Atualizar Frontend com URL do Backend

1. No VS Code, abra [config.js](config.js)

2. Localize a linha 19 e atualize com a URL do backend:

```javascript
production: {
    MAIN_BACKEND: 'https://SUA_URL_BACKEND.onrender.com', // Cole aqui!
    // ...
}
```

3. Salve e faça commit:

```powershell
git add config.js
git commit -m "chore: Adicionar URL do backend em produção"
git push origin main
```

---

### PASSO 3: Deploy do Frontend (2-3 min)

1. No Render Dashboard, clique **"New +" → "Static Site"**
2. Conecte: `roseschroderry/projeto-`
3. Configure:

```
Name: projeto-frontend
Branch: main
Root Directory: [deixe VAZIO]
Build Command: [deixe VAZIO]
Publish Directory: .
```

4. Clique **"Create Static Site"**
5. ⏰ Aguarde 2-3 minutos
6. 📋 **COPIE A URL** (ex: `https://projeto-frontend.onrender.com`)

---

### PASSO 4: Configurar CORS

1. Volte ao serviço **chat-ai-backend** no Render
2. Vá em **"Environment"**
3. Edite `ALLOWED_ORIGINS`:

```
https://SEU_FRONTEND_URL.onrender.com
```

4. Clique **"Save Changes"** (backend reiniciará automaticamente)

---

## 🎯 TESTAR O SISTEMA

1. Acesse: `https://SEU_FRONTEND_URL.onrender.com/login.html`

2. Faça login com:
   - **Email**: `admin@empresa.com`
   - **Senha**: `Admin@2025!ChangeMe`

3. ✅ Se funcionar: **SUCESSO!**

---

## 📊 SUAS URLs FINAIS

Anote aqui:

```
Backend:  https://_________________________.onrender.com
Frontend: https://_________________________.onrender.com
API Docs: https://_________________________.onrender.com/docs
```

---

## ⚠️ AVISOS IMPORTANTES

### Plano FREE do Render:

- ⏰ **Serviços dormem após 15 min sem uso**
  - Primeiro acesso demora 30-50 segundos
  
- 💾 **Disco não persiste**
  - Arquivos enviados são perdidos após restart
  - Use S3/Cloudinary para uploads permanentes

- 🔄 **Deploy automático**
  - A cada `git push`, Render faz novo deploy

### Segurança:

⚠️ **ALTERE A SENHA PADRÃO IMEDIATAMENTE!**

Após primeiro login:
1. Vá em "Gerenciar Usuários"
2. Edite o admin
3. Mude a senha para algo seguro

---

## 🆘 PROBLEMAS COMUNS

### "Erro de conexão com backend"
- ✅ Aguarde 30-50 segundos (serviço acordando)
- ✅ Verifique URL em [config.js](config.js)
- ✅ Veja logs no Render Dashboard

### "401 Não autorizado"
- ✅ Limpe cache: `localStorage.clear()` no console
- ✅ Faça login novamente

### "CORS error"
- ✅ Confirme `ALLOWED_ORIGINS` no backend
- ✅ Limpe cache do navegador (Ctrl+Shift+Delete)

### "502 Bad Gateway"
- ✅ Backend dormindo, aguarde
- ✅ Veja logs no Render para erros de startup

---

## 🎉 PRONTO!

Sistema online com:
- ✅ Autenticação segura (JWT + bcrypt)
- ✅ Rate limiting (5 tentativas/15min)
- ✅ Gerenciamento de usuários
- ✅ Audit logging
- ✅ Dashboard funcional

**Próximos passos:**
1. Altere senha padrão
2. Crie usuários específicos
3. Personalize o sistema
4. Configure storage externo para uploads

---

## 📱 MONITORAMENTO

**Ver logs do backend:**
- Render Dashboard → chat-ai-backend → Logs

**Ver logs do frontend:**
- Navegador → F12 → Console

**Status dos serviços:**
- Render Dashboard → Overview

---

## 🔧 ATUALIZAR O SISTEMA

Para fazer mudanças:

```powershell
# 1. Edite os arquivos
# 2. Commit
git add .
git commit -m "feat: Nova funcionalidade"

# 3. Push (deploy automático)
git push origin main

# 4. Aguarde 5-10 min (backend) ou 2-3 min (frontend)
```

---

## 💰 UPGRADE (OPCIONAL)

**Render Pro: $7/mês por serviço**
- ✅ Sempre online (sem sleep)
- ✅ Disco persistente (100GB)
- ✅ Mais memória e CPU
- ✅ Deploy prioritário
- ✅ Suporte técnico

**Total: $14/mês (backend + frontend)**

---

**Documentação completa:** [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md)
