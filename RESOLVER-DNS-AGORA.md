# RESOLVER AGORA: Configurar DNS voidnix.pt para Vercel

## PROBLEMA IDENTIFICADO
O dominio voidnix.pt esta a apontar para os servidores da Amen.pt, NAO para a Vercel.

- IP atual: 216.198.78.1 (ERRADO - Amen.pt)
- IP correto: 76.76.21.21 (CERTO - Vercel)

---

## SOLUCAO PASSO-A-PASSO

### 1. Aceder a Amen.pt

1. Vai a https://www.amen.pt
2. Faz login com o teu utilizador e password
3. Clica em "Os meus dominios" ou "My Domains"
4. Seleciona o dominio **voidnix.pt**

### 2. Aceder as configuracoes DNS

Procura uma destas opcoes (depende da interface da Amen):
- "Gerir DNS"
- "Zone DNS"  
- "DNS Management"
- "Configuracao DNS"

### 3. ELIMINAR registos antigos

**IMPORTANTE:** Remove TODOS os registos A e CNAME atuais:

APAGAR:
- [X] Registo A: @ -> 216.198.78.1
- [X] Registo CNAME: www -> onstatic-pt.setupdns.net
- [X] Qualquer outro registo A ou CNAME relacionado

### 4. ADICIONAR registos novos da Vercel

#### Registo A (dominio raiz):

```
Tipo: A
Nome/Host: @ 
          (ou deixa vazio)
          (ou escreve "voidnix.pt")
Valor/Destino: 76.76.21.21
TTL: 3600
```

#### Registo CNAME (www):

```
Tipo: CNAME
Nome/Host: www
Valor/Destino: cname.vercel-dns.com
TTL: 3600
```

### 5. GUARDAR alteracoes

- Clica em "Guardar", "Save", "Aplicar" ou "Apply"
- AGUARDA a confirmacao que as alteracoes foram guardadas

### 6. AGUARDAR propagacao

- Tempo minimo: 5-10 minutos
- Tempo normal: 30 minutos a 2 horas
- Tempo maximo: 48 horas (raro)

---

## VERIFICAR se funcionou

### Opcao 1: Site online (mais facil)

Vai a https://dnschecker.org/#A/voidnix.pt

Esperas ver:
- IP: **76.76.21.21** em todos (ou maioria) dos servidores
- Cor VERDE

### Opcao 2: PowerShell (no teu PC)

```powershell
# Limpar cache DNS
Clear-DnsClientCache

# Verificar DNS
nslookup voidnix.pt

# Deve mostrar:
# Address: 76.76.21.21
```

---

## NOTA IMPORTANTE

### Se a Amen.pt NAO ACEITAR o registo A

Algumas operadoras nao permitem registos A no dominio raiz (@).

**OPCAO ALTERNATIVA - Usar apenas CNAME:**

Se a Amen mostrar erro ao adicionar o registo A, tenta:

#### Opcao A: CNAME Flattening (se a Amen suportar)
```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com
```

#### Opcao B: ALIAS Record (se a Amen suportar)  
```
Tipo: ALIAS
Nome: @
Valor: cname.vercel-dns.com
```

#### Opcao C: Contactar suporte Amen
Se nenhuma opcao acima funcionar:
- Email: suporte@amen.pt
- Telefone: Verifica no site da Amen
- Pede ajuda para apontar voidnix.pt para a Vercel (IP 76.76.21.21)

---

## DEPOIS de funcionar

Quando o dominio estiver a funcionar (DNS propagado):

### 1. Atualizar Stripe

Vai ao Stripe Dashboard:
- Webhook URL: `https://voidnix.pt/api/webhook`

### 2. Testar tudo

- [ ] Site: https://voidnix.pt
- [ ] Admin: https://voidnix.pt/admin.html  
- [ ] API: Fazer um teste de checkout

---

## AINDA NAO FUNCIONA?

Se depois de 2 horas ainda nao funcionar:

1. **Verifica se guardaste as alteracoes na Amen.pt**
2. **Limpa cache DNS:**
   ```powershell
   Clear-DnsClientCache
   ipconfig /flushdns
   ```
3. **Testa noutro dispositivo/rede** (4G do telemovel)
4. **Contacta o suporte da Amen.pt**

---

## ATALHO - Mudar para Cloudflare (RECOMENDADO)

Se tiveres problemas com a Amen.pt, podes usar o Cloudflare GRATIS:

1. Cria conta: https://cloudflare.com
2. Adiciona dominio voidnix.pt
3. Cloudflare dara 2 nameservers (ex: ns1.cloudflare.com)
4. Na Amen.pt, muda os NAMESERVERS para os da Cloudflare
5. Na Cloudflare, adiciona:
   - Registo A: @ -> 76.76.21.21
   - Registo CNAME: www -> cname.vercel-dns.com

**Vantagens Cloudflare:**
- DNS mais rapido
- CDN gratis
- Mais facil de configurar
- Protecao DDoS

---

Boa sorte! Qualquer duvida, ve o ficheiro TROUBLESHOOTING-DOMINIO-VERCEL.md
