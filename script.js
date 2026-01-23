/* ==================================================
   CONFIGURAÇÃO GERAL
================================================== */

const isLocal =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';

const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://chat-ai-backend-1.onrender.com';

let currentUser = null;
let authToken = null;
let useBackend = false;

/* ==================================================
   HELPERS STORAGE
================================================== */

function getUsers() {
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
}

function setUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

/* ==================================================
   TOGGLE PASSWORD VISIBILITY
================================================== */

window.togglePasswordVisibility = function(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = passwordInput.parentElement.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`;
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
    }
};

/* ==================================================
   SWITCH AUTH TAB
================================================== */

window.switchAuthTab = function(tab) {
    // Atualiza botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Atualiza conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const targetContent = document.getElementById(tab + 'Form');
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
    }
};

/* ==================================================
   REGISTER
================================================== */

window.doRegister = function() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        alert('Preencha todos os campos');
        return;
    }
    
    if (name.length < 3) {
        alert('Nome deve ter no mínimo 3 caracteres');
        return;
    }
    
    if (password.length < 6) {
        alert('Senha deve ter no mínimo 6 caracteres');
        return;
    }
    
    const users = getUsers();
    
    // Verificar se email já existe
    if (users.find(u => u.email === email)) {
        alert('Email já cadastrado');
        return;
    }
    
    // Adicionar novo usuário
    const newUser = {
        name: name,
        email: email,
        password: password,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    setUsers(users);
    
    alert('Conta criada com sucesso! Faça login para continuar.');
    
    // Limpar campos
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    
    // Voltar para tab de login
    document.querySelector('[onclick*="login"]').click();
};

/* ==================================================
   LOGIN
================================================== */

window.doLogin = async function () {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    if (!email || !password) {
        alert('Preencha email e senha');
        return;
    }

    // MODO TESTE: Criar usuário admin automaticamente se não existir
    const users = getUsers();
    if (users.length === 0) {
        setUsers([
            { name: 'Admin', email: 'admin@admin.com', password: '123456', role: 'admin' },
            { name: 'Usuário Teste', email: 'teste@teste.com', password: '123456', role: 'user' }
        ]);
        console.log('✅ Usuários de teste criados: admin@admin.com / teste@teste.com (senha: 123456)');
    }

    // LOGIN LOCAL
    const localUsers = getUsers();
    const user = localUsers.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Credenciais inválidas');
        return;
    }

    currentUser = user;
    authToken = 'local_' + Date.now();
    useBackend = false;

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', authToken);
    storage.setItem('user', JSON.stringify(user));
    storage.setItem('use_backend', 'false');

    showMainApp();
};

/* ==================================================
   APP PRINCIPAL
================================================== */

function showMainApp() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent =
        currentUser.name.charAt(0).toUpperCase();

    if (currentUser.role === 'admin') {
        document.getElementById('adminSection').style.display = 'block';
    }

    // Atualizar perfil
    document.getElementById('perfilNome').textContent = currentUser.name;
    document.getElementById('perfilEmail').textContent = currentUser.email;
    document.getElementById('perfilAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('perfilRole').textContent = 
        currentUser.role === 'admin' ? 'Administrador' : 
        currentUser.role === 'vendedor' ? 'Vendedor' : 'Usuário';

    // Inicializar funcionalidades avançadas
    updateDashboard();
    renderUsers();
    
    // Carregar funcionalidades extras se features.js estiver carregado
    setTimeout(() => {
        if (typeof enhanceDashboard === 'function') {
            enhanceDashboard();
            initUpload();
            initSheets();
            initReports();
            initChat();
            showNotification(`Bem-vindo, ${currentUser.name}!`, 'success');
        }
    }, 100);
}

/* ==================================================
   DASHBOARD
================================================== */

function updateDashboard() {
    const totalUsers = getUsers().length;
    const el = document.getElementById('totalUsers');
    if (el) el.textContent = totalUsers;
}

/* ==================================================
   USUÁRIOS (CRUD)
================================================== */

function renderUsers() {
    const tbody = document.querySelector('#userTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const users = getUsers();

    users.forEach((u, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button class="btn-primary" onclick="editUser(${i})">Editar</button>
                <button class="btn-primary" onclick="deleteUser(${i})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateDashboard();
}

window.showAddUserModal = function () {
    const name = prompt('Nome:');
    if (!name) return;

    const email = prompt('Email:');
    if (!email) return;

    const password = prompt('Senha (mín 6):');
    if (!password || password.length < 6) return;

    const role = prompt('Tipo (admin/user):', 'user');

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('Email já existe');
        return;
    }

    users.push({ name, email, password, role });
    setUsers(users);
    renderUsers();
};

window.editUser = function (idx) {
    const users = getUsers();
    const user = users[idx];

    const name = prompt('Nome:', user.name);
    if (!name) return;

    const role = prompt('Tipo (admin/user):', user.role);

    user.name = name;
    user.role = role === 'admin' ? 'admin' : 'user';

    setUsers(users);
    renderUsers();
};

window.deleteUser = function (idx) {
    if (!confirm('Excluir usuário?')) return;
    const users = getUsers();
    users.splice(idx, 1);
    setUsers(users);
    renderUsers();
};

/* ==================================================
   NAVEGAÇÃO
================================================== */

window.navigateTo = function (e, section) {
    e.preventDefault();

    document.querySelectorAll('.content-section')
        .forEach(s => s.classList.add('hidden'));

    document.getElementById(section + 'Section')
        .classList.remove('hidden');

    document.querySelectorAll('.sidebar-link')
        .forEach(l => l.classList.remove('active'));

    e.currentTarget.classList.add('active');

    closeMobileMenu();
};

/* ==================================================
   MOBILE MENU
================================================== */

window.toggleMobileMenu = function () {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.getElementById('mobileOverlay').classList.toggle('active');
};

window.closeMobileMenu = function () {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('mobileOverlay').classList.remove('active');
};
