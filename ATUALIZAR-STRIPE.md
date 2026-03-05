# Como atualizar o Stripe para o domínio voidnix.pt

## 1. Aceder ao Stripe Dashboard

1. Vai a: https://dashboard.stripe.com
2. Faz login com a tua conta
3. Certifica-te que estás no modo **Test** (canto superior direito)

---

## 2. Atualizar Webhook URL

### Passo a passo:

1. **No menu lateral esquerdo:**
   - Clica em **"Developers"** (Programadores)
   - Clica em **"Webhooks"**

2. **Se já tens um webhook criado:**
   - Clica no webhook existente
   - Clica em **"..."** (três pontos) no canto superior direito
   - Seleciona **"Update details"** ou **"Editar"**
   - No campo **"Endpoint URL"**, APAGA o URL antigo
   - **ESCREVE:** `https://voidnix.pt/api/webhook`
   - Clica em **"Update endpoint"** ou **"Guardar"**

3. **Se NÃO tens webhook criado ainda:**
   - Clica em **"+ Add endpoint"** ou **"Adicionar endpoint"**
   - No campo **"Endpoint URL"**, escreve: `https://voidnix.pt/api/webhook`
   - Em **"Events to send"** (Eventos), seleciona:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - OU clica em **"Select all events"** (para receber todos)
   - Clica em **"Add endpoint"** ou **"Criar"**

4. **Copiar o Webhook Secret:**
   - Depois de criar/atualizar, clica no webhook
   - Procura **"Signing secret"** ou **"Webhook signing secret"**
   - Clica em **"Reveal"** ou **"Click to reveal"**
   - Copia o código (começa com `whsec_...`)
   - **GUARDA** este código - vais precisar dele para as variáveis de ambiente

---

## 3. Atualizar variáveis de ambiente na Vercel

Agora precisas atualizar o **STRIPE_WEBHOOK_SECRET** na Vercel:

1. **Acede à Vercel:**
   - Vai a: https://vercel.com/dashboard
   - Seleciona o projeto **voidnix**

2. **Ir para Settings:**
   - Clica em **"Settings"** (no topo)
   - No menu lateral, clica em **"Environment Variables"**

3. **Atualizar STRIPE_WEBHOOK_SECRET:**
   - Procura a variável **`STRIPE_WEBHOOK_SECRET`**
   - Se já existe:
     - Clica em **"..."** ao lado dela
     - Clica em **"Edit"**
     - Cola o novo webhook secret (o que copiaste do Stripe)
     - Clica em **"Save"**
   - Se NÃO existe:
     - Clica em **"Add New"**
     - Name: `STRIPE_WEBHOOK_SECRET`
     - Value: Cola o webhook secret do Stripe
     - Environment: Seleciona **Production**, **Preview**, **Development**
     - Clica em **"Save"**

4. **Confirmar outras variáveis:**
   
   Certifica-te que tens TODAS estas variáveis configuradas:
   
   ```
   STRIPE_SECRET_KEY=sk_test_... (da tua conta Stripe)
   STRIPE_WEBHOOK_SECRET=whsec_... (que acabaste de copiar)
   EMAIL_USER=voidnix.clothes@gmail.com
   EMAIL_PASS=... (app password do Gmail)
   NODE_ENV=production
   ```

5. **Redeploy (importante!):**
   - Vai a **"Deployments"** (no topo)
   - Clica nos **"..."** ao lado do último deployment
   - Clica em **"Redeploy"**
   - Confirma o redeploy
   - Aguarda alguns minutos até ficar **"Ready"**

---

## 4. Testar o Webhook

### Opção A: Teste no Stripe Dashboard

1. No Stripe Dashboard, vai ao webhook que criaste
2. Clica em **"Send test webhook"**
3. Seleciona o evento: **`checkout.session.completed`**
4. Clica em **"Send test webhook"**
5. Deve aparecer **"200 OK"** ou **"Success"**

### Opção B: Teste real (RECOMENDADO)

1. Vai ao teu site: **https://voidnix.pt**
2. Adiciona produtos ao carrinho
3. Faz checkout (usa cartão de teste do Stripe)
4. **Cartão de teste:**
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura (ex: `12/28`)
   - CVC: Qualquer 3 dígitos (ex: `123`)
   - Nome: Qualquer nome
5. Confirma o pagamento
6. Verifica se:
   - ✅ Recebes email de confirmação
   - ✅ Pedido aparece no admin
   - ✅ No Stripe Dashboard > Payments, o pagamento está "Succeeded"

---

## 5. Verificar logs (se houver problemas)

### Na Vercel:

1. Vai ao projeto na Vercel
2. Clica em **"Logs"** ou **"Runtime Logs"**
3. Procura por erros relacionados com webhook

### No Stripe:

1. Vai ao webhook
2. Clica em **"Events"** ou **"Tentativas"**
3. Vê se há erros (4xx, 5xx)

---

## 6. IMPORTANTE: Modo Production

**ATENÇÃO:** Tudo isto é para modo **TEST** do Stripe.

Quando estiveres pronto para aceitar pagamentos REAIS:

1. **No Stripe:**
   - Muda para modo **LIVE** (canto superior direito)
   - Cria NOVO webhook para produção: `https://voidnix.pt/api/webhook`
   - Copia o NOVO webhook secret (será diferente do test)

2. **Na Vercel:**
   - Atualiza as variáveis:
     - `STRIPE_SECRET_KEY` → Usa a chave **LIVE** (começa com `sk_live_...`)
     - `STRIPE_WEBHOOK_SECRET` → Usa o webhook secret **LIVE**
   - Redeploy

3. **No frontend (js/stripe-config.js):**
   - Atualiza `publishableKey` para a chave publicável **LIVE** (começa com `pk_live_...`)
   - Faz commit e push das alterações

---

## Resumo rápido (checklist)

- [ ] Aceder ao Stripe Dashboard
- [ ] Ir a Developers > Webhooks
- [ ] Criar/Atualizar webhook: `https://voidnix.pt/api/webhook`
- [ ] Copiar webhook secret (whsec_...)
- [ ] Na Vercel > Settings > Environment Variables
- [ ] Atualizar STRIPE_WEBHOOK_SECRET
- [ ] Redeploy o projeto na Vercel
- [ ] Aguardar deploy ficar Ready
- [ ] Testar pagamento no site
- [ ] Verificar se recebe email
- [ ] Verificar se aparece no admin

---

Boa sorte! 🚀
