# Configuração de Pagamentos (Stripe)

## Variáveis de Ambiente (.env)
Crie um arquivo `.env` na pasta `backend/` com as seguintes chaves:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_... (Sua chave secreta do Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (Segredo do webhook local ou produção)
STRIPE_PRICE_PREMIUM=price_... (ID do preço criado no Dashboard do Stripe)
```

## Como Testar o Webhook Localmente

1. Instale o Stripe CLI: https://stripe.com/docs/stripe-cli
2. Faça login: `stripe login`
3. Encaminhe os eventos para seu servidor local:
   ```bash
   stripe listen --forward-to localhost:3000/webhook
   ```
4. Copie o `whsec_...` gerado no terminal e cole no seu `.env` como `STRIPE_WEBHOOK_SECRET`.

## Testando o Fluxo

1. Inicie o backend: `cd backend && node index.js`
2. No frontend, clique em "Fazer Upgrade Agora" no modal.
3. Use os cartões de teste do Stripe (ex: 4242 4242 4242 4242).
4. Verifique o console do backend para ver os logs de confirmação de pagamento.
