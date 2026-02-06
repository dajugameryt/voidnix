const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lineItems, customerEmail } = req.body;

    if (!lineItems || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('📦 Criando sessão de checkout...');
    console.log('Items:', lineItems?.length);
    console.log('Email:', customerEmail);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `https://voidnix.vercel.app/index.html?payment=success`,
      cancel_url: `https://voidnix.vercel.app/index.html?payment=cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES', 'FR', 'DE', 'IT', 'GB', 'US'],
      },
    });

    console.log('✅ Sessão criada:', session.id);

    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
