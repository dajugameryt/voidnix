// ===== CONFIGURAÇÃO DO STRIPE =====
// IMPORTANTE: A chave secreta (sk_test_...) NUNCA deve ser exposta no frontend!
// Ela deve ficar apenas no backend/servidor

const stripeConfig = {
    // Chave publicável (pode ser usada no frontend)
    publishableKey: 'pk_test_51SX6mV05h7t6bsLGcr4lFcK4srkD3nlCbAZzDQ4N2O3pCwUfXgSXT3O6F2TIJ8XKoszQxbV1Qq3WrqZHlPOhI08A00xbA5xS7q',
    
    // Configurações
    currency: 'eur', // Moeda (Euro)
    country: 'PT'    // País (Portugal)
};

// Inicializar Stripe
let stripe;

try {
    stripe = Stripe(stripeConfig.publishableKey);
    console.log('✅ Stripe inicializado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao inicializar Stripe:', error);
}
