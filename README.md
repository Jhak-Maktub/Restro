# RestroFlow SaaS

Plataforma completa de gestão para restaurantes (SaaS).

## 🚀 Como Rodar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Rode o Frontend (Site):**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173`.

3. **(Opcional) Rode o Backend:**
   Para processar pagamentos reais com Stripe, você precisa configurar o arquivo `.env` na pasta `backend/` e rodar:
   ```bash
   npm run start:backend
   ```
   *Nota: Se o backend não estiver rodando, o frontend usará o "Modo Demo" automaticamente para simular pagamentos.*

## ☁️ Deploy na Vercel

Este projeto está configurado para deploy automático na Vercel.

1. Suba este código para o GitHub.
2. Importe o projeto na Vercel.
3. As configurações de Build (`vite build`) serão detectadas automaticamente.
4. **Pronto!** Seu SaaS estará online.

> **Nota sobre o Backend na Vercel:** O deploy padrão na Vercel serve apenas o Frontend (React). O código da pasta `backend/` é um servidor Node.js tradicional. Para produção completa, recomenda-se hospedar a pasta `backend` em serviços como Render, Railway ou adaptar para Vercel Functions. O Frontend atual já trata a ausência do backend graciosamente.
