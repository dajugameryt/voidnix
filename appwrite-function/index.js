import Stripe from 'stripe';

export default async ({ req, res, log, error }) => {
  // Verificar se a chave secreta existe
  if (!process.env.STRIPE_SECRET_KEY) {
    error('STRIPE_SECRET_KEY não configurada!');
    return res.json({ error: 'Configuração inválida' }, 500);
  }

  // Inicializar Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Fazer parse do body
    const body = JSON.parse(req.bodyRaw || '{}');
    const { lineItems, customerEmail } = body;

    log('📦 Criando sessão de checkout...');
    log(`Items: ${lineItems.length}`);
    log(`Email: ${customerEmail}`);

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: 'http://localhost:8000/index.html?payment=success',
      cancel_url: 'http://localhost:8000/index.html?payment=cancel',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES', 'FR', 'DE', 'IT', 'GB', 'US'],
      },
    });

    log('✅ Sessão criada com sucesso!');
    log(`Session ID: ${session.id}`);

    return res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (err) {
    error('❌ Erro ao criar sessão:', err.message);
    return res.json({ 
      error: err.message 
    }, 500);
  }
};
