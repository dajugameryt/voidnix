// Fun\u00e7\u00e3o para salvar pedido com sessionId e criar fatura
function saveOrder(items, total, sessionId = null) {
    const orders = JSON.parse(localStorage.getItem('voidnix-orders') || '[]');
    
    const newOrder = {
        id: Date.now(),
        sessionId: sessionId || `local-${Date.now()}`,
        date: new Date().toISOString(),
        items: items,
        total: total,
        status: 'Processando',
        user: state.user ? state.user.email : 'guest',
        customerName: state.user ? state.user.name : 'Convidado',
        customerEmail: state.user ? state.user.email : ''
    };
    
    orders.push(newOrder);
    localStorage.setItem('voidnix-orders', JSON.stringify(orders));
    
    console.log('\u2705 Encomenda salva:', newOrder);
    
    // Criar fatura tamb\u00e9m
    saveInvoice(newOrder);
}

// Fun\u00e7\u00e3o para salvar fatura no localStorage (e futuramente no Appwrite)
async function saveInvoice(order) {
    const invoices = JSON.parse(localStorage.getItem('voidnix-invoices') || '[]');
    
    const newInvoice = {
        $id: order.sessionId,
        invoiceNumber: order.sessionId.substring(0, 12).toUpperCase(),
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        total: order.total,
        date: order.date,
        items: order.items,
        status: 'Pago',
        sessionId: order.sessionId
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('voidnix-invoices', JSON.stringify(invoices));
    
    console.log('\u2705 Fatura salva:', newInvoice);
    
    // Se Appwrite estiver configurado, salvar tamb\u00e9m l\u00e1
    if (typeof databases !== 'undefined' && databases && appwriteConfig.invoicesCollectionId) {
        try {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.invoicesCollectionId,
                'unique()',
                newInvoice
            );
            console.log('\u2705 Fatura salva no Appwrite');
        } catch (error) {
            console.error('\u274c Erro ao salvar fatura no Appwrite:', error);
        }
    }
}
