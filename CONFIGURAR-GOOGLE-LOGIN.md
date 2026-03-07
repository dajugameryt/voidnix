# 🔧 Configurar Login com Google no Appwrite

## ⚠️ IMPORTANTE: Configuração Necessária

Para o login com Google funcionar, precisas configurar o OAuth2 no Appwrite.

---

## 📋 Passos para Configurar

### 1️⃣ Aceder ao Appwrite Console

1. Vai a: **https://cloud.appwrite.io/**
2. Faz login na tua conta
3. Seleciona o projeto: **voidnix** (Project ID: `68d3f276002fe7ca992d`)

---

### 2️⃣ Ativar Google OAuth2

1. No menu lateral, vai a **Auth** → **Settings**
2. Procura a secção **OAuth2 Providers**
3. Encontra **Google** na lista
4. Clica para expandir

---

### 3️⃣ Obter Credenciais do Google

Precisas criar credenciais OAuth2 no Google Cloud Console:

#### A. Aceder ao Google Cloud Console
1. Vai a: **https://console.cloud.google.com/**
2. Cria um novo projeto (ou seleciona um existente)
3. Nome sugerido: **VoidNix**

#### B. Ativar Google+ API
1. No menu, vai a **APIs & Services** → **Library**
2. Procura por **Google+ API**
3. Clica em **Enable**

#### C. Criar Credenciais OAuth2
1. Vai a **APIs & Services** → **Credentials**
2. Clica em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Escolhe **Application type**: **Web application**
4. Nome: **VoidNix Login**

#### D. Configurar URLs Autorizados

**Authorized JavaScript origins:**
```
https://voidnix.pt
http://localhost
https://cloud.appwrite.io
```

**Authorized redirect URIs:**
```
https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68d3f276002fe7ca992d
https://voidnix.pt
http://localhost
```

⚠️ **IMPORTANTE:** Substitui `68d3f276002fe7ca992d` pelo teu Project ID se for diferente

5. Clica em **Create**
6. **Copia o Client ID e Client Secret**

---

### 4️⃣ Configurar no Appwrite

Volta ao Appwrite Console:

1. Na secção **Google OAuth2**
2. Cola o **App ID** (Client ID do Google)
3. Cola o **App Secret** (Client Secret do Google)
4. Clica em **Update**

---

### 5️⃣ Testar Login com Google

1. Vai a: **https://voidnix.pt**
2. Clica no botão de utilizador (👤)
3. Clica em **"Continuar com Google"**
4. Autoriza o acesso
5. Deves ser redirecionado de volta ao site com login feito!

---

## ✅ Verificação

Depois de configurar, o login com Google deve:
- ✅ Abrir popup do Google
- ✅ Pedir autorização
- ✅ Redirecionar de volta para voidnix.pt
- ✅ Criar conta automaticamente no Appwrite
- ✅ Fazer login automaticamente
- ✅ Mostrar perfil do utilizador

---

## ⚠️ Problemas Comuns

### Erro: "redirect_uri_mismatch"
**Solução:** Verifica se o redirect URI no Google Cloud Console está correto:
```
https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68d3f276002fe7ca992d
```

### Erro: "invalid_client"
**Solução:** Verifica se copiaste corretamente o Client ID e Client Secret

### Login não funciona
**Solução:** 
1. Limpa cache do navegador
2. Verifica se Google+ API está ativada
3. Verifica se as URLs estão corretas

---

## 📦 Depois de Configurar

Faz deploy novamente:
```powershell
vercel --prod --yes
```

---

## 🔗 Links Úteis

- Google Cloud Console: https://console.cloud.google.com/
- Appwrite Console: https://cloud.appwrite.io/
- Appwrite OAuth2 Docs: https://appwrite.io/docs/products/auth/oauth2

---

**⚠️ IMPORTANTE:** Sem esta configuração, o botão do Google irá mostrar um erro. Se não quiseres configurar agora, os utilizadores ainda podem criar conta com email e palavra-passe!
