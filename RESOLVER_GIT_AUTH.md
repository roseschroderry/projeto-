# 🔐 RESOLVER PROBLEMA DE AUTENTICAÇÃO DO GIT

## ❌ Erro Atual

```
remote: Permission to roseschroderry/projeto-.git denied to robertdoherty701-stack.
fatal: unable to access 'https://github.com/roseschroderry/projeto-.git/': The requested URL returned error: 403
```

## ✅ SOLUÇÃO 1: Usar Token de Acesso Pessoal (Recomendado)

### Passo 1: Criar Personal Access Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configure:
   - **Note**: `Token para projeto-`
   - **Expiration**: 90 days (ou No expiration)
   - **Scopes**: Marque `repo` (acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você só verá uma vez!)

### Passo 2: Configurar Git Credential Manager

Execute no PowerShell:

```powershell
cd C:\Users\Ataq\Desktop\projeto-

# Configurar credenciais
git config --global credential.helper manager-core

# Fazer push novamente (irá pedir credenciais)
git push origin main
```

Quando solicitar:
- **Username**: `roseschroderry`
- **Password**: [cole o token gerado]

---

## ✅ SOLUÇÃO 2: Usar SSH (Alternativa)

### Passo 1: Gerar chave SSH

```powershell
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "seu_email@example.com"

# Pressione Enter 3 vezes (aceitar defaults)
```

### Passo 2: Adicionar chave ao GitHub

```powershell
# Copiar chave pública
Get-Content ~\.ssh\id_ed25519.pub | Set-Clipboard
```

1. Acesse: https://github.com/settings/keys
2. Clique em **"New SSH key"**
3. Cole a chave
4. Clique em **"Add SSH key"**

### Passo 3: Alterar remote para SSH

```powershell
cd C:\Users\Ataq\Desktop\projeto-

# Verificar remote atual
git remote -v

# Alterar para SSH
git remote set-url origin git@github.com:roseschroderry/projeto-.git

# Fazer push
git push origin main
```

---

## ✅ SOLUÇÃO 3: Mudar Usuário do Git (Mais Simples)

```powershell
cd C:\Users\Ataq\Desktop\projeto-

# Configurar usuário correto para este repositório
git config user.name "roseschroderry"
git config user.email "seu_email@example.com"

# Limpar credenciais antigas
git credential reject
# Cole: url=https://github.com/roseschroderry/projeto-.git
# Pressione Enter e depois Ctrl+Z e Enter

# Tentar push novamente
git push origin main
```

---

## 🔍 VERIFICAR CONFIGURAÇÃO

```powershell
# Ver configuração atual
git config --list

# Ver remote
git remote -v

# Ver usuário configurado
git config user.name
git config user.email
```

---

## 📝 APÓS RESOLVER

Depois que o push funcionar:

```powershell
# Verificar se foi enviado
git log --oneline -1

# Conferir no GitHub
# Abra: https://github.com/roseschroderry/projeto-
```

---

## 🎯 PRÓXIMO PASSO: DEPLOY NO RENDER

Depois que o código estiver no GitHub:

1. Acesse: https://dashboard.render.com
2. Siga as instruções em: `GUIA_DEPLOY_PRODUCAO.md`
3. Crie os serviços (backend + frontend)
4. Configure as variáveis de ambiente
5. Teste o sistema online!

---

## 🆘 SE AINDA TIVER PROBLEMA

Execute:

```powershell
# Ver qual usuário está autenticado
git config --global --list | Select-String "user"

# Remover credenciais do Windows
cmdkey /list | Select-String "github"
# Se aparecer, remova com:
cmdkey /delete:git:https://github.com
```

Depois tente novamente a **SOLUÇÃO 1** (Token de Acesso).
