const nodemailer = require('nodemailer');

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verificar configuração
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Erro na configuração de email:', error.message);
  } else {
    console.log('✅ Email configurado e pronto para enviar!');
  }
});

// Enviar email de confirmação com fatura
async function enviarEmailConfirmacao(dados) {
  const { customerEmail, customerName, sessionId, items, total } = dados;

  const htmlItems = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small>${item.description}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        €${item.price.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const invoiceNumber = sessionId.substring(0, 12).toUpperCase();
  const invoiceDate = new Date().toLocaleDateString('pt-PT');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: '✅ Fatura VoidNix - Pedido Confirmado',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; background: #f9f9f9; }
          .invoice-box { background: white; padding: 20px; border: 2px solid #000; margin: 20px 0; }
          .invoice-header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .invoice-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .invoice-info { display: flex; justify-content: space-between; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f0f0f0; padding: 12px; text-align: left; border-bottom: 2px solid #000; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { background: #000; color: #fff; font-weight: bold; }
          .address-section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #000; }
          .address-label { font-weight: bold; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Pedido Confirmado!</h1>
            <p style="margin: 10px 0 0 0;">VoidNix - Street Style</p>
          </div>
          
          <div class="content">
            <p>Olá${customerName ? ' ' + customerName : ''},</p>
            
            <p>Obrigado pela sua compra na <strong>VoidNix Store</strong>! 🛍️</p>
            
            <p>Recebemos o seu pagamento e o seu pedido está a ser processado.</p>
            
            <div class="invoice-box">
              <div class="invoice-header">
                <div class="invoice-title">FATURA</div>
                <div class="invoice-info">
                  <div>
                    <div><strong>VoidNix Store</strong></div>
                    <div>Street Style Fashion</div>
                  </div>
                  <div style="text-align: right;">
                    <div><strong>Nº:</strong> ${invoiceNumber}</div>
                    <div><strong>Data:</strong> ${invoiceDate}</div>
                  </div>
                </div>
              </div>
              
              <div class="address-section">
                <div class="address-label">Faturado a:</div>
                <div>${customerName || 'Cliente'}</div>
                <div>${customerEmail}</div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th style="text-align: center; width: 80px;">Qtd</th>
                    <th style="text-align: right; width: 100px;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${htmlItems}
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="2" style="text-align: right; padding: 15px; font-size: 18px;">TOTAL</td>
                    <td style="text-align: right; padding: 15px; font-size: 18px;">€${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
                <strong>💳 Pagamento:</strong> Processado com sucesso<br>
                <strong>📦 Status:</strong> Em preparação<br>
                <strong>🔑 ID da Sessão:</strong> ${sessionId}
              </div>
            </div>
            
            <p>📦 O seu pedido será enviado em breve. Enviaremos um email com o código de rastreamento assim que for despachado.</p>
            
            <p>Esta fatura também está disponível na sua <strong>área de Perfil > Faturas</strong> no nosso website.</p>
            
            <p>Se tiver alguma dúvida, não hesite em contactar-nos.</p>
            
            <p>Obrigado por comprar connosco! ✨</p>
          </div>
          
          <div class="footer">
            <p><strong>VoidNix - Street Style</strong></p>
            <p>Este é um email automático, por favor não responda.</p>
            <p style="font-size: 10px; margin-top: 10px;">Fatura ${invoiceNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de fatura enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { enviarEmailConfirmacao };
