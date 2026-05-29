# Facial Analysis — Premium Edition

Aplicativo Premium de análise de beleza com IA.

## 🚀 Instalação e Setup

### Pré-requisitos
- Node.js 16+ 
- NPM ou Yarn
- Chave de API da Anthropic

### Passo 1: Clone e instale

```bash
git clone https://github.com/carlossousak12-del/Facial-analysis.git
cd Facial-analysis
npm install
```

### Passo 2: Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Adicione sua chave de API da Anthropic:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

**Onde obter a API Key:**
1. Vá para https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Crie uma nova chave de API
4. Copie e adicione ao arquivo `.env`

### Passo 3: Inicie o servidor

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
.
├── index.html          # Frontend (HTML/CSS/JS)
├── server.js           # Backend (Express)
├── package.json        # Dependências
├── .env.example        # Template de variáveis
├── .gitignore          # Arquivos ignorados
└── README.md           # Este arquivo
```

## 🔧 Arquitetura

### Backend (Node.js + Express)
- Recebe imagens do frontend em base64
- Valida os dados de entrada
- Faz requisições seguras para a API Anthropic (Claude)
- Retorna análise formatada em JSON

### Frontend (HTML + CSS + JavaScript)
- Interface minimalista e elegante
- Upload de imagens com drag-and-drop
- Animações de progresso
- Renderização dinâmica de relatórios

## 🛡️ Segurança

✅ **API Key protegida no servidor** - Nunca exposta no frontend
✅ **CORS configurado** - Apenas requisições do próprio servidor
✅ **Validação de entrada** - Verifica tipos MIME e tamanho
✅ **Tratamento de erros robusto** - Mensagens úteis ao usuário

## 📦 Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Heroku
```bash
heroku create app-name
heroku config:set ANTHROPIC_API_KEY=your_key
git push heroku main
```

## 🐛 Troubleshooting

**Erro: "API key not configured"**
- Verifique se a variável de ambiente `ANTHROPIC_API_KEY` está no arquivo `.env`

**Erro: "Failed to analyze image"**
- Verifique sua conexão com a internet
- Confirme se a API Key da Anthropic é válida
- Verifique os logs do servidor

**Porta já em uso**
- Mude a porta no arquivo `.env`: `PORT=3001`

## 📝 Licença

MIT

## 👤 Autor

Carlos Sousa (@carlossousak12-del)

---

**Versão:** 3.0 Premium
**Última atualização:** 2026-05-29