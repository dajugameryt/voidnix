# 🔧 Troubleshooting Domínio voidnix.pt no Vercel

## ⚠️ Problema: Domínio voidnix.pt não está funcionando

## ✅ Checklist de Verificação

### 1️⃣ Verificar configuração no Vercel

1. Acede ao projeto na Vercel: https://vercel.com/dashboard
2. Vai a **Settings** → **Domains**
3. Verifica se o domínio está adicionado:
   - ✅ `voidnix.pt`
   - ✅ `www.voidnix.pt`

4. **Estado do domínio deve ser:**
   - ✅ Verde (Valid Configuration)
   - ⚠️ Amarelo (Pending SSL) - aguarda 5-10 minutos
   - ❌ Vermelho (Invalid Configuration) - configuração DNS incorreta

---

### 2️⃣ Verificar configuração DNS na Amen.pt

A configuração DNS deve ser **EXATAMENTE** esta:

#### Para voidnix.pt (domínio raiz):

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |

**OU** (se a Amen pedir CNAME):

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| CNAME | @ | cname.vercel-dns.com | 3600 |

#### Para www.voidnix.pt (subdomínio):

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| CNAME | www | cname.vercel-dns.com | 3600 |

---

### 3️⃣ Passos para configurar DNS na Amen.pt

1. **Acede à Amen.pt:**
   - Vai a https://www.amen.pt
   - Faz login com as tuas credenciais

2. **Acede à gestão DNS:**
   - Clica em "Os meus domínios"
   - Seleciona `voidnix.pt`
   - Clica em "Gerir DNS" ou "Zone DNS"

3. **Elimina configurações antigas:**
   - Remove todos os registos A antigos
   - Remove todos os registos CNAME antigos (exceto subdomínios que queiras manter)

4. **Adiciona os novos registos:**
   
   **Registo A (domínio raiz):**
   ```
   Tipo: A
   Nome/Host: @ (ou deixa vazio, ou voidnix.pt)
   Valor/Destino: 76.76.21.21
   TTL: 3600
   ```

   **Registo CNAME (www):**
   ```
   Tipo: CNAME
   Nome/Host: www
   Valor/Destino: cname.vercel-dns.com
   TTL: 3600
   ```

5. **Guarda as alterações**

---

### 4️⃣ Tempo de propagação DNS

- ⏱️ **Tempo normal:** 5 minutos a 2 horas
- ⏱️ **Tempo máximo:** até 48 horas (raro)

**Como verificar se propagou:**
- Vai a https://dnschecker.org
- Escreve `voidnix.pt`
- Verifica se o IP `76.76.21.21` aparece na maioria dos servidores

---

### 5️⃣ Verificar se o deploy está ativo

1. Na Vercel, vai a **Deployments**
2. Verifica se o último deploy está com status **Ready**
3. Clica no deploy e testa o URL `.vercel.app`
   - Se o URL `.vercel.app` funciona MAS `voidnix.pt` não funciona → Problema é DNS
   - Se NENHUM funciona → Problema é no código/deploy

---

### 6️⃣ Comandos para testar

**No PowerShell (Windows):**

```powershell
# Testar DNS
nslookup voidnix.pt

# Testar conexão
curl https://voidnix.pt

# Testar www
curl https://www.voidnix.pt
```

**Resultado esperado do nslookup:**
```
Nome:    voidnix.pt
Address: 76.76.21.21
```

---

### 7️⃣ Problemas comuns e soluções

#### ❌ "SSL Certificate Error" ou "Not Secure"
**Solução:** Aguarda 5-10 minutos. A Vercel provisiona SSL automaticamente.

#### ❌ "DNS_PROBE_FINISHED_NXDOMAIN"
**Solução:** DNS não está configurado ou ainda não propagou.
- Verifica registos DNS na Amen.pt
- Aguarda propagação

#### ❌ "404 - Page Not Found"
**Solução:** 
- Verifica se `index.html` está na raiz do projeto
- Verifica se o deploy foi bem sucedido
- Ve se não há erros no build

#### ❌ "ERR_TOO_MANY_REDIRECTS"
**Solução:** 
- Verifica se tens 2 registos CNAME a apontar para o mesmo destino
- Remove duplicados

---

### 8️⃣ Configuração Alternativa (se nada funcionar)

Se a Amen.pt não aceitar o registo A ou CNAME:

**Usa Cloudflare (RECOMENDADO):**

1. Cria conta grátis na Cloudflare: https://cloudflare.com
2. Adiciona o domínio `voidnix.pt`
3. Cloudflare dará 2 nameservers (ex: `ns1.cloudflare.com`)
4. Na Amen.pt, altera os **nameservers** para os da Cloudflare
5. Na Cloudflare, adiciona os registos A/CNAME da Vercel

**Vantagens:**
- ✅ DNS mais rápido
- ✅ CDN grátis
- ✅ Proteção DDoS
- ✅ SSL automático

---

## 🎯 Checklist rápida (faz pela ordem)

- [ ] Projeto deployado na Vercel e a funcionar no URL `.vercel.app`
- [ ] Domínio `voidnix.pt` adicionado na Vercel (Settings → Domains)
- [ ] Registo A: `@` → `76.76.21.21` adicionado na Amen.pt
- [ ] Registo CNAME: `www` → `cname.vercel-dns.com` adicionado na Amen.pt
- [ ] Aguardei pelo menos 10 minutos após alterar DNS
- [ ] Testei com `nslookup voidnix.pt` e vejo o IP correto
- [ ] Domínio aparece "Valid" na Vercel
- [ ] SSL certificado ativo (cadeado verde)

---

## 📞 Ainda não funciona?

Se seguiste TODOS os passos e ainda não funciona:

1. **Tira screenshots de:**
   - Página de Domains na Vercel
   - Configuração DNS na Amen.pt
   - Resultado de `nslookup voidnix.pt`

2. **Verifica:**
   - Se o domínio não expirou
   - Se o domínio está ativo na Amen.pt
   - Se tens permissões para alterar DNS

3. **Contacta suporte:**
   - Amen.pt: suporte@amen.pt
   - Vercel: https://vercel.com/help

---

## ✅ Quando tudo funcionar

Depois do domínio estar ativo, atualiza:

1. **Stripe Dashboard:**
   - Webhook URL: `https://voidnix.pt/api/webhook`
   - Política de devolução

2. **URLs de teste:**
   - Testa checkout: `https://voidnix.pt`
   - Testa admin: `https://voidnix.pt/admin.html`
   - Testa API: `https://voidnix.pt/api/create-checkout-session`

---

**Boa sorte! 🚀**
