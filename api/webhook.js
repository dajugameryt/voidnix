const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { enviarEmailConfirmacao } = require('../backend/emailService');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💰 Pagamento confirmado!', session.id);
      
      // Buscar detalhes da sessão
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      // Preparar dados para o email
      const items = fullSession.line_items.data.map(item => ({
        name: item.description || item.price.product.name,
        description: item.description || '',
        quantity: item.quantity,
        price: (item.amount_total / 100) / item.quantity,
      }));

      const total = fullSession.amount_total / 100;

      // Enviar email de confirmação
      await enviarEmailConfirmacao({
        customerEmail: session.customer_email || session.customer_details.email,
        customerName: session.customer_details?.name,
        sessionId: session.id,
        items: items,
        total: total,
      });

      console.log('📧 Email de confirmação enviado!');
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
