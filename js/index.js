// ===== DADOS DOS PRODUTOS =====
let sampleProducts = [];
// Produtos carregados automaticamente do Appwrite

// ===== TABELA DE MEDIDAS (em cm) =====
const sizeMeasurements = {
    'S': {
        chest: '88-92',
        waist: '72-76',
        hips: '92-96',
        length: '68-70'
    },
    'M': {
        chest: '96-100',
        waist: '80-84',
        hips: '100-104',
        length: '70-72'
    },
    'L': {
        chest: '104-108',
        waist: '88-92',
        hips: '108-112',
        length: '72-74'
    },
    'XL': {
        chest: '112-116',
        waist: '96-100',
        hips: '116-120',
        length: '74-76'
    },
    'Único': {
        width: 'Ajustável',
        length: 'Universal',
        fit: 'Tamanho único',
        detail: 'Serve a maioria'
    }
};

// ===== CARREGAR PRODUTOS DO APPWRITE =====
async function loadProductsFromAppwrite() {
    if (!databases || !appwriteConfig.databaseId || !appwriteConfig.productsCollectionId) {
        console.error('❌ Appwrite não configurado!');
        return;
    }
    
    try {
        console.log('📦 Carregando produtos do Appwrite...');
        
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId
        );
        
        console.log(`✅ ${response.documents.length} produtos carregados!`);
        
        if (response.documents.length > 0) {
            sampleProducts = response.documents.map(doc => {
                // Obter URL da imagem (campo Image é um array de URLs)
                const imageUrl = doc.Image && doc.Image.length > 0 ? doc.Image[0] : 'https://via.placeholder.com/400';
                
                // Normalizar categoria (aceitar woman ou women)
                let category = doc.category ? doc.category.toLowerCase() : 'men';
                if (category === 'woman') category = 'women';
                
                // Definir tamanhos baseado na categoria
                let sizes = ['S', 'M', 'L', 'XL']; // Default
                if (category === 'accessories') {
                    sizes = ['Único']; // Acessórios têm tamanho único
                } else if (doc.sizes && Array.isArray(doc.sizes) && doc.sizes.length > 0) {
                    sizes = doc.sizes; // Usar tamanhos do Appwrite se existirem
                }
                
                const stock = parseInt(doc.stockQuantity) || 0;
                
                console.log(`📦 Produto: ${doc.productName}, Stock: ${stock}, Sizes: ${sizes.join(', ')}, onSale: ${doc.onSale}`);
                
                return {
                    id: doc.$id,
                    title: doc.productName || 'Produto sem nome',
                    category: category,
                    price: parseFloat(doc.price || 0),
                    sizes: sizes,
                    onSale: doc.onSale === true || doc.onSale === 'true',
                    image: imageUrl,
                    description: doc.description || (category === 'accessories' ? 
                        'Acessório versátil e elegante, perfeito para complementar qualquer look. Design moderno e atemporal, ideal para o dia a dia ou ocasiões especiais. Tamanho único ajustável.' : 
                        ''),
                    material: doc.material || (category === 'accessories' ? 'Material de alta qualidade' : '100% Algodão'),
                    care: doc.care || (category === 'accessories' ? 'Limpar com pano húmido' : 'Lavar à máquina a 30°C'),
                    stock: stock
                };
            });
            
            console.log('✅ Produtos convertidos:', sampleProducts);
            renderProducts();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
    }
}

// ===== ESTADO DA APLICAÇÃO =====
const state = {
    currentTab: 'all',
    cart: {},
    selectedSizes: {},
    searchQuery: '',
    filters: {
        new: false,
        sale: false
    },
    user: null
};

// ===== ELEMENTOS DO DOM =====
const elements = {
    productsContainer: document.getElementById('products'),
    productCount: document.getElementById('productCount'),
    noResults: document.getElementById('noResults'),
    searchInput: document.getElementById('searchInput'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    cartCount: document.getElementById('cartCount'),
    emptyCart: document.getElementById('emptyCart'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    tabs: document.querySelectorAll('.tab[data-tab]'),
    filterCheckboxes: document.querySelectorAll('.filter-checkbox'),
    productModal: document.getElementById('productModal'),
    modalOverlay: document.getElementById('modalOverlay')
};

// ===== FUNÇÕES AUXILIARES =====
function formatPrice(price) {
    return `€${parseFloat(price).toFixed(2)}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function saveCartToLocalStorage() {
    try {
        // Limpar qualquer referência fantasma
        const cleanCart = {};
        Object.keys(state.cart).forEach(key => {
            if (state.cart[key] && state.cart[key] > 0) {
                cleanCart[key] = state.cart[key];
            }
        });
        state.cart = cleanCart;
        
        const cartString = JSON.stringify(state.cart);
        console.log('💾 Salvando carrinho:', cartString);
        localStorage.setItem('voidnix-cart', cartString);
    } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
    }
}

function loadCartFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem('voidnix-cart');
        console.log('📂 Carregando carrinho do localStorage:', savedCart);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            // Limpar itens com quantidade 0 ou undefined
            const cleanCart = {};
            Object.keys(parsedCart).forEach(key => {
                if (parsedCart[key] && parsedCart[key] > 0) {
                    cleanCart[key] = parsedCart[key];
                }
            });
            state.cart = cleanCart;
            console.log('✅ Carrinho carregado:', state.cart);
        }
    } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
        state.cart = {};
    }
}

// ===== FILTROS E PESQUISA =====
function getFilteredProducts() {
    let products = [...sampleProducts];
    
    // Filtro por categoria
    if (state.currentTab !== 'all') {
        products = products.filter(p => p.category === state.currentTab);
    }
    
    // Filtro por novidades
    if (state.filters.new) {
        products = products.filter(p => p.isNew);
    }
    
    // Filtro por promoção
    if (state.filters.sale) {
        products = products.filter(p => p.onSale);
    }
    
    // Filtro por pesquisa
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        products = products.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }
    
    return products;
}

// ===== RENDERIZAÇÃO DE PRODUTOS =====
function renderProducts() {
    const products = getFilteredProducts();
    
    // Atualizar contador
    elements.productCount.textContent = `Exibindo ${products.length} produto${products.length !== 1 ? 's' : ''}`;
    
    // Limpar container
    elements.productsContainer.innerHTML = '';
    
    // Mostrar/ocultar mensagem de sem resultados
    if (products.length === 0) {
        elements.noResults.style.display = 'block';
        return;
    } else {
        elements.noResults.style.display = 'none';
    }
    
    // Agrupar produtos por categoria para separadores
    const groupedProducts = groupProductsByCategory(products);
    
    // Renderizar cada grupo com separador
    Object.keys(groupedProducts).forEach((category, index) => {
        // Adicionar separador (exceto para o primeiro grupo se for "all")
        if (state.currentTab === 'all' && groupedProducts[category].length > 0) {
            const separator = createCategorySeparator(category);
            elements.productsContainer.appendChild(separator);
        }
        
        // Renderizar produtos da categoria
        groupedProducts[category].forEach(product => {
            const card = createProductCard(product);
            elements.productsContainer.appendChild(card);
        });
    });
}

// ===== MOSTRAR MEDIDAS DOS TAMANHOS =====
function showSizeMeasurements(productId, size, buttonElement) {
    // Remover tooltips anteriores
    document.querySelectorAll('.size-guide-tooltip.show').forEach(tooltip => {
        tooltip.classList.remove('show');
    });
    
    const tooltip = document.getElementById(`size-tooltip-${productId}`);
    if (!tooltip) return;
    
    const measurements = sizeMeasurements[size];
    if (!measurements) return;
    
    // Verificar se é acessório (tamanho único)
    const isAccessory = size === 'Único';
    
    if (isAccessory) {
        tooltip.innerHTML = `
            <div class="size-tooltip-content">
                <div class="size-tooltip-header">
                    <strong>${measurements.fit}</strong>
                </div>
                <div class="size-measurements">
                    <div class="measurement-row">
                        <span>Ajuste:</span>
                        <span>${measurements.width}</span>
                    </div>
                    <div class="measurement-row">
                        <span>Tamanho:</span>
                        <span>${measurements.length}</span>
                    </div>
                    <div class="measurement-row">
                        <span>Compatibilidade:</span>
                        <span>${measurements.detail}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        tooltip.innerHTML = `
            <div class="size-tooltip-content">
                <div class="size-tooltip-header">
                    <strong>Tamanho ${size}</strong>
                </div>
                <div class="size-measurements">
                    <div class="measurement-row">
                        <span>Peito:</span>
                        <span>${measurements.chest} cm</span>
                    </div>
                    <div class="measurement-row">
                        <span>Cintura:</span>
                        <span>${measurements.waist} cm</span>
                    </div>
                    <div class="measurement-row">
                        <span>Ancas:</span>
                        <span>${measurements.hips} cm</span>
                    </div>
                    <div class="measurement-row">
                        <span>Comprimento:</span>
                        <span>${measurements.length} cm</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    tooltip.style.display = 'block';
    tooltip.classList.add('show');
    
    // Fechar ao clicar fora
    setTimeout(() => {
        const closeTooltip = (e) => {
            if (!tooltip.contains(e.target) && !buttonElement.contains(e.target)) {
                tooltip.classList.remove('show');
                document.removeEventListener('click', closeTooltip);
            }
        };
        document.addEventListener('click', closeTooltip);
    }, 100);
}

// ===== MOSTRAR MEDIDAS DOS TAMANHOS NO MODAL =====
function showSizeMeasurementsModal(productId, size, buttonElement) {
    // Remover tooltips anteriores
    document.querySelectorAll('.size-guide-tooltip.show').forEach(tooltip => {
        tooltip.classList.remove('show');
    });
    
    const tooltip = document.getElementById(`size-tooltip-modal-${productId}`);
    if (!tooltip) return;
    
    const measurements = sizeMeasurements[size];
    if (!measurements) return;
    
    // Verificar se é acessório (tamanho único)
    const isAccessory = size === 'Único';
    
    if (isAccessory) {
        tooltip.innerHTML = `
            <div class="size-tooltip-content">
                <div class="size-tooltip-header">
                    <strong>${measurements.fit}</strong>
                </div>
                <div class="size-measurements">
                    <div class="measurement-row">
                        <span>Ajuste:</span>
                        <span>${measurements.width}</span>
                    </div>
                    <div class="measurement-row">
                        <span>Tamanho:</span>
                        <span>${measurements.length}</span>
                    </div>
                    <div class="measurement-row">
                        <span>Compatibilidade:</span>
                        <span>${measurements.detail}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        tooltip.innerHTML = `
            <div class="size-tooltip-content">
                <div class="size-tooltip-header">
                    <strong>Tamanho ${size}</strong>
                </div>
                <div class="size-measurements">
                    <div class="measurement-row">
                        <span>Peito:</span>
                        <span>${measurements.chest} cm</span>
                    </div>
                    <div class="measurement-row">
                        <span>Cintura:</span>
                        <span>${measurements.waist} cm</span>
                    </div>
                    <div class="measurement-row">
                        <span>Ancas:</span>
                        <span>${measurements.hips} cm</span>
                    </div>
                    <div class="measurement-row">
                        <span>Comprimento:</span>
                        <span>${measurements.length} cm</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    tooltip.style.display = 'block';
    tooltip.classList.add('show');
}

function groupProductsByCategory(products) {
    const grouped = {
        men: [],
        women: [],
        accessories: [],
        sale: []
    };
    
    products.forEach(product => {
        if (grouped[product.category]) {
            grouped[product.category].push(product);
        }
    });
    
    return grouped;
}

function createCategorySeparator(category) {
    const separator = document.createElement('div');
    separator.className = 'category-separator';
    
    const categoryNames = {
        men: 'Homem',
        women: 'Mulher',
        accessories: 'Acessórios',
        sale: 'Promoções'
    };
    
    separator.innerHTML = `
        <div class="separator-line"></div>
        <h2 class="separator-title">${categoryNames[category] || category}</h2>
        <div class="separator-line"></div>
    `;
    
    return separator;
}

function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.style.cursor = 'pointer';
    
    const selectedSize = state.selectedSizes[product.id] || product.sizes[0];
    
    // Badge de stock ou promoção
    let badge = '';
    if (product.stock === 0) {
        badge = '<span class="product-badge badge-out-of-stock">Esgotado</span>';
    } else if (product.stock > 0 && product.stock <= 3) {
        badge = '<span class="product-badge badge-low-stock">Quase a esgotar</span>';
    } else if (product.onSale) {
        badge = '<span class="product-badge badge-sale">Promoção</span>';
    }
    
    card.innerHTML = `
        <div class="product-image-wrapper" data-view="${product.id}">
            ${badge}
            <img src="${product.image}" 
                 alt="${product.title}" 
                 class="thumb-img" 
                 loading="lazy"
                 onerror="this.src='imagem/placeholder.jpg'">
            <div class="product-overlay">
                <span class="view-details">Ver detalhes</span>
            </div>
        </div>
        
        <h3 class="product-title">${product.title}</h3>
        
        <div class="muted price">${formatPrice(product.price)}</div>
        
        <div class="size-select" data-id="${product.id}">
            ${product.sizes.map(size => `
                <button class="size-btn ${size === selectedSize ? 'selected' : ''}" 
                        data-size="${size}" 
                        data-id="${product.id}"
                        aria-label="Tamanho ${size}">
                    ${size}
                </button>
            `).join('')}
        </div>
        
        <button class="btn add-btn" 
                data-add="${product.id}"
                ${product.stock === 0 ? 'disabled' : ''}
                aria-label="Adicionar ${product.title} ao carrinho">
            ${product.stock === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
        </button>
    `;
    
    return card;
}

// ===== GERENCIAMENTO DO CARRINHO =====
function addToCart(productId, size) {
    const key = `${productId}-${size}`;
    
    console.log('🛒 Estado atual do carrinho antes de adicionar:', JSON.stringify(state.cart));
    console.log(`➕ Tentando adicionar: ${key}`);
    
    // Verificar se o produto existe e tem stock
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Produto não encontrado:', productId);
        alert('Erro: Produto não encontrado!');
        return;
    }
    
    if (product.stock === 0) {
        console.warn('❌ Produto esgotado:', product.title);
        alert('❌ Produto esgotado!\n\nEste produto não está disponível no momento.');
        return;
    }
    
    // Verificar se a quantidade no carrinho + 1 não ultrapassa o stock
    const currentQuantity = state.cart[key] || 0;
    if (currentQuantity >= product.stock) {
        console.warn('❌ Stock insuficiente:', product.title);
        alert(`❌ Stock insuficiente!\n\nApenas ${product.stock} unidades disponíveis.`);
        return;
    }
    
    // Adicionar ou incrementar
    if (state.cart[key]) {
        state.cart[key] = state.cart[key] + 1;
    } else {
        state.cart[key] = 1;
    }
    
    console.log(`✅ Adicionado ao carrinho: ${key}, Quantidade: ${state.cart[key]}`);
    console.log('🛒 Estado do carrinho após adicionar:', JSON.stringify(state.cart));
    
    saveCartToLocalStorage();
    updateCartUI();
    
    // Feedback visual
    showCartNotification();
}

function removeFromCart(key) {
    console.log(`🗑️ Removendo do carrinho: ${key}`);
    console.log('🛒 Carrinho ANTES de remover:', JSON.stringify(state.cart));
    
    // Deletar a chave
    delete state.cart[key];
    
    console.log('🛒 Carrinho DEPOIS de deletar:', JSON.stringify(state.cart));
    
    // Forçar limpeza completa salvando e recarregando
    saveCartToLocalStorage();
    
    // Recarregar do localStorage para garantir sincronização
    const savedCart = localStorage.getItem('voidnix-cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
    }
    
    console.log('🛒 Carrinho FINAL após reload:', JSON.stringify(state.cart));
    
    updateCartUI();
}

function decrementCartItem(key) {
    console.log(`➖ Decrementando: ${key}`);
    
    if (state.cart[key]) {
        state.cart[key] = state.cart[key] - 1;
        
        // Se chegar a zero, remover completamente
        if (state.cart[key] <= 0) {
            delete state.cart[key];
        }
    }
    
    console.log('🛒 Carrinho após decrementar:', JSON.stringify(state.cart));
    
    saveCartToLocalStorage();
    updateCartUI();
}

function incrementCartItem(key) {
    console.log(`➕ Incrementando: ${key}`);
    
    // Extrair productId da chave
    const [productId] = key.split('-');
    const product = sampleProducts.find(p => p.id === productId);
    
    if (!product) {
        console.error('❌ Produto não encontrado');
        return;
    }
    
    if (product.stock === 0) {
        alert('❌ Produto esgotado!');
        return;
    }
    
    const currentQuantity = state.cart[key] || 0;
    if (currentQuantity >= product.stock) {
        alert(`❌ Stock insuficiente!\n\nApenas ${product.stock} unidades disponíveis.`);
        return;
    }
    
    if (state.cart[key]) {
        state.cart[key] = state.cart[key] + 1;
    }
    
    console.log('🛒 Carrinho após incrementar:', JSON.stringify(state.cart));
    
    saveCartToLocalStorage();
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = elements.cartItems;
    cartItemsContainer.innerHTML = '';
    
    let total = 0;
    let itemCount = 0;
    
    const cartKeys = Object.keys(state.cart);
    
    // Mostrar/ocultar carrinho vazio
    if (cartKeys.length === 0) {
        elements.emptyCart.style.display = 'block';
        elements.checkoutBtn.disabled = true;
    } else {
        elements.emptyCart.style.display = 'none';
        elements.checkoutBtn.disabled = false;
    }
    
    // Renderizar itens do carrinho
    cartKeys.forEach(key => {
        const [productId, size] = key.split('-');
        const product = sampleProducts.find(p => p.id === productId);
        
        if (!product) return;
        
        const quantity = state.cart[key];
        const itemTotal = product.price * quantity;
        
        itemCount += quantity;
        total += itemTotal;
        
        const cartItem = createCartItem(product, size, quantity, key);
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Atualizar total e contador
    elements.cartTotal.textContent = formatPrice(total);
    elements.cartCount.textContent = itemCount;
}

// Função para calcular total do carrinho
function calculateTotal() {
    let total = 0;
    
    Object.keys(state.cart).forEach(key => {
        const [productId] = key.split('-');
        const product = sampleProducts.find(p => p.id === productId);
        
        if (product) {
            const quantity = state.cart[key];
            total += product.price * quantity;
        }
    });
    
    return total;
}

function createCartItem(product, size, quantity, key) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    div.innerHTML = `
        <img src="${product.image}" 
             alt="${product.title}" 
             class="mini">
        
        <div class="cart-item-info">
            <div class="cart-item-title">${product.title}</div>
            <div class="cart-item-details muted">
                Tamanho ${size} — ${formatPrice(product.price)}
            </div>
        </div>
        
        <div class="cart-item-controls">
            <button class="quantity-btn decrement-btn" 
                    data-decrement="${key}"
                    aria-label="Remover uma unidade">
                −
            </button>
            <span class="quantity-display">${quantity}</span>
            <button class="quantity-btn increment-btn" 
                    data-increment="${key}"
                    aria-label="Adicionar uma unidade">
                +
            </button>
        </div>
        
        <button class="remove-btn" 
                data-remove="${key}"
                aria-label="Remover ${product.title} do carrinho">
            ✕
        </button>
    `;
    
    // Event listeners para controles de quantidade
    const decrementBtn = div.querySelector('[data-decrement]');
    const incrementBtn = div.querySelector('[data-increment]');
    const removeBtn = div.querySelector('[data-remove]');
    
    decrementBtn.addEventListener('click', () => decrementCartItem(key));
    incrementBtn.addEventListener('click', () => incrementCartItem(key));
    removeBtn.addEventListener('click', () => removeFromCart(key));
    
    return div;
}

function showCartNotification() {
    // Adicionar animação ou notificação visual
    const cartBtn = document.getElementById('openCart');
    cartBtn.style.transform = 'scale(1.1)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 200);
}

function toggleCart(open) {
    if (open) {
        elements.cartDrawer.classList.add('open');
        elements.cartOverlay.setAttribute('aria-hidden', 'false');
        elements.cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    } else {
        elements.cartDrawer.classList.remove('open');
        elements.cartOverlay.setAttribute('aria-hidden', 'true');
        elements.cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// ===== MODAL DE PRODUTO =====
function openProductModal(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = elements.productModal;
    const selectedSize = state.selectedSizes[product.id] || product.sizes[0];
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" id="closeModal" aria-label="Fechar">✕</button>
            
            <div class="modal-grid">
                <div class="modal-image-section">
                    <img src="${product.image}" 
                         alt="${product.title}" 
                         class="modal-image"
                         onerror="this.src='imagem/placeholder.jpg'">
                    ${product.isNew ? '<span class="product-badge badge-new">Novo</span>' : ''}
                    ${product.onSale ? '<span class="product-badge badge-sale">Promoção</span>' : ''}
                </div>
                
                <div class="modal-info-section">
                    <h2 class="modal-title">${product.title}</h2>
                    <div class="modal-price">${formatPrice(product.price)}</div>
                    
                    <div class="modal-section">
                        <h3>Descrição</h3>
                        <p class="modal-description">${product.description || 'Produto de alta qualidade da coleção VoidNix.'}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3>Detalhes</h3>
                        <ul class="modal-details">
                            <li><strong>Material:</strong> ${product.material || 'Algodão premium'}</li>
                            <li><strong>Cuidados:</strong> ${product.care || 'Lavar à máquina a 30°C'}</li>
                            <li><strong>Disponibilidade:</strong> ${product.stock || 10} unidades em estoque</li>
                        </ul>
                    </div>
                    
                    <div class="modal-section">
                        <h3>Selecione o tamanho</h3>
                        <div class="size-select modal-sizes" data-id="${product.id}">
                            ${product.sizes.map(size => `
                                <button class="size-btn ${size === selectedSize ? 'selected' : ''}" 
                                        data-size="${size}" 
                                        data-id="${product.id}"
                                        title="Clique para ver medidas"
                                        aria-label="Tamanho ${size}">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                        <div class="size-guide-tooltip" id="size-tooltip-modal-${product.id}" style="display: none; position: relative;"></div>
                    </div>
                    
                    <button class="btn modal-add-btn" 
                            data-add="${product.id}"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('open');
    elements.modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Event listeners do modal
    document.getElementById('closeModal').addEventListener('click', closeProductModal);
    
    // Event listeners para botões dentro do modal
    modal.addEventListener('click', (e) => {
        // Seleção de tamanho no modal
        const sizeBtn = e.target.closest('.size-btn');
        if (sizeBtn) {
            const productId = sizeBtn.dataset.id;
            const size = sizeBtn.dataset.size;
            
            state.selectedSizes[productId] = size;
            
            // Atualizar UI
            const sizeSelect = sizeBtn.closest('.size-select');
            sizeSelect.querySelectorAll('.size-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            sizeBtn.classList.add('selected');
            
            // Mostrar tooltip com medidas no modal
            showSizeMeasurementsModal(productId, size, sizeBtn);
        }
        
        // Adicionar ao carrinho do modal
        const addBtn = e.target.closest('.modal-add-btn');
        if (addBtn) {
            const productId = addBtn.dataset.add;
            const size = state.selectedSizes[productId] || 
                         sampleProducts.find(p => p.id === productId).sizes[0];
            
            addToCart(productId, size);
            closeProductModal();
        }
    });
}

function closeProductModal() {
    elements.productModal.classList.remove('open');
    elements.modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Tabs de categorias
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover active de todas
            elements.tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            // Adicionar active na selecionada
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            // Atualizar estado e renderizar
            state.currentTab = tab.getAttribute('data-tab');
            renderProducts();
        });
    });
    
    // Toggle do dropdown de filtros
    const filterToggle = document.getElementById('filterToggle');
    const filterDropdown = document.getElementById('filterDropdown');
    
    if (filterToggle && filterDropdown) {
        filterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
            filterToggle.classList.toggle('active');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            filterDropdown.classList.remove('show');
            filterToggle.classList.remove('active');
        });
        
        filterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Pesquisa
    const handleSearch = debounce((e) => {
        state.searchQuery = e.target.value.trim();
        renderProducts();
    }, 300);
    
    elements.searchInput.addEventListener('input', handleSearch);
    
    // Filtros
    elements.filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const filterType = e.target.value;
            state.filters[filterType] = e.target.checked;
            renderProducts();
        });
    });
    
    // Produtos - delegação de eventos
    elements.productsContainer.addEventListener('click', (e) => {
        // Abrir modal de detalhes
        const imageWrapper = e.target.closest('.product-image-wrapper');
        if (imageWrapper) {
            const productId = imageWrapper.dataset.view;
            openProductModal(productId);
            return;
        }
        
        // Seleção de tamanho
        const sizeBtn = e.target.closest('.size-btn');
        if (sizeBtn) {
            const productId = sizeBtn.dataset.id;
            const size = sizeBtn.dataset.size;
            
            state.selectedSizes[productId] = size;
            
            // Atualizar UI
            const sizeSelect = sizeBtn.closest('.size-select');
            sizeSelect.querySelectorAll('.size-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            sizeBtn.classList.add('selected');
            
            return;
        }
        
        // Adicionar ao carrinho
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            const productId = addBtn.dataset.add;
            const size = state.selectedSizes[productId] || 
                         sampleProducts.find(p => p.id === productId).sizes[0];
            
            addToCart(productId, size);
        }
    });
    
    // Carrinho - abrir/fechar
    document.getElementById('openCart').addEventListener('click', () => {
        toggleCart(true);
    });
    
    document.getElementById('closeCart').addEventListener('click', () => {
        toggleCart(false);
    });
    
    elements.cartOverlay.addEventListener('click', () => {
        toggleCart(false);
    });
    
    // Tecla ESC para fechar carrinho e modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.productModal.classList.contains('open')) {
                closeProductModal();
            } else if (elements.cartDrawer.classList.contains('open')) {
                toggleCart(false);
            }
        }
    });
    
    // Fechar modal ao clicar no overlay
    elements.modalOverlay.addEventListener('click', closeProductModal);
    
    // Checkout com Stripe
    elements.checkoutBtn.addEventListener('click', handleCheckout);
}

// ===== CHECKOUT COM APPWRITE FUNCTION =====
async function handleCheckout() {
    // Verificar se o usuário está logado
    if (!state.user) {
        alert('Por favor, faça login para finalizar a compra!');
        openLoginModal();
        return;
    }
    
    // Verificar se o Appwrite está configurado
    if (!functions || !appwriteConfig.stripeCheckoutFunctionId) {
        alert('❌ Sistema de pagamento não configurado.');
        return;
    }
    
    // Verificar se o carrinho tem produtos
    if (Object.keys(state.cart).length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    try {
        // Preparar os itens do carrinho
        const lineItems = Object.entries(state.cart).map(([key, quantity]) => {
            // Separar productId e size da chave composta
            const [productId, size] = key.split('-');
            const product = sampleProducts.find(p => p.id === productId);
            
            if (!product) {
                console.error('Produto não encontrado:', productId, 'chave:', key);
                return null;
            }
            
            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.title,
                        description: `Tamanho: ${size}`,
                        images: [product.image.startsWith('http') ? product.image : `https://via.placeholder.com/400`],
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: quantity,
            };
        }).filter(item => item !== null);
        
        if (lineItems.length === 0) {
            throw new Error('Nenhum produto válido no carrinho');
        }
        
        console.log('💳 Iniciando checkout...');
        console.log('Line Items:', lineItems);
        
        // Mostrar loading
        elements.checkoutBtn.disabled = true;
        elements.checkoutBtn.textContent = 'Processando...';
        
        let checkoutUrl = null;
        
        // Tentar primeiro com Appwrite Function
        if (functions && appwriteConfig.stripeCheckoutFunctionId) {
            try {
                console.log('🔄 Tentando Appwrite Function...');
                const execution = await functions.createExecution(
                    appwriteConfig.stripeCheckoutFunctionId,
                    JSON.stringify({
                        lineItems,
                        customerEmail: state.user.email,
                    })
                );
                
                console.log('📡 Resposta da Function:', execution);
                
                if (execution.responseBody && execution.responseBody.trim() !== '') {
                    const response = JSON.parse(execution.responseBody);
                    if (response.url) {
                        checkoutUrl = response.url;
                        console.log('✅ Usando Appwrite Function');
                    }
                }
            } catch (functionError) {
                console.warn('⚠️ Appwrite Function falhou:', functionError.message);
            }
        }
        
        // Fallback: usar backend local
        if (!checkoutUrl) {
            console.log('🔄 Usando backend local como fallback...');
            const response = await fetch('http://localhost:3000/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lineItems,
                    customerEmail: state.user.email,
                }),
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (data.url) {
                checkoutUrl = data.url;
                console.log('✅ Usando backend local');
            } else {
                throw new Error('Nenhum método de checkout disponível');
            }
        }
        
        if (checkoutUrl) {
            console.log('✅ Redirecionando para Stripe Checkout...');
            
            // Salvar encomenda antes de redirecionar
            await saveOrder(lineItems, calculateTotal());
            
            // Redirecionar para o Stripe Checkout
            window.location.href = checkoutUrl;
        } else {
            throw new Error('Erro ao criar sessão de checkout');
        }
        
    } catch (error) {
        console.error('Erro no checkout:', error);
        alert(`Erro ao processar pagamento: ${error.message}`);
    } finally {
        // Restaurar botão
        elements.checkoutBtn.disabled = false;
        elements.checkoutBtn.textContent = 'Finalizar compra';
    }
}

// ===== SISTEMA DE LOGIN =====
function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const loginOverlay = document.getElementById('loginOverlay');
    
    if (!loginModal || !loginOverlay) return;
    
    loginModal.classList.add('show');
    loginOverlay.classList.add('show');
    loginModal.setAttribute('aria-hidden', 'false');
    loginOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Mostrar formulário correto
    if (state.user) {
        showUserProfile();
    } else {
        showLoginForm();
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const loginOverlay = document.getElementById('loginOverlay');
    
    if (!loginModal || !loginOverlay) return;
    
    loginModal.classList.remove('show');
    loginOverlay.classList.remove('show');
    loginModal.setAttribute('aria-hidden', 'true');
    loginOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('userProfile').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('userProfile').style.display = 'none';
}

function showUserProfile() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('userProfile').style.display = 'block';
    
    if (state.user) {
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = `Olá, ${state.user.name}!`;
        }
        
        // Verificar se é admin APENAS pelo email
        const isAdminUser = (state.user.email === 'danielcac19@gmail.com');
        
        // Mostrar botão de admin APENAS se for o email específico
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) {
            if (isAdminUser) {
                adminBtn.style.display = 'flex';
                state.user.isAdmin = true;
            } else {
                adminBtn.style.display = 'none';
                state.user.isAdmin = false;
            }
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Verificar se é admin
    const isAdmin = (email === 'danielcac19@gmail.com' && password === '6971david');
    
    // Login com Appwrite
    if (account) {
        try {
            console.log('🔐 Fazendo login no Appwrite...');
            
            // Criar sessão de email
            await account.createEmailSession(email, password);
            
            console.log('✅ Login realizado');
            
            // Obter dados do usuário
            const userData = await account.get();
            
            state.user = {
                $id: userData.$id,
                name: userData.name,
                email: userData.email,
                loginDate: new Date().toISOString(),
                isAdmin: isAdmin || email === 'danielcac19@gmail.com'
            };
            
            // Salvar no localStorage se "Lembrar-me" estiver marcado
            if (rememberMe) {
                localStorage.setItem('voidnix-user', JSON.stringify(state.user));
            }
            
            updateUserUI();
            showUserProfile();
            
            // Limpar formulário
            document.getElementById('loginFormElement').reset();
            
            // Fechar modal após 1 segundo
            setTimeout(() => {
                closeLoginModal();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            
            // Se for erro de conexão, usar modo local
            if (error.message.includes('fetch') || error.message.includes('network') || !error.code) {
                console.warn('⚠️ Appwrite não disponível, usando modo local');
                
                // Login local
                const user = {
                    name: email.split('@')[0],
                    email: email,
                    loginDate: new Date().toISOString(),
                    isAdmin: isAdmin
                };
                
                state.user = user;
                
                if (rememberMe) {
                    localStorage.setItem('voidnix-user', JSON.stringify(user));
                }
                
                updateUserUI();
                showUserProfile();
                document.getElementById('loginFormElement').reset();
                
                setTimeout(() => {
                    closeLoginModal();
                }, 500);
            } else if (error.code === 401) {
                alert('❌ Email ou palavra-passe inválidos.');
            } else {
                alert(`❌ Erro ao fazer login: ${error.message}`);
            }
        }
    } else {
        // Fallback para modo local
        const user = {
            name: email.split('@')[0],
            email: email,
            loginDate: new Date().toISOString(),
            isAdmin: isAdmin
        };
        
        state.user = user;
        
        if (rememberMe) {
            localStorage.setItem('voidnix-user', JSON.stringify(user));
        }
        
        updateUserUI();
        showUserProfile();
        document.getElementById('loginFormElement').reset();
        
        setTimeout(() => {
            closeLoginModal();
        }, 500);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('As palavras-passe não coincidem.');
        return;
    }
    
    if (password.length < 8) {
        alert('A palavra-passe deve ter no mínimo 8 caracteres.');
        return;
    }
    
    if (!acceptTerms) {
        alert('Por favor, aceite os termos e condições.');
        return;
    }
    
    // Registrar com Appwrite
    if (account) {
        try {
            console.log('🔐 Criando conta no Appwrite...');
            
            // Criar conta no Appwrite
            const userId = 'unique()';
            const newAccount = await account.create(userId, email, password, name);
            
            console.log('✅ Conta criada:', newAccount);
            
            // Fazer login automático após registro
            await account.createEmailSession(email, password);
            
            console.log('✅ Login automático realizado');
            
            // Obter dados do usuário
            const userData = await account.get();
            
            state.user = {
                $id: userData.$id,
                name: userData.name,
                email: userData.email,
                loginDate: new Date().toISOString()
            };
            
            localStorage.setItem('voidnix-user', JSON.stringify(state.user));
            updateUserUI();
            
            alert(`✅ Conta criada com sucesso! Bem-vindo, ${name}!`);
            
            // Limpar formulário
            document.getElementById('registerFormElement').reset();
            
            // Fechar modal
            setTimeout(() => {
                closeLoginModal();
            }, 500);
            
        } catch (error) {
            console.error('❌ Erro ao criar conta no Appwrite:', error);
            
            // Se for erro de conexão, usar modo local
            if (error.message.includes('fetch') || error.message.includes('network') || !error.code) {
                console.warn('⚠️ Appwrite não disponível, usando modo local');
                
                // Criar conta local
                const user = {
                    name: name,
                    email: email,
                    loginDate: new Date().toISOString()
                };
                
                state.user = user;
                localStorage.setItem('voidnix-user', JSON.stringify(user));
                updateUserUI();
                
                alert(`✅ Conta criada com sucesso! Bem-vindo, ${name}!`);
                document.getElementById('registerFormElement').reset();
                
                setTimeout(() => {
                    closeLoginModal();
                }, 500);
            } else if (error.code === 409) {
                alert('❌ Já existe uma conta com este email.');
            } else {
                alert(`❌ Erro ao criar conta: ${error.message}`);
            }
        }
    } else {
        // Fallback para modo local se Appwrite não estiver configurado
        const user = {
            name: name,
            email: email,
            loginDate: new Date().toISOString()
        };
        
        state.user = user;
        localStorage.setItem('voidnix-user', JSON.stringify(user));
        updateUserUI();
        
        alert(`✅ Conta criada com sucesso! Bem-vindo, ${name}!`);
        document.getElementById('registerFormElement').reset();
        
        setTimeout(() => {
            closeLoginModal();
        }, 500);
    }
}

function handleLogout() {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
        state.user = null;
        localStorage.removeItem('voidnix-user');
        updateUserUI();
        closeLoginModal();
    }
}

function updateUserUI() {
    const userIcon = document.getElementById('userIcon');
    
    if (state.user && userIcon) {
        // Mostrar inicial do nome
        userIcon.textContent = state.user.name.charAt(0).toUpperCase();
    } else if (userIcon) {
        userIcon.textContent = '👤';
    }
}

function loadUserFromLocalStorage() {
    try {
        const savedUser = localStorage.getItem('voidnix-user');
        if (savedUser) {
            state.user = JSON.parse(savedUser);
            
            // Verificar se é admin apenas se for o email correto
            if (state.user.email === 'danielcac19@gmail.com') {
                state.user.isAdmin = true;
                // Atualizar localStorage com a flag de admin
                localStorage.setItem('voidnix-user', JSON.stringify(state.user));
            }
            
            updateUserUI();
        }
    } catch (e) {
        console.error('Erro ao carregar utilizador:', e);
        state.user = null;
    }
}

// ===== CONFIGURAR LISTENERS DE LOGIN/REGISTRO =====
function setupLoginListeners() {
    // Botão de utilizador
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', openLoginModal);
    }
    
    // Fechar modal
    const closeLogin = document.getElementById('closeLogin');
    if (closeLogin) {
        closeLogin.addEventListener('click', closeLoginModal);
    }
    
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.addEventListener('click', closeLoginModal);
    }
    
    // Alternar entre login e registro
    const showRegister = document.getElementById('showRegister');
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    const showLogin = document.getElementById('showLogin');
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    // Formulário de login
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }
    
    // Formulário de registro
    const registerFormElement = document.getElementById('registerFormElement');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Esqueceu a palavra-passe
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidade de recuperação de palavra-passe em desenvolvimento!');
        });
    }
    
    // Login social com Firebase
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLogin);
    }
    
    const facebookBtn = document.querySelector('.btn-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', handleFacebookLogin);
    }
}

// ===== LOGIN COM GOOGLE (APPWRITE) =====
async function handleGoogleLogin() {
    // Verificar se Appwrite está configurado
    if (!account) {
        alert('⚠️ Appwrite não está configurado.');
        return;
    }
    
    try {
        console.log('🔐 Iniciando login com Google via Appwrite...');
        
        // Criar sessão OAuth2 com Google
        // Redireciona para o Google e volta para a URL de sucesso
        const currentUrl = window.location.origin + window.location.pathname;
        account.createOAuth2Session(
            'google',
            currentUrl, // Success URL - usa a URL atual
            currentUrl  // Failure URL - usa a URL atual
        );
        
        // A função createOAuth2Session redireciona automaticamente
        // Quando o usuário voltar, vamos verificar a sessão
        
    } catch (error) {
        console.error('Erro no login com Google:', error);
        alert(`Erro ao fazer login: ${error.message}`);
    }
}

// ===== LOGIN COM FACEBOOK =====
async function handleFacebookLogin() {
    // Verificar se Firebase está configurado
    if (!auth || !facebookProvider) {
        alert('⚠️ Firebase não está configurado.\n\nPara usar login com Facebook:\n1. Acesse https://console.firebase.google.com/\n2. Crie um projeto\n3. Ative "Authentication" > "Facebook"\n4. Configure as credenciais em firebase-config.js');
        return;
    }
    
    try {
        // Fazer login com popup do Facebook
        const result = await auth.signInWithPopup(facebookProvider);
        
        // Obter informações do usuário
        const user = result.user;
        
        // Salvar no estado da aplicação
        state.user = {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid,
            provider: 'facebook',
            loginDate: new Date().toISOString()
        };
        
        // Salvar no localStorage
        localStorage.setItem('voidnix-user', JSON.stringify(state.user));
        
        // Atualizar UI
        updateUserUI();
        
        // Mostrar mensagem de sucesso
        alert(`✅ Login realizado com sucesso!\nBem-vindo, ${user.displayName}!`);
        
        // Fechar modal
        setTimeout(() => {
            closeLoginModal();
        }, 500);
        
    } catch (error) {
        console.error('Erro no login com Facebook:', error);
        
        // Mensagens de erro específicas
        if (error.code === 'auth/popup-closed-by-user') {
            alert('Login cancelado.');
        } else if (error.code === 'auth/popup-blocked') {
            alert('Popup bloqueado pelo navegador. Por favor, permita popups para este site.');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            alert('Já existe uma conta com este email usando outro método de login.');
        } else {
            alert(`Erro ao fazer login: ${error.message}`);
        }
    }
}

// ===== MONITORAR ESTADO DE AUTENTICAÇÃO =====
// ===== LOGOUT COM APPWRITE =====
async function handleLogout() {
    if (confirm('Tem certeza que deseja terminar a sessão?')) {
        try {
            // Fazer logout do Appwrite
            if (account) {
                await account.deleteSession('current');
                console.log('✅ Logout do Appwrite realizado');
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        }
        
        // Limpar estado local
        state.user = null;
        localStorage.removeItem('voidnix-user');
        updateUserUI();
        closeLoginModal();
    }
}

// ===== VERIFICAR SESSÃO DO APPWRITE =====
async function checkAppwriteSession() {
    if (!account) return;
    
    try {
        // Tentar obter a sessão atual
        const session = await account.get();
        
        console.log('✅ Usuário logado:', session);
        
        // Salvar no estado
        state.user = {
            name: session.name,
            email: session.email,
            photoURL: session.prefs?.photoURL || null,
            uid: session.$id,
            provider: 'google',
            loginDate: new Date().toISOString()
        };
        
        // Salvar no localStorage
        localStorage.setItem('voidnix-user', JSON.stringify(state.user));
        
        // Atualizar UI
        updateUserUI();
        
        // Mostrar mensagem de boas-vindas (apenas se acabou de fazer login)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('success')) {
            alert(`✅ Login realizado com sucesso!\nBem-vindo, ${session.name}!`);
            // Limpar URL
            window.history.replaceState({}, document.title, window.location.pathname);
            closeLoginModal();
        }
        
    } catch (error) {
        // Usuário não está logado
        console.log('Usuário não autenticado');
    }
}

// ===== FUNCIONALIDADES DO PERFIL =====
function saveOrder(items, total) {
    const orders = JSON.parse(localStorage.getItem('voidnix-orders') || '[]');
    
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: items,
        total: total,
        status: 'Processando',
        user: state.user ? state.user.email : 'guest'
    };
    
    orders.push(newOrder);
    localStorage.setItem('voidnix-orders', JSON.stringify(orders));
    
    console.log('✅ Encomenda salva:', newOrder);
}

function setupProfileMenuListeners() {
    // Usar IDs específicos em vez de índices
    const showOrdersBtn = document.getElementById('showOrdersBtn');
    const showInvoicesBtn = document.getElementById('showInvoicesBtn');
    const showWishlistBtn = document.getElementById('showWishlistBtn');
    const showAddressesBtn = document.getElementById('showAddressesBtn');
    const showSettingsBtn = document.getElementById('showSettingsBtn');
    
    // Minhas Encomendas
    if (showOrdersBtn) {
        showOrdersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMyOrders();
        });
    }
    
    // Faturas
    if (showInvoicesBtn) {
        showInvoicesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showInvoices();
        });
    }
    
    // Lista de Desejos
    if (showWishlistBtn) {
        showWishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showWishlist();
        });
    }
    
    // Endereços
    if (showAddressesBtn) {
        showAddressesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAddresses();
        });
    }
    
    // Definições
    if (showSettingsBtn) {
        showSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSettings();
        });
    }
    
    // Fechar modais de perfil
    const closeOrdersModal = document.getElementById('closeOrdersModal');
    if (closeOrdersModal) {
        closeOrdersModal.addEventListener('click', () => {
            document.getElementById('ordersModal').classList.remove('show');
            document.getElementById('loginOverlay').classList.remove('show');
        });
    }
    
    const closeWishlistModal = document.getElementById('closeWishlistModal');
    if (closeWishlistModal) {
        closeWishlistModal.addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.remove('show');
            document.getElementById('loginOverlay').classList.remove('show');
        });
    }
    
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', () => {
            document.getElementById('settingsModal').classList.remove('show');
            document.getElementById('loginOverlay').classList.remove('show');
        });
    }
    
    // Fechar ao clicar no overlay
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.addEventListener('click', () => {
            document.getElementById('ordersModal').classList.remove('show');
            document.getElementById('wishlistModal').classList.remove('show');
            document.getElementById('settingsModal').classList.remove('show');
            document.getElementById('loginOverlay').classList.remove('show');
        });
    }
}

function showMyOrders() {
    const allOrders = JSON.parse(localStorage.getItem('voidnix-orders') || '[]');
    
    // Filtrar apenas encomendas do usuário atual
    const userEmail = state.user ? state.user.email : 'guest';
    console.log('👤 Email do usuário:', userEmail);
    console.log('📦 Total de encomendas:', allOrders.length);
    console.log('📋 Todas as encomendas:', allOrders);
    
    const orders = allOrders.filter(order => {
        console.log(`Encomenda #${order.id}: user = "${order.user}"`);
        return order.user === userEmail;
    });
    
    console.log('✅ Encomendas filtradas para este usuário:', orders.length);
    
    const modal = document.getElementById('ordersModal');
    const content = document.getElementById('ordersContent');
    
    if (orders.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>Nenhuma encomenda ainda</h3>
                <p>Quando fizer uma compra, ela aparecerá aqui!</p>
                <button class="btn btn-primary" onclick="document.getElementById('ordersModal').classList.remove('show'); document.getElementById('loginOverlay').classList.remove('show')">
                    Continuar Comprando
                </button>
            </div>
        `;
    } else {
        let ordersHTML = '';
        orders.reverse().forEach((order, index) => {
            const date = new Date(order.date).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const total = order.total.toFixed(2);
            
            let itemsHTML = '';
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    const itemName = item.price_data?.product_data?.name || 'Produto';
                    const itemDesc = item.price_data?.product_data?.description || '';
                    const itemPrice = ((item.price_data?.unit_amount || 0) / 100).toFixed(2);
                    const itemQty = item.quantity || 1;
                    
                    itemsHTML += `
                        <div class="order-item">
                            <span>${itemQty}x ${itemName} ${itemDesc}</span>
                            <span>€${itemPrice}</span>
                        </div>
                    `;
                });
            }
            
            ordersHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-number">Encomenda #${orders.length - index}</div>
                            <div class="order-date">${date}</div>
                        </div>
                        <div class="order-status">${order.status || 'Processando'}</div>
                    </div>
                    <div class="order-items">
                        ${itemsHTML}
                    </div>
                    <div class="order-total">
                        <span>Total</span>
                        <span>€${total}</span>
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = ordersHTML;
    }
    
    modal.classList.add('show');
    document.getElementById('loginOverlay').classList.add('show');
    closeLoginModal();
}

function showWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('voidnix-wishlist') || '[]');
    const modal = document.getElementById('wishlistModal');
    const content = document.getElementById('wishlistContent');
    
    if (wishlist.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <h3>Lista de desejos vazia</h3>
                <p>Adicione produtos aos favoritos para salvá-los aqui!</p>
                <button class="btn btn-primary" onclick="document.getElementById('wishlistModal').classList.remove('show'); document.getElementById('loginOverlay').classList.remove('show')">
                    Explorar Produtos
                </button>
            </div>
        `;
    } else {
        let wishlistHTML = '<div class="wishlist-grid">';
        
        wishlist.forEach(productId => {
            const product = sampleProducts.find(p => p.id === productId);
            if (product) {
                wishlistHTML += `
                    <div class="wishlist-item">
                        <button class="remove-wishlist" onclick="removeFromWishlist('${product.id}')">×</button>
                        <img src="${product.image}" alt="${product.title}">
                        <div class="wishlist-item-info">
                            <div class="wishlist-item-title">${product.title}</div>
                            <div class="wishlist-item-price">€${product.price.toFixed(2)}</div>
                            <button class="btn btn-primary" style="width: 100%; margin-top: 8px; padding: 6px;" onclick="viewProduct('${product.id}')">
                                Ver Produto
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        
        wishlistHTML += '</div>';
        content.innerHTML = wishlistHTML;
    }
    
    modal.classList.add('show');
    document.getElementById('loginOverlay').classList.add('show');
    closeLoginModal();
}

function showInvoices() {
    alert('🧾 FATURAS\n\nFuncionalidade em desenvolvimento!\n\nEm breve você poderá ver e baixar suas faturas aqui.');
}

function showAddresses() {
    alert('📍 ENDEREÇOS\n\nFuncionalidade em desenvolvimento!\n\nEm breve você poderá gerenciar seus endereços de entrega aqui.');
}

function showSettings() {
    if (!state.user) return;
    
    const modal = document.getElementById('settingsModal');
    const content = document.getElementById('settingsContent');
    
    content.innerHTML = `
        <div class="settings-section">
            <h3>Informações Pessoais</h3>
            <div class="settings-item">
                <div>
                    <div class="settings-label">Nome</div>
                    <div class="settings-value">${state.user.name || 'Não definido'}</div>
                </div>
                <button class="btn-edit" onclick="alert('Edição de perfil em desenvolvimento!')">Editar</button>
            </div>
            <div class="settings-item">
                <div>
                    <div class="settings-label">Email</div>
                    <div class="settings-value">${state.user.email || 'Não definido'}</div>
                </div>
                <button class="btn-edit" onclick="alert('Edição de email em desenvolvimento!')">Editar</button>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Conta</h3>
            <div class="settings-item">
                <div>
                    <div class="settings-label">Método de Login</div>
                    <div class="settings-value">${state.user.provider === 'google' ? 'Google OAuth' : 'Email/Senha'}</div>
                </div>
            </div>
            <div class="settings-item">
                <div>
                    <div class="settings-label">Data de Cadastro</div>
                    <div class="settings-value">${new Date(state.user.loginDate).toLocaleDateString('pt-PT')}</div>
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Ações</h3>
            <button class="btn btn-secondary" style="width: 100%; margin-bottom: 8px;" onclick="alert('Alteração de senha em desenvolvimento!')">
                Alterar Palavra-passe
            </button>
            <button class="btn btn-secondary" style="width: 100%; margin-bottom: 8px; background: #ef4444; border-color: #ef4444;" onclick="if(confirm('Tem certeza que deseja eliminar sua conta? Esta ação não pode ser desfeita.')) alert('Funcionalidade em desenvolvimento!')">
                Eliminar Conta
            </button>
        </div>
    `;
    
    modal.classList.add('show');
    document.getElementById('loginOverlay').classList.add('show');
    closeLoginModal();
}

// Funções auxiliares para wishlist
function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('voidnix-wishlist') || '[]');
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('voidnix-wishlist', JSON.stringify(wishlist));
    showWishlist(); // Recarregar
}

function addToWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('voidnix-wishlist') || '[]');
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('voidnix-wishlist', JSON.stringify(wishlist));
        alert('❤️ Produto adicionado à lista de desejos!');
    } else {
        alert('Este produto já está na sua lista de desejos.');
    }
}

function viewProduct(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
        document.getElementById('wishlistModal').classList.remove('show');
    }
}

// ===== INICIALIZAÇÃO =====
async function init() {
    loadCartFromLocalStorage();
    loadUserFromLocalStorage();
    setupEventListeners();
    setupLoginListeners();
    setupProfileMenuListeners();
    
    // Carregar produtos do Appwrite (já renderiza produtos locais se falhar)
    await loadProductsFromAppwrite();
    
    // Verificar sessão do Appwrite (não afeta visualização de produtos)
    await checkAppwriteSession();
    
    updateCartUI();
    
    // Atualizar produtos automaticamente a cada 30 segundos
    setInterval(async () => {
        console.log('🔄 Atualizando produtos do Appwrite...');
        await loadProductsFromAppwrite();
    }, 30000); // 30 segundos
}

// Iniciar aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}