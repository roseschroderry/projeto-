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
        <button class="btn-primary" onclick="exportToPDF()" style="margin-left: 8px;">📄 Exportar PDF</button>
        <button class="btn-primary" onclick="exportToExcel()" style="margin-left: 8px;">📊 Exportar Excel</button>
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

window.exportToPDF = function() {
    showNotification('📄 Gerando PDF... (funcionalidade simulada)', 'info');
    setTimeout(() => {
        showNotification('✅ PDF gerado com sucesso!', 'success');
    }, 2000);
};

window.exportToExcel = function() {
    // Criar CSV (compatível com Excel)
    const users = getUsers();
    let csv = 'Nome,Email,Tipo\n';
    users.forEach(u => {
        csv += `${u.name},${u.email},${u.role}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-${Date.now()}.csv`;
    a.click();
    
    showNotification('📊 Planilha Excel exportada!', 'success');
};

/* ==================================================
   CHAT IA
================================================== */

let chatHistory = [];
let chatSettings = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    apiKey: localStorage.getItem('openai_api_key') || ''
};

function initChat() {
    const container = document.getElementById('chatContainer');
    if (!container) return;
    
    chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatSettings = JSON.parse(localStorage.getItem('chatSettings') || JSON.stringify(chatSettings));
    
    container.innerHTML = `
        <div class="chat-wrapper">
            <div class="chat-header-controls">
                <div class="chat-controls-left">
                    <button class="chat-control-btn" onclick="showChatSettings()" title="Configurações">
                        ⚙️
                    </button>
                    <button class="chat-control-btn" onclick="exportChatHistory()" title="Exportar conversa">
                        📥
                    </button>
                    <button class="chat-control-btn" onclick="clearChat()" title="Limpar chat">
                        🗑️
                    </button>
                </div>
                <div class="chat-model-indicator">
                    <span class="model-badge" id="modelBadge">${chatSettings.model}</span>
                    <span class="temp-badge">Temp: ${chatSettings.temperature}</span>
                    <span class="api-status-badge" id="apiStatusBadge" style="display: none;">🔑 API Ativa</span>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                ${chatHistory.length === 0 ? `
                    <div class="chat-welcome">
                        <div class="chat-welcome-icon">🤖</div>
                        <h3>Assistente IA</h3>
                        <p>Olá! Sou seu assistente inteligente. Como posso ajudar?</p>
                        <div class="chat-suggestions">
                            <button class="chat-suggestion" onclick="sendSuggestion('Me mostre estatísticas do sistema')">
                                📊 Estatísticas
                            </button>
                            <button class="chat-suggestion" onclick="sendSuggestion('Como adicionar novos usuários?')">
                                👥 Adicionar usuários
                            </button>
                            <button class="chat-suggestion" onclick="sendSuggestion('Gerar relatório completo')">
                                📑 Gerar relatório
                            </button>
                        </div>
                    </div>
                ` : renderChatMessages()}
            </div>
            
            <div class="chat-input-container">
                <textarea 
                    class="chat-input" 
                    id="chatInput" 
                    placeholder="Digite sua mensagem..."
                    rows="1"
                    onkeydown="handleChatKeyPress(event)"
                ></textarea>
                <button class="chat-send-btn" onclick="sendMessage()">
                    <span>📤</span>
                </button>
            </div>
        </div>
        
        <!-- Modal de Configurações -->
        <div class="chat-settings-modal" id="chatSettingsModal" style="display: none;">
            <div class="chat-settings-content">
                <div class="chat-settings-header">
                    <h3>⚙️ Configurações do Chat</h3>
                    <button class="close-btn" onclick="closeChatSettings()">×</button>
                </div>
                <div class="chat-settings-body">
                    <div class="setting-group">
                        <label class="setting-label">🔑 Chave API (Opcional)</label>
                        <input 
                            type="password" 
                            class="setting-input" 
                            id="apiKeyInput" 
                            placeholder="sk-..." 
                            value="${chatSettings.apiKey}"
                        >
                        <small class="setting-hint">Para usar GPT-4 real, configure sua chave OpenAI</small>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">🤖 Modelo de IA</label>
                        <select class="setting-select" id="modelSelect">
                            <option value="gpt-3.5-turbo" ${chatSettings.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo (Rápido)</option>
                            <option value="gpt-4" ${chatSettings.model === 'gpt-4' ? 'selected' : ''}>GPT-4 (Preciso)</option>
                            <option value="gpt-4-turbo" ${chatSettings.model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo (Melhor)</option>
                        </select>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">🌡️ Temperatura: <span id="tempValue">${chatSettings.temperature}</span></label>
                        <input 
                            type="range" 
                            class="setting-range" 
                            id="temperatureRange" 
                            min="0" 
                            max="2" 
                            step="0.1" 
                            value="${chatSettings.temperature}"
                            oninput="updateTempValue(this.value)"
                        >
                        <small class="setting-hint">0 = Preciso, 2 = Criativo</small>
                    </div>
                </div>
                <div class="chat-settings-footer">
                    <button class="btn-secondary" onclick="closeChatSettings()">Cancelar</button>
                    <button class="btn-primary" onclick="saveChatSettings()">Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    scrollChatToBottom();
    
    // Atualizar indicador de API
    updateAPIStatus();
}

function updateAPIStatus() {
    const apiStatusBadge = document.getElementById('apiStatusBadge');
    const modelBadge = document.getElementById('modelBadge');
    
    if (apiStatusBadge && chatSettings.apiKey && chatSettings.apiKey.startsWith('sk-')) {
        apiStatusBadge.style.display = 'inline-block';
        if (modelBadge) modelBadge.textContent = chatSettings.model;
        console.log('✅ API OpenAI ATIVA - Usando', chatSettings.model);
    } else {
        if (apiStatusBadge) apiStatusBadge.style.display = 'none';
        console.log('⚠️ API não configurada - usando respostas simuladas');
    }
}

function renderChatMessages() {
    return chatHistory.map(msg => `
        <div class="chat-message ${msg.sender}">
            <div class="chat-message-avatar">
                ${msg.sender === 'user' ? currentUser.name.charAt(0) : '🤖'}
            </div>
            <div class="chat-message-content">
                <div class="chat-message-header">
                    <span class="chat-message-name">${msg.sender === 'user' ? currentUser.name : 'Assistente IA'}</span>
                    <span class="chat-message-time">${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.text}</div>
            </div>
        </div>
    `).join('');
}

window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Recarregar configurações do localStorage antes de enviar
    chatSettings = JSON.parse(localStorage.getItem('chatSettings') || JSON.stringify(chatSettings));
    
    // Adicionar mensagem do usuário
    addChatMessage({
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    
    input.value = '';
    input.style.height = 'auto';
    
    // Verificar se tem chave API válida
    const hasValidKey = chatSettings.apiKey && chatSettings.apiKey.trim().startsWith('sk-');
    
    console.log('🔑 Chave API:', hasValidKey ? 'Configurada' : 'Não configurada');
    console.log('🤖 Modelo:', chatSettings.model);
    
    // Tentar usar API real se chave estiver configurada
    if (hasValidKey) {
        await sendToOpenAI(message);
    } else {
        // Fallback para resposta simulada
        setTimeout(() => {
            const response = generateAIResponse(message);
            addChatMessage({
                sender: 'ai',
                text: response,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });
        }, 1000);
    }
};

window.sendSuggestion = function(text) {
    const input = document.getElementById('chatInput');
    input.value = text;
    sendMessage();
};

function addChatMessage(message) {
    chatHistory.push(message);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = renderChatMessages();
    scrollChatToBottom();
}

function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

function generateAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    // Estatísticas
    if (msg.includes('estatística') || msg.includes('estatistica') || msg.includes('dados')) {
        const users = getUsers();
        const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        const sheets = JSON.parse(localStorage.getItem('connectedSheets') || '[]');
        
        return `📊 **Estatísticas do Sistema:**\n\n` +
               `👥 **Usuários:** ${users.length} cadastrados\n` +
               `📁 **Arquivos:** ${files.length} enviados\n` +
               `📊 **Planilhas:** ${sheets.length} conectadas\n\n` +
               `✅ Sistema operacional e funcionando perfeitamente!`;
    }
    
    // Relatórios
    if (msg.includes('relatório') || msg.includes('relatorio') || msg.includes('gerar')) {
        return `📑 **Geração de Relatórios:**\n\n` +
               `Para gerar relatórios, acesse a seção "📑 Relatórios" no menu lateral.\n\n` +
               `Você pode exportar em:\n` +
               `• JSON - Dados estruturados\n` +
               `• PDF - Documento formatado\n` +
               `• Excel - Planilha editável\n\n` +
               `Todos os relatórios incluem usuários, arquivos e planilhas conectadas.`;
    }
    
    // Usuários
    if (msg.includes('usuário') || msg.includes('usuario') || msg.includes('adicionar') || msg.includes('criar')) {
        if (currentUser.role !== 'admin') {
            return `⚠️ **Permissão Negada:**\n\nApenas administradores podem adicionar novos usuários.\n\nSeu perfil atual: **${currentUser.role}**`;
        }
        return `👥 **Gerenciamento de Usuários:**\n\n` +
               `Para adicionar usuários:\n` +
               `1. Acesse "👥 Usuários" no menu\n` +
               `2. Clique em "➕ Novo Usuário"\n` +
               `3. Preencha os dados (nome, email, senha, tipo)\n` +
               `4. Salve as alterações\n\n` +
               `Tipos disponíveis: Admin, Vendedor, User`;
    }
    
    // Upload
    if (msg.includes('arquivo') || msg.includes('upload') || msg.includes('enviar')) {
        return `📤 **Upload de Arquivos:**\n\n` +
               `Para enviar arquivos:\n` +
               `1. Acesse "📤 Upload" no menu\n` +
               `2. Arraste arquivos para a área indicada OU\n` +
               `3. Clique em "📁 Selecionar Arquivos"\n\n` +
               `Recursos:\n` +
               `• Drag & Drop\n` +
               `• Múltiplos arquivos\n` +
               `• Visualização com detalhes\n` +
               `• Gerenciamento completo`;
    }
    
    // Google Sheets
    if (msg.includes('planilha') || msg.includes('sheets') || msg.includes('google')) {
        return `📊 **Google Sheets:**\n\n` +
               `Para conectar planilhas:\n` +
               `1. Acesse "📊 Google Sheets" no menu\n` +
               `2. Clique em "🔗 Conectar Nova Planilha"\n` +
               `3. Cole a URL da planilha\n` +
               `4. Sincronize quando necessário\n\n` +
               `A sincronização mantém seus dados atualizados automaticamente.`;
    }
    
    // Ajuda geral
    if (msg.includes('ajuda') || msg.includes('help') || msg.includes('como')) {
        return `💡 **Central de Ajuda:**\n\n` +
               `Estou aqui para ajudar! Posso responder sobre:\n\n` +
               `📊 Estatísticas do sistema\n` +
               `👥 Gerenciamento de usuários\n` +
               `📤 Upload de arquivos\n` +
               `📊 Google Sheets\n` +
               `📑 Relatórios\n` +
               `⚙️ Configurações\n\n` +
               `Digite sua dúvida ou escolha uma sugestão acima!`;
    }
    
    // Resposta padrão
    return `Entendi sua mensagem: "${userMessage}"\n\n` +
           `Posso ajudar com:\n` +
           `• Estatísticas do sistema 📊\n` +
           `• Gerenciamento de usuários 👥\n` +
           `• Upload de arquivos 📤\n` +
           `• Google Sheets 📊\n` +
           `• Geração de relatórios 📑\n\n` +
           `Como posso ser útil?`;
}

async function sendToOpenAI(message) {
    // Adiciona mensagem de "digitando..."
    const typingId = Date.now();
    addChatMessage({
        sender: 'ai',
        text: '⏳ Pensando...',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        id: typingId
    });
    
    try {
        // Prepara histórico de conversa para contexto
        const messages = [
            {
                role: 'system',
                content: `Você é um assistente IA profissional do sistema administrativo. Ajude com: estatísticas, usuários, uploads, planilhas Google Sheets e relatórios. Responda em português de forma clara e profissional.`
            }
        ];
        
        // Adiciona últimas 20 mensagens para contexto
        const recentHistory = chatHistory.slice(-20).filter(m => !m.id);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        });
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatSettings.apiKey}`
            },
            body: JSON.stringify({
                model: chatSettings.model,
                messages: messages,
                temperature: chatSettings.temperature,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            
            // Se modelo não disponível, tenta com gpt-3.5-turbo
            if (error.error?.code === 'model_not_found' && chatSettings.model !== 'gpt-3.5-turbo') {
                console.log('⚠️ Modelo não disponível, tentando com gpt-3.5-turbo...');
                chatSettings.model = 'gpt-3.5-turbo';
                localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
                
                // Tenta novamente com gpt-3.5-turbo
                const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${chatSettings.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: messages,
                        temperature: chatSettings.temperature,
                        max_tokens: 1000
                    })
                });
                
                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    const aiResponse = retryData.choices[0].message.content;
                    
                    chatHistory = chatHistory.filter(m => m.id !== typingId);
                    addChatMessage({
                        sender: 'ai',
                        text: aiResponse,
                        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    });
                    
                    showNotification('✅ Usando GPT-3.5 Turbo (GPT-4 não disponível)', 'info');
                    updateAPIStatus();
                    return;
                }
            }
            
            throw new Error(error.error?.message || 'Erro na API OpenAI');
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Remove mensagem de "digitando..."
        chatHistory = chatHistory.filter(m => m.id !== typingId);
        
        // Adiciona resposta real
        addChatMessage({
            sender: 'ai',
            text: aiResponse,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
        
    } catch (error) {
        console.error('Erro OpenAI:', error);
        
        // Remove mensagem de "digitando..."
        chatHistory = chatHistory.filter(m => m.id !== typingId);
        
        // Fallback para resposta simulada em caso de erro
        const fallbackResponse = generateAIResponse(message);
        addChatMessage({
            sender: 'ai',
            text: `⚠️ Usando modo offline (${error.message})\n\n${fallbackResponse}`,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
        
        showNotification('Erro na API - usando modo offline', 'error');
    }
}

window.handleChatKeyPress = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    
    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
};

window.clearChat = function() {
    if (!confirm('Limpar histórico do chat?')) return;
    
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    initChat();
    showNotification('🗑️ Chat limpo!', 'success');
};

window.showChatSettings = function() {
    document.getElementById('chatSettingsModal').style.display = 'flex';
};

window.closeChatSettings = function() {
    document.getElementById('chatSettingsModal').style.display = 'none';
};

window.updateTempValue = function(value) {
    document.getElementById('tempValue').textContent = value;
};

window.saveChatSettings = function() {
    chatSettings.apiKey = document.getElementById('apiKeyInput').value.trim();
    chatSettings.model = document.getElementById('modelSelect').value;
    chatSettings.temperature = parseFloat(document.getElementById('temperatureRange').value);
    
    localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
    
    console.log('💾 Configurações salvas:');
    console.log('  - API Key:', chatSettings.apiKey ? '✅ Configurada' : '❌ Não configurada');
    console.log('  - Modelo:', chatSettings.model);
    console.log('  - Temperatura:', chatSettings.temperature);
    
    closeChatSettings();
    updateAPIStatus(); // Atualiza indicador visual
    showNotification('✅ Configurações salvas! API OpenAI ' + (chatSettings.apiKey ? 'ATIVA' : 'não configurada'), 'success');
};

window.exportChatHistory = function() {
    if (chatHistory.length === 0) {
        showNotification('⚠️ Não há conversa para exportar', 'info');
        return;
    }
    
    const exportData = {
        exportedAt: new Date().toISOString(),
        user: currentUser.name,
        model: chatSettings.model,
        temperature: chatSettings.temperature,
        messages: chatHistory
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('📥 Conversa exportada!', 'success');
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
