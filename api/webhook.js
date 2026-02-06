module.exports = async (req, res) => {
  // Por enquanto, apenas aceitar webhooks sem validação
  console.log('Webhook recebido');
  return res.json({ received: true });
};
