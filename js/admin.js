// ===== PAINEL DE GESTÃO DE ENCOMENDAS =====

let currentUser = null;
let orders = [];
let currentOrderId = null;

const ADMIN_CREDENTIALS = {
    email: 'danielcac19@gmail.com',
    password: '6971david'
};

// ===== INICIALIZAÇÃO =====
// Aguardar DOM carregar antes de adicionar event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, inicializando painel admin...');
    
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Atualizar encomendas
    const refreshBtn = document.getElementById('refreshOrdersBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadOrders();
            showSuccess('🔄 Encomendas atualizadas!');
        });
    }
    
    // Fechar modais
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('orderModal').style.display = 'none';
        });
    }
    
    const closeOrderModal = document.getElementById('closeOrderModal');
    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            document.getElementById('orderModal').style.display = 'none';
        });
    }
    
    // Salvar alterações da encomenda
    const saveOrderStatus = document.getElementById('saveOrderStatus');
    if (saveOrderStatus) {
        saveOrderStatus.addEventListener('click', handleSaveOrder);
    }
    
    // Verificar autenticação
    checkAuth();
});

// ===== AUTENTICAÇÃO =====

async function checkAuth() {
    const localAuth = localStorage.getItem('adminAuth');
    if (localAuth) {
        currentUser = JSON.parse(localAuth);
        showAdminPanel();
        return;
    }
    showLoginScreen();
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    console.log('🔐 Tentando fazer login...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    console.log('📧 Email digitado:', email);
    console.log('🔑 Password digitado:', password ? '***' : 'vazio');
    console.log('✅ Email correto:', ADMIN_CREDENTIALS.email);
    console.log('✅ Password correto:', ADMIN_CREDENTIALS.password);
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        currentUser = {
            email: ADMIN_CREDENTIALS.email,
            name: 'Administrador',
            $id: 'local-admin'
        };
        
        localStorage.setItem('adminAuth', JSON.stringify(currentUser));
        showAdminPanel();
        return;
    }
    
    if (errorDiv) {
        errorDiv.textContent = 'Email ou password incorretos.';
        errorDiv.classList.add('show');
        setTimeout(() => errorDiv.classList.remove('show'), 3000);
    }
}

// Logout Handler
function handleLogout() {
    localStorage.removeItem('adminAuth');
    currentUser = null;
    showLoginScreen();
}

// Mostrar/Esconder telas
function showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminPanel) adminPanel.classList.remove('active');
}

function showAdminPanel() {
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const userEmail = document.getElementById('userEmail');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminPanel) adminPanel.classList.add('active');
    if (userEmail) userEmail.textContent = currentUser.email;
    
    console.log('✅ Painel admin exibido, carregando encomendas...');
    
    // Forçar carregamento imediato
    setTimeout(() => {
        loadOrders();
    }, 100);
}

// ===== GESTÃO DE ENCOMENDAS =====

// Carregar encomendas
async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (!container) {
        console.error('❌ Container ordersContainer não encontrado!');
        return;
    }
    
    console.log('🔄 Carregando encomendas...');
    
    try {
        const savedOrders = localStorage.getItem('voidnix-orders');
        orders = savedOrders ? JSON.parse(savedOrders) : [];
        
        console.log('📦 Encomendas carregadas:', orders);
        console.log('📊 Total de encomendas:', orders.length);
        
        updateStats();
        renderOrders();
        
    } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p style="color: red;">Erro ao carregar encomendas.</p>
                <p style="font-size: 12px; color: #666;">${error.message}</p>
            </div>
        `;
    }
}

// Atualizar estatísticas
function updateStats() {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pendente' || o.status === 'Processando').length;
    const shipped = orders.filter(o => o.status === 'Enviado').length;
    const delivered = orders.filter(o => o.status === 'Entregue').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('shippedOrders').textContent = shipped;
    document.getElementById('deliveredOrders').textContent = delivered;
}

// Renderizar lista de encomendas
function renderOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (!container) {
        console.error('❌ Container não encontrado no renderOrders!');
        return;
    }
    
    console.log('🎨 Renderizando', orders.length, 'encomendas...');
    
    if (orders.length === 0) {
        console.log('ℹ️ Nenhuma encomenda encontrada. Mostrando empty state.');
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 80px; height: 80px; margin: 0 auto 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3>Nenhuma encomenda ainda</h3>
                <p>As encomendas dos clientes aparecerão aqui quando fizerem compras!</p>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Faça uma compra de teste na loja para ver aparecer aqui.</p>
            </div>
        `;
        return;
    }
    
    console.log('✅ Renderizando tabela com', orders.length, 'encomendas');
    
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tableHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Produtos</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${sortedOrders.map((order, index) => `
                    <tr>
                        <td><strong>#${orders.length - index}</strong></td>
                        <td>${formatDate(order.date)}</td>
                        <td>${order.user || 'Convidado'}</td>
                        <td>${order.items ? order.items.length : 0} item(s)</td>
                        <td><strong>€${parseFloat(order.total || 0).toFixed(2)}</strong></td>
                        <td>${getStatusBadge(order.status)}</td>
                        <td>
                            <div class="actions">
                                <button class="btn-edit" onclick="viewOrder(${order.id})">Ver Detalhes</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Badge de status
function getStatusBadge(status) {
    const badges = {
        'Pendente': '<span class="badge" style="background: #fbbf24; color: #000;">⏳ Pendente</span>',
        'Processando': '<span class="badge" style="background: #3b82f6; color: #fff;">🔄 Processando</span>',
        'Enviado': '<span class="badge" style="background: #8b5cf6; color: #fff;">📦 Enviado</span>',
        'Entregue': '<span class="badge" style="background: #10b981; color: #fff;">✅ Entregue</span>',
        'Cancelado': '<span class="badge" style="background: #ef4444; color: #fff;">❌ Cancelado</span>'
    };
    return badges[status] || badges['Pendente'];
}

// Ver detalhes da encomenda
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailsContent');
    
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const name = item.price_data?.product_data?.name || 'Produto';
            const desc = item.price_data?.product_data?.description || '';
            const price = ((item.price_data?.unit_amount || 0) / 100).toFixed(2);
            const qty = item.quantity || 1;
            
            itemsHTML += `
                <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <div>
                        <strong>${qty}x ${name}</strong>
                        <div style="color: #666; font-size: 14px;">${desc}</div>
                    </div>
                    <div style="font-weight: 600;">€${price}</div>
                </div>
            `;
        });
    }
    
    content.innerHTML = `
        <div style="padding: 20px;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px;">📦 Encomenda #${orderId}</h3>
                <p><strong>Data:</strong> ${formatDate(order.date)}</p>
                <p><strong>Cliente:</strong> ${order.user || 'Convidado'}</p>
                <p><strong>Total:</strong> €${parseFloat(order.total || 0).toFixed(2)}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">Produtos:</h4>
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${itemsHTML}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('orderStatus').value = order.status || 'Pendente';
    document.getElementById('trackingNumber').value = order.trackingNumber || '';
    
    modal.style.display = 'flex';
}

// Salvar alterações da encomenda
function handleSaveOrder() {
    if (!currentOrderId) return;
    
    const newStatus = document.getElementById('orderStatus').value;
    const trackingNumber = document.getElementById('trackingNumber').value;
    
    const orderIndex = orders.findIndex(o => o.id === currentOrderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        orders[orderIndex].trackingNumber = trackingNumber;
        
        localStorage.setItem('voidnix-orders', JSON.stringify(orders));
        
        updateStats();
        renderOrders();
        
        showSuccess('✅ Encomenda atualizada com sucesso!');
        
        document.getElementById('orderModal').style.display = 'none';
    }
}

// Mensagem de sucesso
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (!successDiv) return;
    
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 3000);
}
