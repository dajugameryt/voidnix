# 🎯 Guia Visual do Appwrite - Onde Ver Tudo

## 🌐 1. ACESSO INICIAL

**URL:** https://cloud.appwrite.io/

1. **Fazer Login** com a sua conta
2. Vai ver a lista dos seus **Projetos**
3. Clique no projeto **VoidNix** (ou o nome que deu)
   - Project ID: `68d3f276002fe7ca992d`

---

## 📊 2. MENU LATERAL (Lado Esquerdo)

Depois de entrar no projeto, vai ver o menu com estas opções:

```
┌─────────────────────────┐
│ 🏠 Overview            │ ← Visão geral do projeto
│ 👥 Auth                │ ← Ver utilizadores registados
│ 🗄️  Databases          │ ← Ver produtos, pedidos, utilizadores
│ 💾 Storage             │ ← Ver imagens dos produtos
│ ⚡ Functions           │ ← Stripe checkout
│ 🔐 API Keys            │
│ ⚙️  Settings           │
└─────────────────────────┘
```

---

## 👥 3. VER UTILIZADORES REGISTADOS

### Caminho: **Auth** → **Users**

1. Clique em **Auth** no menu lateral
2. Vai ver uma lista com TODOS os utilizadores que criaram conta:

```
┌────────────────────────────────────────────────────┐
│ 👤 Users                                          │
├────────────────────────────────────────────────────┤
│ Name          │ Email                  │ Status   │
├────────────────────────────────────────────────────┤
│ João Silva    │ joao@email.com         │ ✅ Active│
│ Maria Costa   │ maria@email.com        │ ✅ Active│
│ Daniel Cunha  │ danielcac19@gmail.com  │ ✅ Active│
└────────────────────────────────────────────────────┘
```

**Informações disponíveis para cada utilizador:**
- ✅ Nome completo
- ✅ Email
- ✅ Data de criação da conta
- ✅ Último login
- ✅ Status (ativo/inativo)
- ✅ Verificação de email
- ✅ Sessões ativas

**Para ver detalhes de um utilizador:**
- Clique no **nome** ou **email**
- Verá: sessões, logins, preferências, etc.

---

## 🗄️ 4. VER PRODUTOS

### Caminho: **Databases** → **Database** → **products**

1. Clique em **Databases** no menu lateral
2. Clique na database (ID: `69242142000e84dc2029`)
3. Clique na coleção **products**
4. Vai ver todos os produtos:

```
┌──────────────────────────────────────────────────────┐
│ 📦 products Collection                              │
├──────────────────────────────────────────────────────┤
│ productName      │ price │ category │ stockQuantity │
├──────────────────────────────────────────────────────┤
│ T-Shirt Premium  │ 29.99 │ men      │ 50           │
│ Calças Elegantes │ 59.99 │ women    │ 30           │
│ Colar Dourado    │ 19.99 │ accesso..│ 100          │
└──────────────────────────────────────────────────────┘
```

**Para editar um produto:**
- Clique no produto
- Edite os campos
- Clique em **Update**

**Para adicionar produto:**
- Clique em **Add Document** (botão no topo)
- Preencha os campos
- Clique em **Create**

---

## 📝 5. VER PEDIDOS/FATURAS

### Caminho: **Databases** → **Database** → **invoices**

1. Clique em **Databases** no menu lateral
2. Clique na database
3. Clique na coleção **invoices**
4. Vai ver todos os pedidos realizados:

```
┌─────────────────────────────────────────────────────┐
│ 📋 invoices Collection                             │
├─────────────────────────────────────────────────────┤
│ customer    │ total  │ status    │ createdAt      │
├─────────────────────────────────────────────────────┤
│ João Silva  │ 89.99  │ paid      │ 2026-03-05     │
│ Maria Costa │ 129.99 │ pending   │ 2026-03-04     │
└─────────────────────────────────────────────────────┘
```

---

## 💾 6. VER IMAGENS DOS PRODUTOS

### Caminho: **Storage** → **Bucket**

1. Clique em **Storage** no menu lateral
2. Clique no bucket (ID: `6924221900051862cf89`)
3. Vai ver todas as imagens carregadas:

```
┌────────────────────────────────────────────┐
│ 🖼️  Files                                  │
├────────────────────────────────────────────┤
│ 📷 tshirt-premium.jpg      │ 245 KB      │
│ 📷 calcas-elegantes.jpg    │ 312 KB      │
│ 📷 colar-dourado.jpg       │ 198 KB      │
└────────────────────────────────────────────┘
```

**Para adicionar imagem:**
- Clique em **Add File**
- Selecione a imagem
- Clique em **Upload**

---

## 🆕 7. CRIAR A COLEÇÃO "users" (IMPORTANTE!)

### Caminho: **Databases** → **Database** → **Create Collection**

**Passo a passo detalhado:**

### 📍 PASSO 1: Ir para Databases
```
Menu Lateral → Databases (🗄️)
```

### 📍 PASSO 2: Entrar na Database
```
Clique na database: 69242142000e84dc2029
```

### 📍 PASSO 3: Criar Nova Coleção
```
Botão no topo: [+ Create Collection]
```

### 📍 PASSO 4: Configurar Coleção
```
┌─────────────────────────────────┐
│ Collection ID: users           │ ← EXATAMENTE assim
│ Collection Name: Users         │ ← Pode ser o que quiser
└─────────────────────────────────┘
     ↓
[Create] ← Clique aqui
```

### 📍 PASSO 5: Configurar Permissões
```
Dentro da coleção "users":
Separador: Settings → Permissions

[+ Add Role]
  ↓
Role Type: Any → Users (authenticated users)
Permissions: ☑ Read  ☑ Create  ☑ Update
  ↓
[Create]
```

### 📍 PASSO 6: Adicionar Atributos (Campos)
```
Separador: Attributes → [+ Create Attribute]
```

**Clique em cada tipo e adicione:**

#### A) String Attributes (texto)
```
[String] ← Clique aqui

Criar estes 8 atributos:

1. ┌──────────────────────┐
   │ Key: name           │
   │ Size: 255           │
   │ Required: ✅ Yes     │
   └──────────────────────┘

2. ┌──────────────────────┐
   │ Key: email          │
   │ Size: 255           │
   │ Required: ✅ Yes     │
   └──────────────────────┘

3. ┌──────────────────────┐
   │ Key: phone          │
   │ Size: 20            │
   │ Required: ❌ No      │
   │ Default: ""         │
   └──────────────────────┘

4. ┌──────────────────────┐
   │ Key: address        │
   │ Size: 500           │
   │ Required: ❌ No      │
   │ Default: ""         │
   └──────────────────────┘

5. ┌──────────────────────┐
   │ Key: city           │
   │ Size: 100           │
   │ Required: ❌ No      │
   │ Default: ""         │
   └──────────────────────┘

6. ┌──────────────────────┐
   │ Key: postalCode     │
   │ Size: 20            │
   │ Required: ❌ No      │
   │ Default: ""         │
   └──────────────────────┘

7. ┌──────────────────────┐
   │ Key: country        │
   │ Size: 100           │
   │ Required: ❌ No      │
   │ Default: "Portugal" │
   └──────────────────────┘

8. ┌──────────────────────┐
   │ Key: preferences    │
   │ Size: 1000          │
   │ Required: ❌ No      │
   │ Default: "{}"       │
   └──────────────────────┘
```

#### B) DateTime Attributes (datas)
```
[DateTime] ← Clique aqui

Criar estes 2 atributos:

1. ┌──────────────────────┐
   │ Key: createdAt      │
   │ Required: ✅ Yes     │
   └──────────────────────┘

2. ┌──────────────────────┐
   │ Key: lastLogin      │
   │ Required: ✅ Yes     │
   └──────────────────────┘
```

#### C) Integer Attribute (número inteiro)
```
[Integer] ← Clique aqui

1. ┌──────────────────────┐
   │ Key: totalOrders    │
   │ Required: ❌ No      │
   │ Default: 0          │
   └──────────────────────┘
```

#### D) Float Attribute (número decimal)
```
[Float] ← Clique aqui

1. ┌──────────────────────┐
   │ Key: totalSpent     │
   │ Required: ❌ No      │
   │ Default: 0.0        │
   └──────────────────────┘
```

---

## ✅ 8. VERIFICAR SE ESTÁ A FUNCIONAR

### Depois de criar a coleção "users":

1. **Teste no site:**
   - Crie uma nova conta de teste
   - Use email diferente (ex: teste@email.com)

2. **Verifique no Appwrite:**
   ```
   Auth → Users
   ↓
   Deve aparecer o novo utilizador
   
   Databases → users collection
   ↓
   Deve aparecer o registo com os dados
   ```

3. **Dados que devem aparecer:**
   - ✅ name (nome do utilizador)
   - ✅ email
   - ✅ createdAt (data/hora de criação)
   - ✅ lastLogin (data/hora)
   - ✅ totalOrders: 0
   - ✅ totalSpent: 0.0

---

## 📱 9. VER ESTATÍSTICAS

### Caminho: **Overview** (Dashboard Principal)

```
Menu Lateral → Overview (🏠)
```

Vai ver:
- 📊 Total de utilizadores
- 📦 Total de produtos
- 💾 Espaço usado no Storage
- ⚡ Execuções de funções
- 📈 Gráficos de atividade

---

## 🔧 10. VER CONFIGURAÇÕES DO PROJETO

### Caminho: **Settings**

```
Menu Lateral → Settings (⚙️)
```

Vai ver:
- 🆔 Project ID: `68d3f276002fe7ca992d`
- 🌐 Endpoint: `https://cloud.appwrite.io/v1`
- 🔑 API Keys
- 🔐 Auth providers (Google, Facebook, etc)
- 🌍 Domínios permitidos

---

## 📊 RESUMO RÁPIDO

| O que ver | Onde ir |
|-----------|---------|
| **Utilizadores registados** | Auth → Users |
| **Produtos** | Databases → products |
| **Pedidos/Faturas** | Databases → invoices |
| **Dados de utilizadores** | Databases → users *(criar primeiro!)* |
| **Imagens** | Storage → Bucket |
| **Estatísticas** | Overview |
| **Criar coleção users** | Databases → + Create Collection |

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Não vejo a coleção users"
**Solução:** Precisa criar a coleção primeiro (ver PASSO 7 acima)

### ❌ "Não aparecem utilizadores na coleção users"
**Solução:** 
1. Verifique se a coleção foi criada com ID exatamente `users`
2. Verifique as permissões (users devem ter Read/Create/Update)
3. Crie uma conta de teste nova após configurar

### ❌ "Erro 404 ao criar utilizador"
**Solução:** A coleção não existe ou tem ID diferente de `users`

### ❌ "Erro de permissões"
**Solução:** 
1. Vá em Settings → Permissions
2. Adicione role "Users" (authenticated)
3. Marque Read, Create, Update

---

**📝 Última atualização:** Março 2026  
**🎯 Projeto:** VoidNix - Loja de Roupa Online  
**💡 Dica:** Use Ctrl+F para procurar rapidamente neste guia!
