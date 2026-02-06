// ===== PAINEL DE GESTÃO DE ENCOMENDAS =====
// Sistema de administração de pedidos e entregas

let currentUser = null;
let orders = [];
let currentOrderId = null;

// ===== CREDENCIAIS DE ADMIN LOCAL =====
const ADMIN_CREDENTIALS = {
    email: 'danielcac19@gmail.com',
    password: '6971david'
};

// ===== AUTENTICAÇÃO =====

// Verificar se já está autenticado
async function checkAuth() {
    // Verificar autenticação local
    const localAuth = localStorage.getItem('adminAuth');
    if (localAuth) {
        currentUser = JSON.parse(localAuth);
        showAdminPanel();
        return;
    }
    
    showLoginScreen();
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // Verificar credenciais locais
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        
        currentUser = {
            email: ADMIN_CREDENTIALS.email,
            name: 'Administrador',
            $id: 'local-admin'
        };
        
        // Guardar autenticação local
        localStorage.setItem('adminAuth', JSON.stringify(currentUser));
        
        showAdminPanel();
        loadOrders();
        return;
    }
    
    errorDiv.textContent = 'Email ou password incorretos. Tente novamente.';
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 3000);
});
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        // Limpar autenticação local
        localStorage.removeItem('adminAuth');
        
        // Tentar logout do Appwrite
        if (account && currentUser.$id !== 'local-admin') {
            await account.deleteSession('current');
        }
        
        currentUser = null;
        showLoginScreen();
    } catch (error) {
        console.error('Erro no logout:', error);
        // Mesmo com erro, fazer logout local
        currentUser = null;
        showLoginScreen();
    }
});

// Mostrar tela de login
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').classList.remove('active');
}

// Mostrar painel admin
function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');
    document.getElementById('userEmail').textContent = currentUser.email;
    loadProducts();
}

// ===== GESTÃO DE PRODUTOS =====

// Carregar produtos do Appwrite
async function loadProducts() {
    const container = document.getElementById('productsContainer');
    
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId
        );
        
        products = response.documents;
        updateStats();
        renderProducts();
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar produtos. Verifique a configuração do Appwrite.</p>
            </div>
        `;
    }
}

// Atualizar estatísticas
function updateStats() {
    const totalEl = document.getElementById('totalProducts');
    const newEl = document.getElementById('newProducts');
    const saleEl = document.getElementById('saleProducts');
    const categoriesEl = document.getElementById('totalCategories');
    
    const total = products.length;
    const newCount = products.filter(p => p.isNew).length;
    const saleCount = products.filter(p => p.onSale).length;
    const categories = new Set(products.map(p => p.category)).size;
    
    // Só atualizar se o valor mudou (evitar flickering)
    if (totalEl && totalEl.textContent !== String(total)) {
        totalEl.textContent = total;
    }
    if (newEl && newEl.textContent !== String(newCount)) {
        newEl.textContent = newCount;
    }
    if (saleEl && saleEl.textContent !== String(saleCount)) {
        saleEl.textContent = saleCount;
    }
    if (categoriesEl && categoriesEl.textContent !== String(categories)) {
        categoriesEl.textContent = categories;
    }
}

// Renderizar tabela de produtos
function renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (products.length === 0) {
        const emptyHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3>Nenhum produto ainda</h3>
                <p>Comece por adicionar o seu primeiro produto!</p>
            </div>
        `;
        
        // Só atualizar se o HTML mudou
        if (container.innerHTML !== emptyHTML) {
            container.innerHTML = emptyHTML;
            lastRenderedHTML = emptyHTML;
        }
        return;
    }
    
    const tableHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Stock</th>
                    <th>Tamanhos</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>
                            <img src="${getProductImageUrl(product)}" 
                                 alt="${product.title}" 
                                 class="product-image-thumb"
                                 onerror="this.src='imagem/placeholder.jpg'">
                        </td>
                        <td><strong>${product.productName || product.title || 'undefined'}</strong></td>
                        <td>${getCategoryName(product.category)}</td>
                        <td><strong>€${parseFloat(product.price || 0).toFixed(2)}</strong></td>
                        <td>${product.stockQuantity || product.stock || 0}</td>
                        <td>${formatSizes(product.sizes)}</td>
                        <td>
                            ${product.isNew ? '<span class="badge badge-new">Novo</span>' : ''}
                            ${product.onSale ? '<span class="badge badge-sale">Promoção</span>' : ''}
                        </td>
                        <td>
                            <div class="actions">
                                <button class="btn-edit" onclick="editProduct('${product.$id}')">Editar</button>
                                <button class="btn-delete" onclick="deleteProduct('${product.$id}', '${product.productName || product.title || 'produto'}')">Remover</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Só atualizar se o HTML mudou (evitar flickering)
    if (lastRenderedHTML !== tableHTML) {
        container.innerHTML = tableHTML;
        lastRenderedHTML = tableHTML;
    }
}

// Obter URL da imagem do produto
function getProductImageUrl(product) {
    if (product.imageId) {
        return getImageUrl(product.imageId);
    } else if (product.image) {
        return product.image;
    }
    return 'imagem/placeholder.jpg';
}

// Formatar tamanhos
function formatSizes(sizes) {
    if (!sizes || sizes.length === 0) return '-';
    return sizes.join(', ');
}

// Nome da categoria
function getCategoryName(category) {
    const names = {
        'men': 'Homem',
        'women': 'Mulher',
        'accessories': 'Acessórios'
    };
    return names[category] || category;
}

// ===== MODAL DE PRODUTO =====

// Abrir modal para adicionar produto
document.getElementById('addProductBtn').addEventListener('click', () => {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Produto';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').classList.remove('show');
    document.getElementById('productModal').classList.add('active');
});

// Fechar modal
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('productModal').classList.remove('active');
});

// Clique fora do modal
document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') {
        document.getElementById('productModal').classList.remove('active');
    }
});

// Upload de imagem - preview
document.getElementById('imageUpload').addEventListener('click', () => {
    document.getElementById('productImage').click();
});

document.getElementById('productImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.classList.add('show');
        };
        reader.readAsDataURL(file);
    }
});

// Submeter formulário
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'A guardar...';
    
    try {
        // Recolher dados do formulário
        const productData = {
            title: document.getElementById('productTitle').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value || '',
            material: document.getElementById('productMaterial').value || '',
            care: document.getElementById('productCare').value || '',
            isNew: document.getElementById('productIsNew').checked,
            onSale: document.getElementById('productOnSale').checked,
            sizes: getSelectedSizes()
        };
        
        // Upload de imagem se foi selecionada
        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) {
            const uploadedFile = await storage.createFile(
                appwriteConfig.storageId,
                'unique()',
                imageFile
            );
            productData.imageId = uploadedFile.$id;
        }
        
        // Criar ou atualizar produto
        if (editingProductId) {
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.productsCollectionId,
                editingProductId,
                productData
            );
            showSuccess('Produto atualizado com sucesso!');
        } else {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.productsCollectionId,
                'unique()',
                productData
            );
            showSuccess('Produto adicionado com sucesso!');
        }
        
        // Fechar modal e recarregar produtos
        document.getElementById('productModal').classList.remove('active');
        loadProducts();
        
    } catch (error) {
        console.error('Erro ao guardar produto:', error);
        alert('Erro ao guardar produto. Verifique o console para mais detalhes.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Produto';
    }
});

// Obter tamanhos selecionados
function getSelectedSizes() {
    const sizes = [];
    document.querySelectorAll('.size-checkbox:checked').forEach(checkbox => {
        sizes.push(checkbox.value);
    });
    return sizes;
}

// Editar produto
async function editProduct(productId) {
    editingProductId = productId;
    const product = products.find(p => p.$id === productId);
    
    if (!product) return;
    
    // Preencher formulário
    document.getElementById('modalTitle').textContent = 'Editar Produto';
    document.getElementById('productId').value = product.$id;
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productMaterial').value = product.material || '';
    document.getElementById('productCare').value = product.care || '';
    document.getElementById('productIsNew').checked = product.isNew || false;
    document.getElementById('productOnSale').checked = product.onSale || false;
    
    // Selecionar tamanhos
    document.querySelectorAll('.size-checkbox').forEach(checkbox => {
        checkbox.checked = product.sizes && product.sizes.includes(checkbox.value);
    });
    
    // Mostrar imagem atual
    if (product.imageId || product.image) {
        const preview = document.getElementById('imagePreview');
        preview.src = getProductImageUrl(product);
        preview.classList.add('show');
    }
    
    // Abrir modal
    document.getElementById('productModal').classList.add('active');
}

// Remover produto
async function deleteProduct(productId, productName) {
    if (!confirm(`Tem a certeza que deseja remover "${productName}"?`)) {
        return;
    }
    
    try {
        const product = products.find(p => p.$id === productId);
        
        // Remover imagem do storage se existir
        if (product && product.imageId) {
            try {
                await storage.deleteFile(appwriteConfig.storageId, product.imageId);
            } catch (error) {
                console.error('Erro ao remover imagem:', error);
            }
        }
        
        // Remover produto
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId,
            productId
        );
        
        showSuccess('Produto removido com sucesso!');
        loadProducts();
        
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        alert('Erro ao remover produto. Verifique o console para mais detalhes.');
    }
}

// Mostrar mensagem de sucesso
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 5000);
}

// ===== INICIALIZAÇÃO =====
checkAuth();
