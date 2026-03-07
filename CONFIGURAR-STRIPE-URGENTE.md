# 🔧 URGENTE: Configurar Variáveis de Ambiente (Stripe)

## ⚠️ PROBLEMA IDENTIFICADO

O checkout não funciona porque **faltam as variáveis de ambiente no Vercel**.

Especificamente: **STRIPE_SECRET_KEY**

---

## 📋 Passo a Passo para Corrigir

### 1️⃣ Obter Chave do Stripe

1. Vai a: **https://dashboard.stripe.com/**
2. Faz login na tua conta Stripe
3. Muda para **Modo de Teste** (toggle no topo)
4. No menu lateral, vai a **Developers** → **API keys**
5. Copia a **Secret key** (começa com `sk_test_...`)
6. **⚠️ NUNCA partilhes esta chave publicamente!**

---

### 2️⃣ Configurar na Vercel (Método 1: Dashboard)

#### Opção A: Via Website

1. Vai a: **https://vercel.com/voidnixs-projects/loja_de_roupa**
2. Clica em **Settings**
3. No menu lateral, clica em **Environment Variables**
4. Clica em **Add New**

**Adiciona:**

| Key | Value | Environment |
|-----|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (tua chave) | Production |

5. Clica em **Save**

---

#### Opção B: Via CLI (Mais Rápido)

**No PowerShell, executa:**

```powershell
# Substitui SUA_CHAVE_AQUI pela chave real do Stripe
vercel env add STRIPE_SECRET_KEY
```

Quando perguntar:
- **Value:** Cola a chave `sk_test_...`
- **Environment:** Escolhe `Production` (usa setas ↑↓ e Enter)

---

### 3️⃣ Fazer Deploy (Obrigatório!)

**Depois de configurar a variável, TENS de fazer deploy novamente:**

```powershell
vercel --prod --yes
```

⚠️ **As variáveis só ficam ativas após novo deploy!**

---

### 4️⃣ Testar Checkout

1. Vai a: **https://voidnix.pt**
2. Faz login
3. Adiciona produto ao carrinho
4. Clica em **"Finalizar compra"**
5. Deve redirecionar para o Stripe Checkout! ✅

---

## 🧪 Testar Pagamento (Modo Teste)

Use estes cartões de teste do Stripe:

**Pagamento com Sucesso:**
```
Número: 4242 4242 4242 4242
Data: Qualquer data futura (ex: 12/34)
CVC: Qualquer 3 dígitos (ex: 123)
```

**Pagamento Recusado:**
```
Número: 4000 0000 0000 0002
Data: Qualquer data futura
CVC: Qualquer 3 dígitos
```

---

## ✅ Verificar se Funcionou

**Método 1: Console do Navegador**

1. Abre https://voidnix.pt
2. F12 → Console
3. Adiciona produto e faz checkout
4. Se aparecer `✅ Redirecionando para Stripe Checkout...` = FUNCIONA!

**Método 2: Vercel Logs**

```powershell
vercel logs
```

Procura por erros relacionados a `STRIPE_SECRET_KEY`

---

## 🚨 Erros Comuns

### Erro: "Configuração do Stripe ausente"
**Causa:** STRIPE_SECRET_KEY não configurada  
**Solução:** Segue os passos acima

### Erro: "Invalid API Key"
**Causa:** Chave copiada incorretamente  
**Solução:** Verifica se copiaste a chave completa (começa com `sk_test_`)

### Erro: "No such customer"
**Causa:** Problema com email do cliente  
**Solução:** Verifica se estás logado no site

---

## 📊 Variáveis Opcionais (Futuro)

Além do Stripe, podes configurar:

| Variável | Descrição | Urgência |
|----------|-----------|----------|
| `STRIPE_SECRET_KEY` | **Chave do Stripe** | 🔴 **OBRIGATÓRIA** |
| `STRIPE_WEBHOOK_SECRET` | Webhook (para confirmar pagamentos) | 🟡 Recomendado |
| `EMAIL_USER` | Email para notificações | 🟢 Opcional |
| `EMAIL_PASS` | Password do email | 🟢 Opcional |

---

## 🎯 Resumo Rápido

```powershell
# 1. Obter chave do Stripe
# Ir a: https://dashboard.stripe.com/test/apikeys

# 2. Configurar no Vercel
vercel env add STRIPE_SECRET_KEY
# (cola a chave quando pedir)

# 3. Deploy
vercel --prod --yes

# 4. Testar
# Ir a: https://voidnix.pt e fazer checkout
```

---

## 📞 Ajuda Extra

Se ainda não funcionar:
1. Verifica se estás no **modo de teste** do Stripe
2. Confirma que fizeste deploy após adicionar a variável
3. Limpa cache do browser (Ctrl+Shift+Delete)
4. Tenta em modo anónimo/privado

---

**Tempo estimado: 5 minutos** ⏱️
