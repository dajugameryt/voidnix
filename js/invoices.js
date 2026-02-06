// ===== FUN\u00c7\u00d5ES DE FATURAS =====

// Buscar faturas do usu\u00e1rio (do Appwrite ou localStorage)
async function fetchInvoices() {
    if (!state.user) return [];
    
    // Tentar buscar do Appwrite
    if (databases && appwriteConfig.invoicesCollectionId) {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.invoicesCollectionId,
                [
                    Query.equal('customerEmail', state.user.email),
                    Query.orderDesc('$createdAt')
                ]
            );
            
            return response.documents;
        } catch (error) {
            console.error('\u274c Erro ao buscar faturas do Appwrite:', error);
        }
    }
    
    // Fallback: buscar do localStorage
    const orders = JSON.parse(localStorage.getItem('voidnix-orders') || '[]');
    return orders.map((order, index) => ({
        $id: order.sessionId || `local-${index}`,
        invoiceNumber: order.sessionId ? order.sessionId.substring(0, 12).toUpperCase() : `INV-${index + 1}`,
        customerEmail: state.user.email,
        customerName: state.user.name,
        total: order.total,
        date: order.date,
        items: order.items,
        status: order.status || 'Pago'
    }));
}

// Mostrar modal de faturas
async function showInvoices() {
    const modal = document.getElementById('invoicesModal');
    const content = document.getElementById('invoicesContent');
    
    if (!modal || !content) {
        console.error('Modal de faturas n\u00e3o encontrado no HTML');
        alert('\u274c Erro: Modal de faturas n\u00e3o est\u00e1 dispon\u00edvel. Verifique o HTML.');
        return;
    }
    
    // Mostrar loading
    content.innerHTML = '<div style="text-align: center; padding: 40px;">\ud83d\udd04 Carregando faturas...</div>';
    
    modal.classList.add('show');
    document.getElementById('loginOverlay').classList.add('show');
    closeLoginModal();
    
    const invoices = await fetchInvoices();
    
    if (invoices.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">\ud83e\uddfe</div>
                <h3>Nenhuma fatura dispon\u00edvel</h3>
                <p>As suas faturas aparecer\u00e3o aqui ap\u00f3s realizar compras.</p>
                <button class="btn btn-primary" onclick="document.getElementById('invoicesModal').classList.remove('show'); document.getElementById('loginOverlay').classList.remove('show')">
                    Continuar Comprando
                </button>
            </div>
        `;
    } else {
        let invoicesHTML = '<div class="invoices-list">';
        
        invoices.forEach((invoice, index) => {
            const date = new Date(invoice.date || invoice.$createdAt).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            
            const invoiceNumber = invoice.invoiceNumber || invoice.$id.substring(0, 12).toUpperCase();
            const total = parseFloat(invoice.total || 0).toFixed(2);
            const status = invoice.status || 'Pago';
            
            invoicesHTML += `
                <div class="invoice-card" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div>
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">\ud83e\uddfe Fatura #${invoiceNumber}</div>
                            <div style="color: #666; font-size: 14px;">${date}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block;">
                                ${status}
                            </div>
                            <div style="font-size: 20px; font-weight: bold; margin-top: 8px;">\u20ac${total}</div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 15px;">
                        <div style="color: #666; font-size: 13px; margin-bottom: 10px;"><strong>Itens:</strong></div>
                        ${generateInvoiceItems(invoice.items)}
                    </div>
                    
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn btn-primary" style="flex: 1; padding: 8px;" onclick="viewInvoiceDetails('${invoice.$id}')">
                            \ud83d\udc41\ufe0f Ver Detalhes
                        </button>
                        <button class="btn btn-secondary" style="flex: 1; padding: 8px;" onclick="downloadInvoice('${invoice.$id}')">
                            \u2b07\ufe0f Baixar PDF
                        </button>
                    </div>
                </div>
            `;
        });
        
        invoicesHTML += '</div>';
        content.innerHTML = invoicesHTML;
    }
}

// Gerar HTML dos itens da fatura
function generateInvoiceItems(items) {
    if (!items || items.length === 0) {
        return '<div style="color: #999; font-size: 13px;">Nenhum item</div>';
    }
    
    let html = '';
    items.forEach(item => {
        const name = item.name || item.price_data?.product_data?.name || 'Produto';
        const desc = item.description || item.price_data?.product_data?.description || '';
        const qty = item.quantity || 1;
        const price = item.price || (item.price_data?.unit_amount / 100) || 0;
        
        html += `
            <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px;">
                <span>${qty}x ${name} ${desc ? `<span style="color: #666;">(${desc})</span>` : ''}</span>
                <span style="font-weight: 500;">\u20ac${price.toFixed(2)}</span>
            </div>
        `;
    });
    
    return html;
}

// Ver detalhes completos da fatura
async function viewInvoiceDetails(invoiceId) {
    const invoices = await fetchInvoices();
    const invoice = invoices.find(inv => inv.$id === invoiceId);
    
    if (!invoice) {
        alert('\u274c Fatura n\u00e3o encontrada');
        return;
    }
    
    const date = new Date(invoice.date || invoice.$createdAt).toLocaleDateString('pt-PT');
    const invoiceNumber = invoice.invoiceNumber || invoice.$id.substring(0, 12).toUpperCase();
    
    const modal = document.getElementById('invoicesModal');
    const content = document.getElementById('invoicesContent');
    
    content.innerHTML = `
        <div class="invoice-detail">
            <button class="btn btn-secondary" onclick="showInvoices()" style="margin-bottom: 20px;">
                \u2190 Voltar
            </button>
            
            <div style="background: white; border: 2px solid #000; padding: 30px; margin-bottom: 20px;">
                <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <div style="font-size: 32px; font-weight: bold;">FATURA</div>
                            <div style="margin-top: 10px;">
                                <strong>VoidNix Store</strong><br>
                                Street Style Fashion
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div><strong>N\u00ba:</strong> ${invoiceNumber}</div>
                            <div><strong>Data:</strong> ${date}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-left: 4px solid #000;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Faturado a:</div>
                    <div>${invoice.customerName || 'Cliente'}</div>
                    <div>${invoice.customerEmail}</div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f0f0f0; border-bottom: 2px solid #000;">
                            <th style="padding: 12px; text-align: left;">Produto</th>
                            <th style="padding: 12px; text-align: center; width: 80px;">Qtd</th>
                            <th style="padding: 12px; text-align: right; width: 100px;">Pre\u00e7o</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateInvoiceTableRows(invoice.items)}
                    </tbody>
                    <tfoot>
                        <tr style="background: #000; color: #fff; font-weight: bold;">
                            <td colspan="2" style="padding: 15px; text-align: right; font-size: 18px;">TOTAL</td>
                            <td style="padding: 15px; text-align: right; font-size: 18px;">\u20ac${parseFloat(invoice.total).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; font-size: 13px;">
                    <strong>\ud83d\udcb3 Pagamento:</strong> Processado com sucesso<br>
                    <strong>\ud83d\udce6 Status:</strong> ${invoice.status || 'Pago'}<br>
                    ${invoice.sessionId ? `<strong>\ud83d\udd11 ID da Sess\u00e3o:</strong> ${invoice.sessionId}` : ''}
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="downloadInvoice('${invoiceId}')" style="width: 100%; padding: 12px;">
                \u2b07\ufe0f Baixar Fatura (PDF)
            </button>
        </div>
    `;
}

// Gerar linhas da tabela de itens
function generateInvoiceTableRows(items) {
    if (!items || items.length === 0) {
        return '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #999;">Nenhum item</td></tr>';
    }
    
    return items.map(item => {
        const name = item.name || item.price_data?.product_data?.name || 'Produto';
        const desc = item.description || item.price_data?.product_data?.description || '';
        const qty = item.quantity || 1;
        const price = item.price || (item.price_data?.unit_amount / 100) || 0;
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                    <strong>${name}</strong><br>
                    <small style="color: #666;">${desc}</small>
                </td>
                <td style="padding: 10px; text-align: center;">${qty}</td>
                <td style="padding: 10px; text-align: right;">\u20ac${price.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

// Download da fatura (simula\u00e7\u00e3o - em produ\u00e7\u00e3o usar biblioteca de PDF)
async function downloadInvoice(invoiceId) {
    alert('\ud83d\udea7 DOWNLOAD DE FATURA\\n\\nFuncionalidade em desenvolvimento!\\n\\nEm produ\u00e7\u00e3o, esta fun\u00e7\u00e3o ir\u00e1 gerar um PDF da fatura e fazer o download automaticamente.\\n\\nPor enquanto, voc\u00ea pode usar a op\u00e7\u00e3o \"Imprimir\" do navegador (Ctrl+P) para salvar como PDF.');
    
    // Em produ\u00e7\u00e3o, usar biblioteca como jsPDF ou pdfmake
    // Exemplo: window.print() para imprimir a fatura
}
