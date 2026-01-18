# 🚀 GUIA DE DEPLOY - SISTEMA COM AUTENTICAÇÃO SEGURA

## 📋 Visão Geral

Este guia irá te ajudar a colocar o sistema online no **Render.com** (plano gratuito).

**Serviços a serem implantados:**
1. Backend (FastAPI com autenticação JWT e bcrypt)
2. Frontend (HTML/JS estático)

---

## ✅ PRÉ-REQUISITOS

- [ ] Conta no GitHub
- [ ] Repositório no GitHub com o código
- [ ] Conta no Render.com (grátis)

---

## 🔧 PASSO 1: PREPARAR O REPOSITÓRIO

### 1.1 Verificar Git Status

```powershell
cd C:\Users\Ataq\Desktop\projeto-
git status
```

### 1.2 Adicionar Arquivos e Commitar

```powershell
# Adicionar todos os arquivos
git add .

# Criar commit
git commit -m "feat: Sistema completo com autenticação segura e gerenciamento de usuários

- Backend seguro com JWT e bcrypt
- Rate limiting (5 tentativas/15min)
- Refresh tokens
- Gerenciamento de usuários (CRUD completo)
- Endpoints admin-only protegidos
- Audit logging
- Frontend atualizado com config.js
- Configurações para deploy no Render"

# Push para GitHub
git push origin main
```

Se ainda não tiver repositório remoto:

```powershell
git remote add origin https://github.com/roseschroderry/projeto-.git
git branch -M main
git push -u origin main
```

---

## 🌐 PASSO 2: DEPLOY DO BACKEND NO RENDER

### 2.1 Acessar Render Dashboard

1. Acesse: https://dashboard.render.com
2. Faça login com sua conta GitHub
3. Clique em **"New +"** → **"Web Service"**

### 2.2 Conectar Repositório

1. Clique em **"Connect a repository"**
2. Selecione seu repositório: `roseschroderry/projeto-`
3. Clique em **"Connect"**

### 2.3 Configurar Serviço Backend

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `chat-ai-backend` |
| **Region** | Oregon (US West) ou Frankfurt (EU Central) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn app_secure:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### 2.4 Adicionar Environment Variables

Clique em **"Advanced"** e adicione:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | (Clique em "Generate" para criar automaticamente) |
| `ALLOWED_ORIGINS` | `*` (temporário, atualizaremos depois) |
| `ENVIRONMENT` | `production` |
| `PYTHON_VERSION` | `3.11.9` |

### 2.5 Criar Serviço

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 minutos)
3. Copie a URL gerada (ex: `https://chat-ai-backend.onrender.com`)

---

## 🎨 PASSO 3: DEPLOY DO FRONTEND NO RENDER

### 3.1 Atualizar config.js com URL do Backend

Antes de fazer o deploy do frontend, atualize o arquivo `config.js`:

```javascript
production: {
    MAIN_BACKEND: 'https://SEU_BACKEND_URL.onrender.com', // Cole a URL do passo 2.5
    // ...
}
```

Depois:

```powershell
git add config.js
git commit -m "chore: Atualizar URL do backend para produção"
git push origin main
```

### 3.2 Criar Static Site no Render

1. No Render Dashboard, clique em **"New +"** → **"Static Site"**
2. Conecte o mesmo repositório: `roseschroderry/projeto-`

### 3.3 Configurar Static Site

| Campo | Valor |
|-------|-------|
| **Name** | `projeto-frontend` |
| **Branch** | `main` |
| **Root Directory** | (deixe vazio) |
| **Build Command** | (deixe vazio) |
| **Publish Directory** | `.` |

### 3.4 Criar Site

1. Clique em **"Create Static Site"**
2. Aguarde o deploy (2-3 minutos)
3. Copie a URL gerada (ex: `https://projeto-frontend.onrender.com`)

---

## 🔒 PASSO 4: CONFIGURAR CORS

Agora que temos a URL do frontend, precisamos atualizar o CORS do backend:

1. No Render Dashboard, acesse o serviço **chat-ai-backend**
2. Vá em **"Environment"**
3. Edite a variável `ALLOWED_ORIGINS`:
   ```
   https://SEU_FRONTEND_URL.onrender.com
   ```
4. Clique em **"Save Changes"**
5. O backend irá reiniciar automaticamente

---

## 🎯 PASSO 5: TESTAR O SISTEMA

### 5.1 Acessar Frontend

Abra: `https://SEU_FRONTEND_URL.onrender.com/login.html`

### 5.2 Fazer Login

Use as credenciais padrão:
- **Email**: `admin@empresa.com`
- **Senha**: `Admin@2025!ChangeMe`

**⚠️ IMPORTANTE:** Altere a senha padrão imediatamente após o primeiro login!

### 5.3 Testar Funcionalidades

- [ ] Login funciona
- [ ] Dashboard carrega métricas
- [ ] Gerenciamento de usuários (se admin)
- [ ] Upload de arquivos
- [ ] Geração de relatórios

---

## 📊 PASSO 6: MONITORAMENTO

### 6.1 Ver Logs do Backend

1. No Render Dashboard, acesse **chat-ai-backend**
2. Clique na aba **"Logs"**
3. Monitore erros e requisições

### 6.2 Ver Logs do Frontend

1. No navegador, abra **DevTools** (F12)
2. Vá na aba **"Console"**
3. Verifique erros JavaScript

---

## ⚠️ LIMITAÇÕES DO PLANO FREE

- ⏰ **Serviços dormem após 15 minutos sem uso**
  - Primeiro acesso pode demorar 30-50 segundos
  
- 💾 **Disco efêmero**
  - Arquivos enviados NÃO persistem
  - Use storage externo (S3, Cloudinary) para uploads

- 🔄 **750 horas/mês por serviço**
  - Suficiente para testes e projetos pessoais

- 🌐 **Deploy automático**
  - A cada `git push`, o Render faz novo deploy

---

## 🔐 SEGURANÇA EM PRODUÇÃO

### ✅ O que já está implementado:

- [x] Senhas com bcrypt (salt + hash)
- [x] JWT com SECRET_KEY segura
- [x] Rate limiting (5 tentativas/15min)
- [x] Refresh tokens (7 dias)
- [x] Validação de email RFC 5322
- [x] CORS configurado
- [x] Audit logging para ações admin

### ⚠️ Ações Recomendadas:

1. **Alterar senha padrão**
   ```
   Email: admin@empresa.com
   Senha antiga: Admin@2025!ChangeMe
   Senha nova: [senha forte única]
   ```

2. **Criar usuários específicos**
   - Não use a conta admin para operações diárias
   - Crie usuários com role "vendedor" ou "user"

3. **Backup periódico**
   ```powershell
   # Fazer backup dos usuários
   curl https://SEU_BACKEND.onrender.com/api/admin/users > backup_users.json
   ```

4. **Monitorar logs de auditoria**
   ```powershell
   # Ver logs administrativos
   curl https://SEU_BACKEND.onrender.com/api/admin/audit-logs
   ```

---

## 🆘 TROUBLESHOOTING

### Problema: "Erro de conexão com o backend"

**Solução:**
1. Verifique se o backend está acordado (acesse a URL do backend diretamente)
2. Aguarde 30-50 segundos para o serviço acordar
3. Verifique os logs no Render Dashboard

### Problema: "Não autorizado" (401)

**Solução:**
1. Limpe localStorage: `localStorage.clear()`
2. Faça login novamente
3. Verifique se o token não expirou (60 minutos)

### Problema: "CORS error"

**Solução:**
1. Confirme que `ALLOWED_ORIGINS` está configurada com a URL do frontend
2. Reinicie o backend no Render
3. Limpe cache do navegador (Ctrl+Shift+Delete)

### Problema: "502 Bad Gateway"

**Solução:**
1. Serviço está dormindo, aguarde acordar
2. Se persistir, verifique logs para ver se há erro no startup
3. Confirme que `requirements.txt` tem todas as dependências

---

## 📝 CHECKLIST FINAL

- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] CORS configurado corretamente
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Senha padrão alterada
- [ ] URLs de produção configuradas em `config.js`
- [ ] Testes de funcionalidades principais realizados

---

## 🚀 UPGRADE (OPCIONAL)

Para serviço sempre online e recursos adicionados:

**Render Pro:** $7/mês por serviço
- ✅ Sempre online (sem sleep)
- ✅ Disco persistente
- ✅ Mais memória e CPU
- ✅ Deploy prioritário

---

## 📞 SUPORTE

**Documentação Render:**
- https://render.com/docs

**Repositório:**
- https://github.com/roseschroderry/projeto-

**Issues:**
- Abra uma issue no GitHub para reportar problemas

---

## 🎉 PRONTO!

Seu sistema está online e funcionando! 

**URLs:**
- Frontend: `https://SEU_FRONTEND.onrender.com`
- Backend API: `https://SEU_BACKEND.onrender.com`
- Documentação API: `https://SEU_BACKEND.onrender.com/docs`

**Próximos passos:**
1. Personalize o sistema
2. Adicione mais usuários
3. Configure storage externo para uploads
4. Monitore uso e performance
