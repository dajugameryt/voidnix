const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Desabilitar body parsing automático da Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);
  
  try {
    const event = stripe.webhooks.constructEvent(
      buf, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Webhook recebido:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💰 Pagamento confirmado!', session.id);
      
      // Buscar detalhes da sessão
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      // Preparar dados para o email
      const items = fullSession.line_items.data.map(item => ({
        name: item.description || 'Produto',
        quantity: item.quantity,
        price: (item.amount_total / 100) / item.quantity,
      }));

      const total = fullSession.amount_total / 100;
      const customerEmail = session.customer_email || session.customer_details.email;

      // Enviar email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"VoidNix" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: '✅ Pedido Confirmado - VoidNix',
        html: `
          <h1>Obrigado pela tua compra!</h1>
          <p>Olá ${session.customer_details?.name || 'Cliente'},</p>
          <p>O teu pedido foi confirmado com sucesso!</p>
          <h3>Detalhes do Pedido:</h3>
          <ul>
            ${items.map(item => `<li>${item.name} - ${item.quantity}x €${item.price.toFixed(2)}</li>`).join('')}
          </ul>
          <h3>Total: €${total.toFixed(2)}</h3>
          <p>ID do Pedido: ${session.id}</p>
          <p>Obrigado por comprar na VoidNix!</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('📧 Email enviado para:', customerEmail);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};
