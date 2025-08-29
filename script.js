// Sistema de Controle de Pontuação de Xadrez
class ChessScoreManager {
    constructor() {
        this.players = [];
        this.matches = [];
        this.currentEditingPlayer = null;
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.viewMode = localStorage.getItem('viewMode') || 'grid';
        this.sortBy = localStorage.getItem('sortBy') || 'name';
        this.init();
    }

    loadData() {
        this.players = JSON.parse(localStorage.getItem('chessPlayers')) || [];
        this.matches = JSON.parse(localStorage.getItem('chessMatches')) || [];
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupCsvEventListeners();
        this.setupReportsEventListeners();
        this.renderPlayers();
        this.renderRanking();
        this.renderRecentMatches();
        this.renderReports();
        this.updatePlayerSelects();
        this.setDefaultDate();
        this.initTheme();
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

        // Busca e filtros de jogadores
        document.getElementById('searchPlayer').addEventListener('input', (e) => this.searchPlayers(e.target.value));
        document.getElementById('sortPlayers').addEventListener('change', (e) => this.sortPlayers(e.target.value));
        document.getElementById('gridView').addEventListener('click', () => this.setViewMode('grid'));
        document.getElementById('listView').addEventListener('click', () => this.setViewMode('list'));

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
        } else if (tabName === 'relatorios') {
            this.renderReports();
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

    sortPlayers(sortBy) {
        this.sortBy = sortBy;
        localStorage.setItem('sortBy', sortBy);
        document.getElementById('sortPlayers').value = sortBy;
        this.renderPlayers();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        localStorage.setItem('viewMode', mode);
        
        // Update view toggle buttons
        document.getElementById('gridView').classList.toggle('bg-background', mode === 'grid');
        document.getElementById('gridView').classList.toggle('text-foreground', mode === 'grid');
        document.getElementById('gridView').classList.toggle('shadow-sm', mode === 'grid');
        document.getElementById('gridView').classList.toggle('text-muted-foreground', mode !== 'grid');
        
        document.getElementById('listView').classList.toggle('bg-background', mode === 'list');
        document.getElementById('listView').classList.toggle('text-foreground', mode === 'list');
        document.getElementById('listView').classList.toggle('shadow-sm', mode === 'list');
        document.getElementById('listView').classList.toggle('text-muted-foreground', mode !== 'list');
        
        this.renderPlayers();
    }

    updatePlayerStatistics() {
        const totalPlayers = this.players.length;
        const activePlayers = this.players.filter(p => p.wins + p.draws + p.losses > 0).length;
        const topPlayer = this.players.length > 0 ? 
            [...this.players].sort((a, b) => b.points - a.points)[0] : null;
        const averagePoints = totalPlayers > 0 ? 
            Math.round(this.players.reduce((sum, p) => sum + p.points, 0) / totalPlayers) : 0;

        document.getElementById('totalPlayers').textContent = totalPlayers;
        document.getElementById('activePlayers').textContent = activePlayers;
        document.getElementById('topPlayer').textContent = topPlayer ? topPlayer.name : '-';
        document.getElementById('averagePoints').textContent = averagePoints;
    }

    renderPlayers(playersToRender = null) {
        const container = document.getElementById('playersContainer');
        let players = playersToRender || [...this.players];

        // Sort players
        players.sort((a, b) => {
            switch (this.sortBy) {
                case 'points':
                    return b.points - a.points;
                case 'wins':
                    return b.wins - a.wins;
                case 'matches':
                    return (b.wins + b.draws + b.losses) - (a.wins + a.draws + a.losses);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        // Update statistics
        this.updatePlayerStatistics();

        if (players.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <i data-lucide="users" class="w-12 h-12 text-muted-foreground mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2">Nenhum jogador encontrado</h3>
                    <p class="text-muted-foreground">${playersToRender ? 'Tente uma busca diferente.' : 'Adicione o primeiro jogador para começar!'}</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        // Set container classes based on view mode
        if (this.viewMode === 'list') {
            container.className = 'space-y-4';
        } else {
            container.className = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3';
        }

        container.innerHTML = players.map(player => {
            const totalMatches = player.wins + player.draws + player.losses;
            const winRate = totalMatches > 0 ? Math.round((player.wins / totalMatches) * 100) : 0;
            
            if (this.viewMode === 'list') {
                return `
                    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span class="text-lg font-bold text-primary">${player.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3 class="font-semibold">${player.name}</h3>
                                    ${player.email ? `<p class="text-sm text-muted-foreground flex items-center"><i data-lucide="mail" class="w-3 h-3 mr-1"></i> ${player.email}</p>` : ''}
                                </div>
                            </div>
                            <div class="flex items-center space-x-6">
                                <div class="text-center">
                                    <div class="text-2xl font-bold">${player.points}</div>
                                    <div class="text-xs text-muted-foreground">Pontos</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-semibold text-green-600">${player.wins}</div>
                                    <div class="text-xs text-muted-foreground">Vitórias</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-semibold text-yellow-600">${player.draws}</div>
                                    <div class="text-xs text-muted-foreground">Empates</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-semibold text-red-600">${player.losses}</div>
                                    <div class="text-xs text-muted-foreground">Derrotas</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-semibold">${winRate}%</div>
                                    <div class="text-xs text-muted-foreground">Taxa</div>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8" onclick="chessManager.editPlayer('${player.id}')" title="Editar">
                                        <i data-lucide="edit" class="w-4 h-4"></i>
                                    </button>
                                    <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 w-8" onclick="chessManager.deletePlayer('${player.id}')" title="Excluir">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div class="p-6">
                            <div class="flex items-center space-x-4 mb-4">
                                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span class="text-lg font-bold text-primary">${player.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold">${player.name}</h3>
                                    ${player.email ? `<p class="text-sm text-muted-foreground flex items-center"><i data-lucide="mail" class="w-3 h-3 mr-1"></i> ${player.email}</p>` : ''}
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div class="text-center p-3 rounded-lg bg-primary/5">
                                    <div class="text-2xl font-bold text-primary">${player.points}</div>
                                    <div class="text-xs text-muted-foreground">Pontos</div>
                                </div>
                                <div class="text-center p-3 rounded-lg bg-muted/50">
                                    <div class="text-lg font-semibold">${winRate}%</div>
                                    <div class="text-xs text-muted-foreground">Taxa de Vitória</div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-2 mb-4">
                                <div class="text-center">
                                    <div class="text-lg font-semibold text-green-600">${player.wins}</div>
                                    <div class="text-xs text-muted-foreground">Vitórias</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-semibold text-yellow-600">${player.draws}</div>
                                    <div class="text-xs text-muted-foreground">Empates</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-semibold text-red-600">${player.losses}</div>
                                    <div class="text-xs text-muted-foreground">Derrotas</div>
                                </div>
                            </div>
                            
                            <div class="flex space-x-2">
                                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1" onclick="chessManager.editPlayer('${player.id}')">
                                    <i data-lucide="edit" class="w-4 h-4 mr-2"></i>
                                    Editar
                                </button>
                                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3 flex-1" onclick="chessManager.deletePlayer('${player.id}')">
                                    <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
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
        const html = document.documentElement;
        const themeToggle = document.getElementById('themeToggle');
        
        if (this.darkMode) {
            html.classList.add('dark');
            themeToggle.innerHTML = '<i data-lucide="sun" class="w-4 h-4"></i>';
        } else {
            html.classList.remove('dark');
            themeToggle.innerHTML = '<i data-lucide="moon" class="w-4 h-4"></i>';
        }
        
        // Reinitialize Lucide icons after changing the HTML
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
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

    // Funcionalidades CSV/Excel
    setupCsvEventListeners() {
        const importBtn = document.getElementById('importCsvBtn');
        const exportBtn = document.getElementById('exportCsvBtn');
        const modal = document.getElementById('csvImportModal');
        const cancelBtn = document.getElementById('csvCancelBtn');
        const dropZone = document.getElementById('csvDropZone');
        const fileInput = document.getElementById('csvFileInput');
        const confirmBtn = document.getElementById('csvImportConfirmBtn');
        const removeFileBtn = document.getElementById('csvRemoveFile');

        // Event listeners
        importBtn?.addEventListener('click', () => this.showCsvImportModal());
        exportBtn?.addEventListener('click', () => this.exportToCsv());
        cancelBtn?.addEventListener('click', () => this.hideCsvImportModal());
        confirmBtn?.addEventListener('click', () => this.importFromCsv());
        removeFileBtn?.addEventListener('click', () => this.removeCsvFile());

        // Drag and drop
        dropZone?.addEventListener('click', () => fileInput?.click());
        dropZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary');
        });
        dropZone?.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-primary');
        });
        dropZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleCsvFile(files[0]);
            }
        });

        fileInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleCsvFile(e.target.files[0]);
            }
        });
    }

    showCsvImportModal() {
        const modal = document.getElementById('csvImportModal');
        modal?.classList.remove('hidden');
        this.resetCsvModal();
    }

    hideCsvImportModal() {
        const modal = document.getElementById('csvImportModal');
        modal?.classList.add('hidden');
        this.resetCsvModal();
    }

    resetCsvModal() {
        const fileInput = document.getElementById('csvFileInput');
        const fileInfo = document.getElementById('csvFileInfo');
        const preview = document.getElementById('csvPreview');
        const confirmBtn = document.getElementById('csvImportConfirmBtn');
        
        if (fileInput) fileInput.value = '';
        fileInfo?.classList.add('hidden');
        preview?.classList.add('hidden');
        confirmBtn?.setAttribute('disabled', 'true');
        this.csvData = null;
    }

    handleCsvFile(file) {
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const validExtensions = ['.csv', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
            alert('Formato de arquivo não suportado. Use CSV, XLS ou XLSX.');
            return;
        }

        const fileName = document.getElementById('csvFileName');
        const fileInfo = document.getElementById('csvFileInfo');
        
        if (fileName) fileName.textContent = file.name;
        fileInfo?.classList.remove('hidden');
        
        this.parseCsvFile(file);
    }

    parseCsvFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let csvText = e.target.result;
                
                // Parse CSV
                const lines = csvText.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    alert('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados.');
                    return;
                }
                
                const headers = this.parseCsvLine(lines[0]);
                const data = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = this.parseCsvLine(lines[i]);
                    if (values.length === headers.length) {
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header.toLowerCase().trim()] = values[index].trim();
                        });
                        data.push(row);
                    }
                }
                
                this.csvData = { headers, data };
                this.showCsvPreview();
                
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                alert('Erro ao processar arquivo CSV.');
            }
        };
        reader.readAsText(file);
    }

    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    showCsvPreview() {
        if (!this.csvData) return;
        
        const preview = document.getElementById('csvPreview');
        const header = document.getElementById('csvPreviewHeader');
        const body = document.getElementById('csvPreviewBody');
        const info = document.getElementById('csvPreviewInfo');
        const confirmBtn = document.getElementById('csvImportConfirmBtn');
        
        // Show headers
        if (header) {
            header.innerHTML = this.csvData.headers.map(h => 
                `<th class="px-3 py-2 text-left">${h}</th>`
            ).join('');
        }
        
        // Show first 5 rows
        if (body) {
            const previewRows = this.csvData.data.slice(0, 5);
            body.innerHTML = previewRows.map(row => 
                `<tr class="border-t">${this.csvData.headers.map(h => 
                    `<td class="px-3 py-2">${row[h.toLowerCase().trim()] || ''}</td>`
                ).join('')}</tr>`
            ).join('');
        }
        
        if (info) {
            info.textContent = `${this.csvData.data.length} jogadores encontrados. Mostrando primeiros 5.`;
        }
        
        preview?.classList.remove('hidden');
        confirmBtn?.removeAttribute('disabled');
    }

    removeCsvFile() {
        this.resetCsvModal();
    }

    importFromCsv() {
        if (!this.csvData) return;
        
        let imported = 0;
        let errors = [];
        
        this.csvData.data.forEach((row, index) => {
            try {
                const name = row.nome || row.name || row.jogador || '';
                const email = row.email || row['e-mail'] || '';
                
                if (!name.trim()) {
                    errors.push(`Linha ${index + 2}: Nome é obrigatório`);
                    return;
                }
                
                // Check if player already exists
                const existingPlayer = this.players.find(p => 
                    p.name.toLowerCase() === name.toLowerCase() || 
                    (email && p.email.toLowerCase() === email.toLowerCase())
                );
                
                if (existingPlayer) {
                    errors.push(`Linha ${index + 2}: Jogador "${name}" já existe`);
                    return;
                }
                
                // Create new player
                const player = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: name.trim(),
                    email: email.trim(),
                    points: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    matches: 0,
                    createdAt: new Date().toISOString()
                };
                
                this.players.push(player);
                imported++;
                
            } catch (error) {
                errors.push(`Linha ${index + 2}: Erro ao processar dados`);
            }
        });
        
        // Save and update UI
        this.saveData();
        this.renderPlayers();
        this.renderRanking();
        this.updatePlayerSelects();
        this.updatePlayerStatistics();
        
        // Show results
        let message = `${imported} jogadores importados com sucesso!`;
        if (errors.length > 0) {
            message += `\n\nErros encontrados:\n${errors.slice(0, 5).join('\n')}`;
            if (errors.length > 5) {
                message += `\n... e mais ${errors.length - 5} erros.`;
            }
        }
        
        alert(message);
        this.hideCsvImportModal();
    }

    exportToCsv() {
        if (this.players.length === 0) {
            alert('Não há jogadores para exportar.');
            return;
        }
        
        // Prepare CSV data
        const headers = ['Nome', 'Email', 'Pontos', 'Vitórias', 'Derrotas', 'Empates', 'Partidas', 'Taxa de Vitória', 'Data de Cadastro'];
        const csvData = [headers];
        
        this.players.forEach(player => {
            const winRate = player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) + '%' : '0%';
            const createdDate = new Date(player.createdAt).toLocaleDateString('pt-BR');
            
            csvData.push([
                player.name,
                player.email,
                player.points.toString(),
                player.wins.toString(),
                player.losses.toString(),
                player.draws.toString(),
                player.matches.toString(),
                winRate,
                createdDate
            ]);
        });
        
        // Convert to CSV string
        const csvString = csvData.map(row => 
            row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Download file
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jogadores-xadrez-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados para CSV com sucesso!');
    }

    // Método para exportar dados (funcionalidade extra)
    // Reports functionality
    setupReportsEventListeners() {
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }
    }
    
    generateReportStatistics() {
        const totalPlayers = this.players.length;
        const totalMatches = this.matches.length;
        
        // Find current leader
        const sortedPlayers = [...this.players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const aWinRate = a.matches > 0 ? (a.wins / a.matches) * 100 : 0;
            const bWinRate = b.matches > 0 ? (b.wins / b.matches) * 100 : 0;
            return bWinRate - aWinRate;
        });
        
        const currentLeader = sortedPlayers.length > 0 ? sortedPlayers[0].name : '-';
        
        // Calculate average win rate
        const playersWithMatches = this.players.filter(p => p.matches > 0);
        const avgWinRate = playersWithMatches.length > 0 
            ? playersWithMatches.reduce((sum, p) => sum + (p.wins / p.matches), 0) / playersWithMatches.length * 100
            : 0;
        
        return {
            totalPlayers,
            totalMatches,
            currentLeader,
            avgWinRate: avgWinRate.toFixed(1)
        };
    }
    
    renderReports() {
        const stats = this.generateReportStatistics();
        
        // Update statistics cards
        document.getElementById('reportTotalPlayers').textContent = stats.totalPlayers;
        document.getElementById('reportTotalMatches').textContent = stats.totalMatches;
        document.getElementById('reportCurrentLeader').textContent = stats.currentLeader;
        document.getElementById('reportAvgWinRate').textContent = `${stats.avgWinRate}%`;
        
        // Render detailed table
        this.renderReportTable();
    }
    
    renderReportTable() {
        const tbody = document.getElementById('reportTableBody');
        if (!tbody) return;
        
        // Sort players by ranking
        const sortedPlayers = [...this.players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const aWinRate = a.matches > 0 ? (a.wins / a.matches) * 100 : 0;
            const bWinRate = b.matches > 0 ? (b.wins / b.matches) * 100 : 0;
            return bWinRate - aWinRate;
        });
        
        tbody.innerHTML = sortedPlayers.map((player, index) => {
            const winRate = player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0';
            
            // Find last match date
            const playerMatches = this.matches.filter(m => 
                m.player1Id === player.id || m.player2Id === player.id
            );
            const lastMatch = playerMatches.length > 0 
                ? new Date(Math.max(...playerMatches.map(m => new Date(m.date)))).toLocaleDateString('pt-BR')
                : 'Nunca jogou';
            
            // Position styling
            let positionClass = '';
            if (index === 0) positionClass = 'text-yellow-600 font-bold';
            else if (index === 1) positionClass = 'text-gray-500 font-semibold';
            else if (index === 2) positionClass = 'text-amber-600 font-semibold';
            
            return `
                <tr class="border-b hover:bg-muted/50">
                    <td class="px-4 py-3">
                        <span class="${positionClass}">${index + 1}º</span>
                    </td>
                    <td class="px-4 py-3 font-medium">${player.name}</td>
                    <td class="px-4 py-3 text-center font-semibold">${player.points}</td>
                    <td class="px-4 py-3 text-center">${player.matches}</td>
                    <td class="px-4 py-3 text-center text-green-600 font-medium">${player.wins}</td>
                    <td class="px-4 py-3 text-center text-yellow-600 font-medium">${player.draws}</td>
                    <td class="px-4 py-3 text-center text-red-600 font-medium">${player.losses}</td>
                    <td class="px-4 py-3 text-center font-medium">${winRate}%</td>
                    <td class="px-4 py-3 text-center text-sm text-muted-foreground">${lastMatch}</td>
                </tr>
            `;
        }).join('');
    }
    
    exportReport() {
        const stats = this.generateReportStatistics();
        const sortedPlayers = [...this.players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const aWinRate = a.matches > 0 ? (a.wins / a.matches) * 100 : 0;
            const bWinRate = b.matches > 0 ? (b.wins / b.matches) * 100 : 0;
            return bWinRate - aWinRate;
        });
        
        // Create CSV content
        let csvContent = 'Relatório do Torneio de Xadrez\n';
        csvContent += `Data de Geração: ${new Date().toLocaleDateString('pt-BR')}\n`;
        csvContent += `Total de Jogadores: ${stats.totalPlayers}\n`;
        csvContent += `Total de Partidas: ${stats.totalMatches}\n`;
        csvContent += `Líder Atual: ${stats.currentLeader}\n`;
        csvContent += `Taxa Média de Vitória: ${stats.avgWinRate}%\n\n`;
        
        // Add detailed table
        csvContent += 'Posição,Jogador,Pontos,Partidas,Vitórias,Empates,Derrotas,Taxa de Vitória,Última Partida\n';
        
        sortedPlayers.forEach((player, index) => {
            const winRate = player.matches > 0 ? ((player.wins / player.matches) * 100).toFixed(1) : '0.0';
            
            // Find last match date
            const playerMatches = this.matches.filter(m => 
                m.player1Id === player.id || m.player2Id === player.id
            );
            const lastMatch = playerMatches.length > 0 
                ? new Date(Math.max(...playerMatches.map(m => new Date(m.date)))).toLocaleDateString('pt-BR')
                : 'Nunca jogou';
            
            csvContent += `${index + 1},"${player.name}",${player.points},${player.matches},${player.wins},${player.draws},${player.losses},${winRate}%,${lastMatch}\n`;
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-torneio-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Relatório exportado com sucesso!');
    }

    exportData() {
        const data = {
            players: this.players,
            matches: this.matches,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-tournament-${new Date().toISOString().split('T')[0]}.json`;
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