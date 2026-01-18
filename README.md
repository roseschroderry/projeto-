# 🚀 Chat IA Corporativo - Sistema Enterprise

> Sistema completo de análise de relatórios com IA, autenticação JWT, e integração com Google Sheets

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## 📋 Sobre o Projeto

Sistema enterprise para ajudar vendedores e administradores a analisar relatórios de vendas, controlar estoque e gerar insights através de IA.

### 🎯 Funcionalidades Principais

- 🔐 **Autenticação JWT** com bcrypt (senhas hasheadas)
- 📊 **Upload e análise** de planilhas Excel/CSV
- 🤖 **Chat com IA** para insights dos dados
- 📈 **Exportação** em PDF e Excel
- 💾 **Cache SQLite** para performance
- 🔄 **Integração Google Sheets** (atualização automática)
- 👥 **Controle de acesso** (admin/user)

---

## 🔧 Instalação Rápida

### 1. Clone e configure

```bash
git clone https://github.com/roseschroderry/projeto-.git
cd projeto-

# Copie as configurações
cp .env.example .env

# Edite o .env e adicione uma SECRET_KEY forte
# Gere uma: python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Instale dependências

```bash
# Criar ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar
cd backend
pip install -r requirements.txt
```

### 3. Execute

```bash
# Backend
cd backend
python -m uvicorn app_secure:app --reload --port 8000

# Frontend (em outro terminal)
python -m http.server 8080
```

Acesse: `http://localhost:8080`

---

## 🔐 Primeiro Acesso

**Usuário padrão:**
- Email: `admin@empresa.com`
- Senha: `Admin@2025!ChangeMe`

⚠️ **IMPORTANTE**: Altere esta senha imediatamente!

---

## ⚙️ Configuração (.env)

```env
# OBRIGATÓRIO: Gere uma chave forte
SECRET_KEY=sua-chave-secreta-aqui

# URLs dos backends
BACKEND_URL=http://localhost:8000

# CORS (separe por vírgula)
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

# Ambiente
ENVIRONMENT=development
DEBUG=True
```

---

## 📁 Estrutura Atualizada

```
projeto-/
├── backend/
│   ├── app_secure.py       # ✅ Backend seguro (USE ESTE)
│   ├── app.py.backup       # Backup do original
│   ├── cache_service.py
│   └── data/
│       ├── users.json      # Usuários (senhas hasheadas)
│       └── cache.db
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   └── config.js           # ✅ URLs centralizadas
│
├── archive/                # ✅ Versões antigas
├── docs/                   # ✅ Documentação
│
├── .env                    # ✅ Config local (NÃO commitar)
├── .env.example            # ✅ Template
├── .gitignore              # ✅ Protege arquivos sensíveis
└── README.md
```

---

## 🔒 Melhorias de Segurança Aplicadas

### ✅ Implementado

- ✅ **Bcrypt** para hash de senhas
- ✅ **JWT** com expiração automática
- ✅ **SECRET_KEY** em variáveis de ambiente
- ✅ **CORS** configurável
- ✅ **.gitignore** protege credenciais
- ✅ Senhas **removidas** dos HTMLs
- ✅ Validação de senha forte (min 8 caracteres)

### ⚠️ Para Produção

1. Use `ENVIRONMENT=production` no .env
2. Configure `ALLOWED_ORIGINS` com domínios específicos
3. Use HTTPS (não HTTP)
4. Troque a SECRET_KEY
5. Configure banco de dados real (PostgreSQL)

---

## 🌐 Deploy (Render.com)

1. Faça push para GitHub
2. Conecte no [Render.com](https://render.com)
3. Configure variáveis de ambiente:
   ```
   SECRET_KEY=<nova-chave-forte>
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://seu-dominio.com
   DEBUG=False
   ```
4. Deploy automático via `render.yaml`

Documentação completa em: [docs/DEPLOY.md](docs/DEPLOY.md)

---

## 📚 Documentação

- [DEPLOY.md](docs/DEPLOY.md) - Guia completo de deploy
- [VARIAVEIS_AMBIENTE.md](docs/VARIAVEIS_AMBIENTE.md) - Todas as variáveis
- [INTEGRACAO_FRONTEND.md](docs/INTEGRACAO_FRONTEND.md) - Integrar frontend

---

## 🆘 Problemas Comuns

**Erro: SECRET_KEY não configurada**
```bash
# Gere uma nova chave
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Cole no .env
```

**Erro: CORS**
```env
# No .env, adicione a origem do frontend
ALLOWED_ORIGINS=http://localhost:8080
```

**Usuário não consegue logar**
```bash
# Delete o arquivo de usuários para recriar o admin padrão
rm backend/data/users.json
# Reinicie o backend
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit (`git commit -m 'Adiciona MinhaFeature'`)
4. Push (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/roseschroderry/projeto-/issues)
- **Documentação**: Pasta `docs/`

---

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE)

---

<div align="center">

**⭐ Se este projeto ajudou você, deixe uma estrela! ⭐**

Projeto atualizado com melhorias de segurança - Janeiro 2026

</div>
