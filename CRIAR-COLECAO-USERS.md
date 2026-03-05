# 📝 Como Criar a Coleção "users" no Appwrite

## ✅ O que já funciona:
- ✅ Registro de utilizadores (salvo no Appwrite Account)
- ✅ Login seguro com Appwrite
- ✅ Sessões protegidas

## 🎯 Porquê criar a coleção "users"?
A coleção "users" vai guardar dados **adicionais** dos utilizadores como:
- 📍 Endereço de envio
- 📞 Telefone
- 📊 Histórico de compras
- 💰 Total gasto
- ⏰ Data de criação e último login

---

## 🚀 Passo a Passo (5 minutos)

### 1️⃣ Aceder ao Appwrite Dashboard
1. Vá a: https://cloud.appwrite.io/
2. Faça login na sua conta
3. Selecione o projeto **VoidNix** (ID: `68d3f276002fe7ca992d`)

### 2️⃣ Criar a Base de Dados (se ainda não existe)
1. No menu lateral, clique em **Databases**
2. Verifique se existe a database com ID: `69242142000e84dc2029`
3. Se não existir, clique em **Create Database** e use este ID

### 3️⃣ Criar a Coleção "users"
1. Dentro da Database, clique em **Create Collection**
2. **Collection ID**: `users` (exatamente assim, em minúsculas)
3. **Collection Name**: `Users` ou `Utilizadores`
4. Clique em **Create**

### 4️⃣ Configurar Permissões da Coleção
1. Clique na coleção **users** que acabou de criar
2. Vá ao separador **Settings** > **Permissions**
3. Adicione as seguintes permissões:

   **Para utilizadores autenticados:**
   - Role: `users` (qualquer utilizador autenticado)
   - Permissions: ✅ Read, ✅ Create, ✅ Update

   **Para criar:**
   - Clique em **+ Add Role**
   - Selecione **Any** > **Users** (authenticated users)
   - Marque: Read, Create, Update
   - Clique em **Create**

### 5️⃣ Criar Atributos (Campos)
Vá ao separador **Attributes** e crie os seguintes campos clicando em **+ Create Attribute**:

#### String Attributes:
| Atributo | Tipo | Tamanho | Required | Default |
|----------|------|---------|----------|---------|
| `name` | String | 255 | ✅ Sim | - |
| `email` | String | 255 | ✅ Sim | - |
| `phone` | String | 20 | ❌ Não | "" |
| `address` | String | 500 | ❌ Não | "" |
| `city` | String | 100 | ❌ Não | "" |
| `postalCode` | String | 20 | ❌ Não | "" |
| `country` | String | 100 | ❌ Não | "Portugal" |
| `preferences` | String | 1000 | ❌ Não | "{}" |

#### DateTime Attributes:
| Atributo | Tipo | Required | Default |
|----------|------|----------|---------|
| `createdAt` | DateTime | ✅ Sim | - |
| `lastLogin` | DateTime | ✅ Sim | - |

#### Integer Attribute:
| Atributo | Tipo | Required | Default |
|----------|------|----------|---------|
| `totalOrders` | Integer | ❌ Não | 0 |

#### Float Attribute:
| Atributo | Tipo | Required | Default |
|----------|------|----------|---------|
| `totalSpent` | Float | ❌ Não | 0.0 |

### 6️⃣ Criar Índices (Opcional mas Recomendado)
1. Vá ao separador **Indexes**
2. Clique em **+ Create Index**
3. Crie os seguintes índices:

   **Índice para email:**
   - Index Key: `email_index`
   - Type: Key
   - Attributes: `email`
   - Order: ASC

   **Índice para createdAt:**
   - Index Key: `created_index`
   - Type: Key
   - Attributes: `createdAt`
   - Order: DESC

---

## 🎉 Pronto!

Depois de criar a coleção:
1. **Teste o registro**: Crie uma nova conta no site
2. **Verifique no Appwrite**: Vá à coleção "users" e veja o novo utilizador
3. **Dados salvos**: Nome, email, data de criação, último login

## 📊 O que acontece automaticamente:

### Ao criar conta:
- ✅ Utilizador criado no Appwrite Account
- ✅ Dados salvos na coleção "users"
- ✅ Data de criação registada
- ✅ Último login atualizado

### Ao fazer login:
- ✅ Sessão criada no Appwrite
- ✅ Último login atualizado na coleção

### No futuro:
- 📦 Histórico de pedidos
- 💰 Total gasto calculado
- 📍 Endereços de envio salvos
- ⭐ Preferências do utilizador

---

## ⚠️ Notas Importantes:

1. **ID da Coleção**: Deve ser exatamente `users` (sem maiúsculas)
2. **Permissões**: Certifique-se que utilizadores autenticados têm Read/Create/Update
3. **Atributos Obrigatórios**: name, email, createdAt, lastLogin
4. **Teste**: Crie uma conta de teste após configurar

## 🆘 Precisa de Ajuda?

Se encontrar erros no console do navegador:
- ✅ Verifique se o Collection ID é exatamente `users`
- ✅ Verifique se as permissões estão corretas
- ✅ Verifique se todos os atributos obrigatórios foram criados
- ✅ Recarregue a página após criar a coleção

---

**📝 Criado em**: Março 2026  
**🎯 Projeto**: VoidNix - Loja de Roupa Online
