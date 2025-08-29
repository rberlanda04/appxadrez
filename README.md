# ♟️ Chess Score Manager

Uma aplicação web moderna e intuitiva para gerenciar jogadores de xadrez, registrar partidas e acompanhar rankings automaticamente com suporte a tema claro/escuro.

## 🚀 Funcionalidades

### 👥 Gerenciamento de Jogadores
- ✅ Adicionar novos jogadores
- ✅ Editar informações dos jogadores
- ✅ Remover jogadores
- ✅ Buscar jogadores por nome
- ✅ Visualizar estatísticas individuais

### 🏆 Sistema de Pontuação
- ✅ Vitória: 3 pontos
- ✅ Empate: 1 ponto
- ✅ Derrota: 0 pontos
- ✅ Cálculo automático de pontuação

### 📊 Ranking Automático
- ✅ Classificação por pontuação total
- ✅ Critérios de desempate por vitórias
- ✅ Atualização em tempo real

### 📝 Registro de Partidas
- ✅ Registrar resultados de partidas
- ✅ Histórico completo de partidas
- ✅ Validação de dados

### 💾 Persistência de Dados
- ✅ Armazenamento local (localStorage)
- ✅ Backup e restauração de dados
- ✅ Exportação/Importação JSON

### 🎨 Interface e Temas
- ✅ Design moderno e responsivo
- ✅ **Modo claro e escuro**
- ✅ Cores neutras (preto e branco)
- ✅ Navegação por abas intuitiva
- ✅ Feedback visual para ações
- ✅ Compatível com dispositivos móveis

## 🌙 Sistema de Temas
- **Modo Claro**: Interface com fundo branco e texto preto
- **Modo Escuro**: Interface com fundo preto e texto branco
- **Alternância**: Botão no canto superior direito
- **Persistência**: Preferência salva automaticamente

## 📱 Como Usar

### Opção 1: Abrir Diretamente
1. Faça o download dos arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Comece a usar a aplicação!

### Opção 2: Servidor Local (Recomendado)
Se você tiver Python instalado:
```bash
python -m http.server 8000
```

Se você tiver Node.js instalado:
```bash
npx http-server -p 8000
```

Depois acesse: `http://localhost:8000`

### Opção 3: GitHub Pages
Este projeto pode ser facilmente hospedado no GitHub Pages:
1. Faça fork do repositório
2. Vá em Settings > Pages
3. Selecione a branch main como source
4. Acesse via URL fornecida pelo GitHub



## 🛠️ Tecnologias Utilizadas
- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com Flexbox/Grid e sistema de temas
- **JavaScript ES6+**: Lógica da aplicação e gerenciamento de temas
- **LocalStorage**: Persistência de dados e preferências
- **Font Awesome**: Ícones (incluindo ícones de lua/sol para temas)

## 🔧 Funcionalidades Técnicas
- Validação de formulários
- Busca em tempo real
- Modais de confirmação
- Notificações de feedback
- **Sistema de temas com localStorage**
- **Transições suaves entre temas**
- Responsividade completa
- Armazenamento persistente

## 🚀 Deploy no GitHub + Vercel

### **Passo 1: Subir para o GitHub**

#### Criar Repositório:
1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** → **"New repository"**
3. Nome: `chess-score-manager` (ou outro de sua escolha)
4. Marque como **público**
5. **NÃO** inicialize com README
6. Clique em **"Create repository"**

#### Comandos Git:
```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: Chess Score Manager with dark/light theme"

# Conectar com GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/chess-score-manager.git

# Fazer upload
git push -u origin main
```

### **Passo 2: Deploy na Vercel** 🚀

#### Opção A - Via GitHub (Recomendado):
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Sign up"** ou **"Login"**
3. Conecte com sua conta do **GitHub**
4. Clique em **"New Project"**
5. Selecione o repositório `chess-score-manager`
6. Clique em **"Deploy"**
7. ✅ **Pronto!** Sua aplicação estará online em segundos

#### Opção B - Via CLI da Vercel:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy (na pasta do projeto)
vercel

# Seguir as instruções no terminal
```

### **Vantagens da Vercel:**
- ⚡ **Deploy automático** a cada push no GitHub
- 🌐 **HTTPS gratuito** e CDN global
- 📱 **Preview automático** para cada branch
- 🔄 **Rollback fácil** para versões anteriores
- 📊 **Analytics integrado**

### **URLs de Exemplo:**
- **GitHub**: `https://github.com/SEU_USUARIO/chess-score-manager`
- **Vercel**: `https://chess-score-manager.vercel.app`

### **Atualizações Futuras:**
```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição da mudança"
git push

# A Vercel fará deploy automático! 🎉
```

## 📁 Estrutura do Projeto
```
chess-score-manager/
├── index.html      # Página principal com botão de tema
├── styles.css      # Estilos com suporte a modo claro/escuro
├── script.js       # Lógica JavaScript + sistema de temas
└── README.md       # Documentação
```

## 📄 Licença
Este projeto é de código aberto e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ para a comunidade de xadrez**  
**Agora com suporte a temas claro e escuro! 🌙☀️**