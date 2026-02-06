require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { enviarEmailConfirmacao } = require('./emailService');
const path = require('path');

const app = express();

// Servir arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname, '..')));

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: '✅ Backend VoidNix rodando!', stripe: 'OK' });
});

// Rota para criar sessão de checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { lineItems, customerEmail } = req.body;

    console.log('📦 Criando sessão de checkout...');
    console.log('Items:', lineItems.length);
    console.log('Email:', customerEmail);

    // Criar sessão de checkout no Stripe
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

    console.log('✅ Sessão criada:', session.id);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Webhook do Stripe (para receber confirmação de pagamento)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'
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
      
      // Salvar fatura no Appwrite (se configurado)
      try {
        const invoiceData = {
          sessionId: session.id,
          customerEmail: session.customer_email || session.customer_details.email,
          customerName: session.customer_details?.name || 'Cliente',
          items: items,
          total: total,
          date: new Date().toISOString(),
          status: 'Pago',
          billingAddress: session.customer_details?.address || {}
        };
        
        // Aqui você pode salvar no Appwrite usando o SDK do Node.js
        console.log('📄 Fatura criada:', invoiceData);
        
      } catch (error) {
        console.error('Erro ao salvar fatura:', error);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Rota de teste para enviar email (temporária)
app.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    const resultado = await enviarEmailConfirmacao({
      customerEmail: email || 'danielcac19@gmail.com',
      customerName: 'Cliente Teste',
      sessionId: 'test_' + Date.now(),
      items: [
        {
          name: 'T-shirt Exquisite',
          description: 'Tamanho: S',
          quantity: 1,
          price: 17.00
        }
      ],
      total: 17.00
    });
    
    res.json({ success: true, ...resultado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log('✅ Backend VoidNix rodando!');
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log('💳 Stripe: Configurado');
  console.log('🚀 ====================================');
  console.log('');
});
