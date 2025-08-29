// Sistema de Controle de Pontuação de Xadrez
class ChessScoreManager {
    constructor() {
        this.players = JSON.parse(localStorage.getItem('chessPlayers')) || [];
        this.matches = JSON.parse(localStorage.getItem('chessMatches')) || [];
        this.currentEditingPlayer = null;
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initTheme();
        this.renderPlayers();
        this.renderRanking();
        this.renderRecentMatches();
        this.updatePlayerSelects();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Navegação por abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Formulário de jogador
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.showPlayerForm());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hidePlayerForm());
        document.getElementById('playerFormElement').addEventListener('submit', (e) => this.handlePlayerSubmit(e));

        // Busca de jogadores
        document.getElementById('searchPlayer').addEventListener('input', (e) => this.searchPlayers(e.target.value));

        // Formulário de partida
        document.getElementById('matchForm').addEventListener('submit', (e) => this.handleMatchSubmit(e));

        // Modal de confirmação
        document.getElementById('confirmYes').addEventListener('click', () => this.confirmAction());
        document.getElementById('confirmNo').addEventListener('click', () => this.hideModal());

        // Fechar modal clicando fora
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') this.hideModal();
        });

        // Alternador de tema
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    // Navegação por abas
    switchTab(tabName) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Adicionar classe active na aba selecionada
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // Atualizar dados se necessário
        if (tabName === 'ranking') {
            this.renderRanking();
        } else if (tabName === 'partidas') {
            this.updatePlayerSelects();
            this.renderRecentMatches();
        }
    }

    // Gerenciamento de jogadores
    showPlayerForm(player = null) {
        const form = document.getElementById('playerForm');
        const title = document.getElementById('formTitle');
        const nameInput = document.getElementById('playerName');
        const emailInput = document.getElementById('playerEmail');

        if (player) {
            title.textContent = 'Editar Jogador';
            nameInput.value = player.name;
            emailInput.value = player.email || '';
            this.currentEditingPlayer = player;
        } else {
            title.textContent = 'Adicionar Novo Jogador';
            nameInput.value = '';
            emailInput.value = '';
            this.currentEditingPlayer = null;
        }

        form.style.display = 'block';
        nameInput.focus();
    }

    hidePlayerForm() {
        document.getElementById('playerForm').style.display = 'none';
        this.currentEditingPlayer = null;
    }

    handlePlayerSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('playerName').value.trim();
        const email = document.getElementById('playerEmail').value.trim();

        if (!name) {
            alert('Nome do jogador é obrigatório!');
            return;
        }

        // Verificar se já existe um jogador com esse nome (exceto o que está sendo editado)
        const existingPlayer = this.players.find(p => 
            p.name.toLowerCase() === name.toLowerCase() && 
            (!this.currentEditingPlayer || p.id !== this.currentEditingPlayer.id)
        );

        if (existingPlayer) {
            alert('Já existe um jogador com esse nome!');
            return;
        }

        if (this.currentEditingPlayer) {
            // Editar jogador existente
            this.currentEditingPlayer.name = name;
            this.currentEditingPlayer.email = email;
        } else {
            // Adicionar novo jogador
            const newPlayer = {
                id: Date.now().toString(),
                name: name,
                email: email,
                wins: 0,
                draws: 0,
                losses: 0,
                points: 0,
                matches: 0,
                createdAt: new Date().toISOString()
            };
            this.players.push(newPlayer);
        }

        this.saveData();
        this.renderPlayers();
        this.updatePlayerSelects();
        this.hidePlayerForm();
        this.showNotification(this.currentEditingPlayer ? 'Jogador atualizado com sucesso!' : 'Jogador adicionado com sucesso!');
    }

    editPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            this.showPlayerForm(player);
        }
    }

    deletePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            this.showConfirmModal(
                `Tem certeza que deseja excluir o jogador "${player.name}"?\n\nTodas as partidas relacionadas também serão removidas.`,
                () => {
                    // Remover jogador
                    this.players = this.players.filter(p => p.id !== playerId);
                    
                    // Remover partidas relacionadas
                    this.matches = this.matches.filter(m => 
                        m.player1Id !== playerId && m.player2Id !== playerId
                    );
                    
                    this.saveData();
                    this.renderPlayers();
                    this.renderRanking();
                    this.renderRecentMatches();
                    this.updatePlayerSelects();
                    this.showNotification('Jogador excluído com sucesso!');
                }
            );
        }
    }

    searchPlayers(query) {
        const filteredPlayers = this.players.filter(player => 
            player.name.toLowerCase().includes(query.toLowerCase()) ||
            (player.email && player.email.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderPlayers(filteredPlayers);
    }

    renderPlayers(playersToRender = null) {
        const container = document.getElementById('playersContainer');
        const players = playersToRender || this.players;

        if (players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nenhum jogador encontrado</h3>
                    <p>${playersToRender ? 'Tente uma busca diferente.' : 'Adicione o primeiro jogador para começar!'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = players.map(player => `
            <div class="player-card">
                <div class="player-info">
                    <h3>${player.name}</h3>
                    ${player.email ? `<p><i class="fas fa-envelope"></i> ${player.email}</p>` : ''}
                </div>
                <div class="player-stats">
                    <div class="stat-item">
                        <div class="stat-value">${player.points}</div>
                        <div class="stat-label">Pontos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.wins}</div>
                        <div class="stat-label">Vitórias</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.draws}</div>
                        <div class="stat-label">Empates</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${player.losses}</div>
                        <div class="stat-label">Derrotas</div>
                    </div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-primary btn-small" onclick="chessManager.editPlayer('${player.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="chessManager.deletePlayer('${player.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Sistema de ranking
    renderRanking() {
        const container = document.getElementById('rankingContainer');
        
        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>Ranking vazio</h3>
                    <p>Adicione jogadores e registre partidas para ver o ranking!</p>
                </div>
            `;
            return;
        }

        // Ordenar jogadores por pontos (decrescente), depois por vitórias, depois por nome
        const sortedPlayers = [...this.players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.wins !== a.wins) return b.wins - a.wins;
            return a.name.localeCompare(b.name);
        });

        container.innerHTML = `
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Jogador</th>
                        <th>Pontos</th>
                        <th>Partidas</th>
                        <th>Vitórias</th>
                        <th>Empates</th>
                        <th>Derrotas</th>
                        <th>Taxa de Vitória</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedPlayers.map((player, index) => {
                        const winRate = player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0';
                        const positionClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
                        
                        return `
                            <tr>
                                <td><span class="position ${positionClass}">${index + 1}º</span></td>
                                <td><strong>${player.name}</strong></td>
                                <td><strong>${player.points}</strong></td>
                                <td>${player.matches}</td>
                                <td>${player.wins}</td>
                                <td>${player.draws}</td>
                                <td>${player.losses}</td>
                                <td>${winRate}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Sistema de partidas
    updatePlayerSelects() {
        const player1Select = document.getElementById('player1');
        const player2Select = document.getElementById('player2');
        
        const options = this.players.map(player => 
            `<option value="${player.id}">${player.name}</option>`
        ).join('');
        
        player1Select.innerHTML = '<option value="">Selecione um jogador</option>' + options;
        player2Select.innerHTML = '<option value="">Selecione um jogador</option>' + options;
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('matchDate').value = today;
    }

    handleMatchSubmit(e) {
        e.preventDefault();
        
        const player1Id = document.getElementById('player1').value;
        const player2Id = document.getElementById('player2').value;
        const result = document.querySelector('input[name="result"]:checked')?.value;
        const matchDate = document.getElementById('matchDate').value;
        const notes = document.getElementById('matchNotes').value.trim();

        if (!player1Id || !player2Id) {
            alert('Selecione ambos os jogadores!');
            return;
        }

        if (player1Id === player2Id) {
            alert('Selecione jogadores diferentes!');
            return;
        }

        if (!result) {
            alert('Selecione o resultado da partida!');
            return;
        }

        if (!matchDate) {
            alert('Selecione a data da partida!');
            return;
        }

        // Registrar a partida
        const match = {
            id: Date.now().toString(),
            player1Id: player1Id,
            player2Id: player2Id,
            result: result,
            date: matchDate,
            notes: notes,
            createdAt: new Date().toISOString()
        };

        this.matches.push(match);
        this.updatePlayerStats(match);
        this.saveData();
        
        // Limpar formulário
        document.getElementById('matchForm').reset();
        this.setDefaultDate();
        
        // Atualizar interfaces
        this.renderPlayers();
        this.renderRanking();
        this.renderRecentMatches();
        
        this.showNotification('Partida registrada com sucesso!');
    }

    updatePlayerStats(match) {
        const player1 = this.players.find(p => p.id === match.player1Id);
        const player2 = this.players.find(p => p.id === match.player2Id);

        if (!player1 || !player2) return;

        // Incrementar número de partidas
        player1.matches++;
        player2.matches++;

        // Atualizar estatísticas baseado no resultado
        switch (match.result) {
            case 'player1':
                // Jogador 1 venceu
                player1.wins++;
                player1.points += 3;
                player2.losses++;
                // Jogador 2 não ganha pontos (derrota = 0 pontos)
                break;
            case 'player2':
                // Jogador 2 venceu
                player2.wins++;
                player2.points += 3;
                player1.losses++;
                // Jogador 1 não ganha pontos (derrota = 0 pontos)
                break;
            case 'draw':
                // Empate
                player1.draws++;
                player1.points += 1;
                player2.draws++;
                player2.points += 1;
                break;
        }
    }

    renderRecentMatches() {
        const container = document.getElementById('recentMatchesContainer');
        
        if (this.matches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chess-board"></i>
                    <h3>Nenhuma partida registrada</h3>
                    <p>Registre a primeira partida para começar!</p>
                </div>
            `;
            return;
        }

        // Mostrar as 10 partidas mais recentes
        const recentMatches = [...this.matches]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        container.innerHTML = recentMatches.map(match => {
            const player1 = this.players.find(p => p.id === match.player1Id);
            const player2 = this.players.find(p => p.id === match.player2Id);
            
            if (!player1 || !player2) return ''; // Jogador foi deletado
            
            let resultText = '';
            switch (match.result) {
                case 'player1':
                    resultText = `Vitória de ${player1.name}`;
                    break;
                case 'player2':
                    resultText = `Vitória de ${player2.name}`;
                    break;
                case 'draw':
                    resultText = 'Empate';
                    break;
            }
            
            const matchDate = new Date(match.date).toLocaleDateString('pt-BR');
            
            return `
                <div class="match-card">
                    <div class="match-header">
                        <div class="match-players">${player1.name} vs ${player2.name}</div>
                        <div class="match-date">${matchDate}</div>
                    </div>
                    <div class="match-result">${resultText}</div>
                    ${match.notes ? `<div class="match-notes"><i class="fas fa-sticky-note"></i> ${match.notes}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Sistema de temas
    initTheme() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode.toString());
        this.initTheme();
        
        // Mostrar notificação
        const message = this.darkMode ? 'Modo escuro ativado' : 'Modo claro ativado';
        this.showNotification(message);
    }

    // Utilitários
    saveData() {
        localStorage.setItem('chessPlayers', JSON.stringify(this.players));
        localStorage.setItem('chessMatches', JSON.stringify(this.matches));
    }

    showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
        this.pendingConfirmAction = onConfirm;
    }

    hideModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.pendingConfirmAction = null;
    }

    confirmAction() {
        if (this.pendingConfirmAction) {
            this.pendingConfirmAction();
        }
        this.hideModal();
    }

    showNotification(message) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Adicionar animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 3000);
    }

    // Método para exportar dados (funcionalidade extra)
    exportData() {
        const data = {
            players: this.players,
            matches: this.matches,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xadrez-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados com sucesso!');
    }

    // Método para importar dados (funcionalidade extra)
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.players && data.matches) {
                    this.players = data.players;
                    this.matches = data.matches;
                    this.saveData();
                    this.renderPlayers();
                    this.renderRanking();
                    this.renderRecentMatches();
                    this.updatePlayerSelects();
                    this.showNotification('Dados importados com sucesso!');
                } else {
                    alert('Arquivo inválido!');
                }
            } catch (error) {
                alert('Erro ao importar arquivo!');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar o sistema quando a página carregar
let chessManager;
document.addEventListener('DOMContentLoaded', () => {
    chessManager = new ChessScoreManager();
});

// Adicionar atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Esc para fechar modais e formulários
    if (e.key === 'Escape') {
        const modal = document.getElementById('confirmModal');
        const form = document.getElementById('playerForm');
        
        if (modal.style.display === 'block') {
            chessManager.hideModal();
        } else if (form.style.display === 'block') {
            chessManager.hidePlayerForm();
        }
    }
    
    // Ctrl+N para adicionar novo jogador
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (document.getElementById('jogadores').classList.contains('active')) {
            chessManager.showPlayerForm();
        }
    }
});