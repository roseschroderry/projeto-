/* ==================================================
   FUNCIONALIDADES AVANÇADAS
================================================== */

/* ==================================================
   UPLOAD DE ARQUIVOS COM DRAG & DROP
================================================== */

function initUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.querySelector('.upload-area');
    const filesList = document.getElementById('filesList');
    
    if (!uploadArea) return;

    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.background = '#FEE2E2';
            uploadArea.style.borderColor = '#DC2626';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.background = '';
            uploadArea.style.borderColor = '';
        }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, false);

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        
        [...files].forEach((file, index) => {
            const fileObj = {
                id: Date.now() + index,
                name: file.name,
                size: formatBytes(file.size),
                type: file.type || 'desconhecido',
                date: new Date().toLocaleString('pt-BR')
            };
            
            uploadedFiles.push(fileObj);
            
            // Simulação de upload
            showUploadProgress(file.name);
        });
        
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        setTimeout(() => {
            renderUploadedFiles();
            showNotification('✅ Arquivos enviados com sucesso!', 'success');
        }, 1500);
    }

    function showUploadProgress(filename) {
        const progress = document.createElement('div');
        progress.className = 'upload-progress';
        progress.innerHTML = `
            <p>📤 Enviando: ${filename}</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        filesList.appendChild(progress);
        
        setTimeout(() => progress.remove(), 1500);
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

function renderUploadedFiles() {
    const filesList = document.getElementById('filesList');
    if (!filesList) return;
    
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    
    if (files.length === 0) {
        filesList.innerHTML = '<p style="color: #64748B;">Nenhum arquivo enviado ainda</p>';
        return;
    }
    
    filesList.innerHTML = `
        <h3 style="margin-bottom: 16px;">Arquivos Enviados (${files.length})</h3>
        <div class="files-grid">
            ${files.map(file => `
                <div class="file-card">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">${file.size} • ${file.date}</div>
                    </div>
                    <button class="btn-delete" onclick="deleteFile(${file.id})">🗑️</button>
                </div>
            `).join('')}
        </div>
    `;
}

window.deleteFile = function(id) {
    if (!confirm('Excluir arquivo?')) return;
    
    let files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    files = files.filter(f => f.id !== id);
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
    
    renderUploadedFiles();
    showNotification('Arquivo excluído', 'info');
};

/* ==================================================
   GOOGLE SHEETS - SIMULAÇÃO
================================================== */

function initSheets() {
    const sheetsData = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
    updateSheetsCards();
}

function updateSheetsCards() {
    const sheets = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
    const lastSync = localStorage.getItem('lastSync') || 'Nunca';
    
    // Atualizar cards na seção sheets
    const section = document.getElementById('sheetsSection');
    if (section) {
        const cards = section.querySelectorAll('.card-value');
        if (cards[0]) cards[0].textContent = sheets.length;
        if (cards[1]) cards[1].textContent = lastSync;
    }
}

window.connectGoogleSheet = function() {
    const url = prompt('Cole a URL da planilha do Google Sheets:');
    if (!url) return;
    
    const sheets = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
    
    const newSheet = {
        id: Date.now(),
        url: url,
        name: `Planilha ${sheets.length + 1}`,
        connectedAt: new Date().toLocaleString('pt-BR'),
        rows: Math.floor(Math.random() * 1000) + 50
    };
    
    sheets.push(newSheet);
    localStorage.setItem('connectedSheets', JSON.stringify(sheets));
    localStorage.setItem('lastSync', new Date().toLocaleString('pt-BR'));
    
    updateSheetsCards();
    renderSheetsList();
    showNotification('✅ Planilha conectada com sucesso!', 'success');
};

function renderSheetsList() {
    const section = document.getElementById('sheetsSection');
    if (!section) return;
    
    const sheets = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
    
    if (sheets.length === 0) return;
    
    const listHTML = `
        <div style="margin-top: 32px;">
            <h3>Planilhas Conectadas</h3>
            <div class="sheets-list">
                ${sheets.map(sheet => `
                    <div class="sheet-item">
                        <div>
                            <div style="font-weight: 600;">${sheet.name}</div>
                            <div style="font-size: 14px; color: #64748B;">${sheet.rows} linhas • ${sheet.connectedAt}</div>
                        </div>
                        <div>
                            <button class="btn-primary" onclick="syncSheet(${sheet.id})">🔄 Sincronizar</button>
                            <button class="btn-delete" onclick="disconnectSheet(${sheet.id})">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    section.querySelector('.btn-primary').insertAdjacentHTML('afterend', listHTML);
}

window.syncSheet = function(id) {
    showNotification('🔄 Sincronizando...', 'info');
    
    setTimeout(() => {
        localStorage.setItem('lastSync', new Date().toLocaleString('pt-BR'));
        updateSheetsCards();
        showNotification('✅ Sincronização concluída!', 'success');
    }, 2000);
};

window.disconnectSheet = function(id) {
    if (!confirm('Desconectar planilha?')) return;
    
    let sheets = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
    sheets = sheets.filter(s => s.id !== id);
    localStorage.setItem('connectedSheets', JSON.stringify(sheets));
    
    updateSheetsCards();
    location.reload(); // Reload to update UI
};

/* ==================================================
   RELATÓRIOS AVANÇADOS
================================================== */

function initReports() {
    const container = document.getElementById('relatoriosContainer');
    if (!container) return;
    
    const users = getUsers();
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    const sheets = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
    
    container.innerHTML = `
        <div class="report-section">
            <h3>📊 Estatísticas Gerais</h3>
            <div class="cards-grid" style="margin-top: 16px;">
                <div class="card">
                    <div class="card-title">Total de Usuários</div>
                    <div class="card-value">${users.length}</div>
                </div>
                <div class="card">
                    <div class="card-title">Arquivos Enviados</div>
                    <div class="card-value">${files.length}</div>
                </div>
                <div class="card">
                    <div class="card-title">Planilhas Conectadas</div>
                    <div class="card-value">${sheets.length}</div>
                </div>
                <div class="card">
                    <div class="card-title">Sessão Ativa</div>
                    <div class="card-value" style="font-size: 16px;">✅ Ativo</div>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h3>👥 Distribuição de Usuários</h3>
            <div class="chart-container">
                ${renderUserRoleChart(users)}
            </div>
        </div>
        
        <div class="report-section">
            <h3>📈 Atividade Recente</h3>
            <div class="activity-list">
                ${renderActivity()}
            </div>
        </div>
        
        <button class="btn-primary" onclick="exportReport()">📥 Exportar Relatório (JSON)</button>
    `;
}

function renderUserRoleChart(users) {
    const roles = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
    }, {});
    
    return Object.entries(roles).map(([role, count]) => {
        const percent = (count / users.length * 100).toFixed(0);
        return `
            <div class="chart-bar">
                <div class="chart-label">${role} (${count})</div>
                <div class="chart-progress">
                    <div class="chart-fill" style="width: ${percent}%"></div>
                </div>
                <div class="chart-percent">${percent}%</div>
            </div>
        `;
    }).join('');
}

function renderActivity() {
    const activities = [
        { icon: '✅', text: 'Sistema iniciado', time: 'Agora' },
        { icon: '👤', text: `${currentUser.name} fez login`, time: 'Agora' },
        { icon: '📊', text: 'Dashboard carregado', time: 'Agora' }
    ];
    
    return activities.map(a => `
        <div class="activity-item">
            <span class="activity-icon">${a.icon}</span>
            <span class="activity-text">${a.text}</span>
            <span class="activity-time">${a.time}</span>
        </div>
    `).join('');
}

window.exportReport = function() {
    const report = {
        generatedAt: new Date().toISOString(),
        generatedBy: currentUser.email,
        data: {
            users: getUsers(),
            files: JSON.parse(localStorage.getItem('uploadedFiles') || '[]'),
            sheets: JSON.parse(localStorage.getItem('connectedSheets') || '[]')
        }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${Date.now()}.json`;
    a.click();
    
    showNotification('📥 Relatório exportado!', 'success');
};

/* ==================================================
   SISTEMA DE NOTIFICAÇÕES
================================================== */

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ==================================================
   DASHBOARD MELHORADO
================================================== */

function enhanceDashboard() {
    const section = document.getElementById('dashboardSection');
    if (!section) return;
    
    const users = getUsers();
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    
    section.innerHTML = `
        <h2>📊 Dashboard</h2>
        <div class="cards-grid">
            <div class="card card-hover" onclick="navigateTo(event, 'usuarios')">
                <div class="card-title">Total de Usuários</div>
                <div class="card-value">${users.length}</div>
                <div class="card-footer">👥 Gerenciar →</div>
            </div>
            <div class="card card-hover" onclick="navigateTo(event, 'upload')">
                <div class="card-title">Arquivos Enviados</div>
                <div class="card-value">${files.length}</div>
                <div class="card-footer">📤 Ver arquivos →</div>
            </div>
            <div class="card card-hover" onclick="navigateTo(event, 'sheets')">
                <div class="card-title">Planilhas Google</div>
                <div class="card-value">${JSON.parse(localStorage.getItem('connectedSheets') || '[]').length}</div>
                <div class="card-footer">📊 Conectar →</div>
            </div>
            <div class="card">
                <div class="card-title">Status do Sistema</div>
                <div class="card-value" style="font-size: 20px;">✅ Operacional</div>
                <div class="card-footer">Tudo funcionando</div>
            </div>
        </div>
        
        <div class="welcome-banner">
            <h3>👋 Bem-vindo, ${currentUser.name}!</h3>
            <p>Você está logado como <strong>${currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}</strong></p>
            <p style="margin-top: 8px; font-size: 14px;">Última atualização: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    `;
}

/* ==================================================
   INICIALIZAÇÃO
================================================== */

// Executar quando app carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sistema carregado');
});
