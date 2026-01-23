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
   LOGIN
================================================== */

window.doLogin = async function () {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    const backend = document.getElementById('useBackendApi').checked;

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

    if (backend) {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) throw new Error('Credenciais inválidas');

            const data = await res.json();
            currentUser = data.user;
            authToken = data.token;
            useBackend = true;

            localStorage.setItem('api_token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('use_backend', 'true');

            showMainApp();
            return;

        } catch (err) {
            alert('Erro no backend: ' + err.message);
        }
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
