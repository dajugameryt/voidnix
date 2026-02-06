// 📦 EXEMPLOS DE PRODUTOS PARA COPIAR E COLAR NO index.js

// Cole estes produtos dentro do array sampleProducts em js/index.js

const exemplosProdutos = [
    {
        id: 'p1',
        title: 'T-shirt preta exquisite',
        category: 'men',
        price: 17.00,
        sizes: ['S', 'L', 'XL'],
        isNew: true,
        onSale: false,
        image: 'imagem\IMG_20250926_220149.jpg',
        description: 'T-shirt preta de alta qualidade em algodão premium. Design urbano e moderno, perfeita para o estilo street. Conforto garantido para o dia a dia com corte regular e acabamento impecável.',
        material: '100% Algodão Premium',
        care: 'Lavar à máquina a 30°C. Não usar alvejante. Passar a ferro em temperatura baixa.',
        stock: 15
    },
    {
        id: 'p2',
        title: 'Hoodie VoidNix Original',
        category: 'men',
        price: 45.00,
        sizes: ['S', 'M', 'L', 'XL'],
        isNew: true,
        onSale: false,
        image: 'https://via.placeholder.com/400x500/333/fff?text=Hoodie',
        description: 'Moletom com capuz da linha premium VoidNix. Tecido de alta gramatura com interior felpudo para máximo conforto térmico. Bolso canguru e cordões ajustáveis.',
        material: '80% Algodão, 20% Poliéster',
        care: 'Lavar à máquina a 30°C do avesso. Não usar secadora.',
        stock: 8
    },
    {
        id: 'p3',
        title: 'Calças Cargo Street',
        category: 'men',
        price: 55.00,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        isNew: false,
        onSale: true,
        image: 'https://via.placeholder.com/400x500/444/fff?text=Cargo',
        description: 'Calças cargo estilo urbano com múltiplos bolsos funcionais. Tecido resistente e durável, ideal para quem procura estilo e praticidade. Cintura elástica com cordão ajustável.',
        material: '65% Algodão, 35% Poliéster',
        care: 'Lavar à máquina a 40°C. Pode usar secadora.',
        stock: 22
    },
    {
        id: 'p4',
        title: 'Vestido Summer Breeze',
        category: 'women',
        price: 38.00,
        sizes: ['XS', 'S', 'M', 'L'],
        isNew: true,
        onSale: false,
        image: 'https://via.placeholder.com/400x500/E91E63/fff?text=Vestido',
        description: 'Vestido elegante e casual perfeito para os dias quentes. Tecido leve e respirável com caimento fluido. Estampa exclusiva da coleção VoidNix.',
        material: '100% Viscose',
        care: 'Lavar à mão com água fria. Secar à sombra.',
        stock: 12
    },
    {
        id: 'p5',
        title: 'Cropped Top Essential',
        category: 'women',
        price: 22.00,
        sizes: ['XS', 'S', 'M', 'L'],
        isNew: false,
        onSale: true,
        image: 'https://via.placeholder.com/400x500/9C27B0/fff?text=Cropped',
        description: 'Top cropped básico e versátil para compor diversos looks. Modelagem ajustada que valoriza o shape. Disponível em várias cores.',
        material: '95% Algodão, 5% Elastano',
        care: 'Lavar à máquina a 30°C. Não torcer.',
        stock: 30
    },
    {
        id: 'p6',
        title: 'Jaqueta Jeans Oversized',
        category: 'women',
        price: 68.00,
        sizes: ['S', 'M', 'L'],
        isNew: true,
        onSale: false,
        image: 'https://via.placeholder.com/400x500/2196F3/fff?text=Jaqueta',
        description: 'Jaqueta jeans com modelagem oversized super atual. Detalhes destroyed e vintage para um visual autêntico. Peça coringa que combina com tudo.',
        material: '100% Algodão Denim',
        care: 'Lavar à máquina a 30°C. Primeira lavagem em separado.',
        stock: 10
    },
    {
        id: 'p7',
        title: 'Boné VoidNix Signature',
        category: 'accessories',
        price: 25.00,
        sizes: ['Único'],
        isNew: false,
        onSale: false,
        image: 'https://via.placeholder.com/400x400/000/fff?text=Boné',
        description: 'Boné dad hat com logo bordado VoidNix. Aba curva e ajuste traseiro em fecho metálico. Acessório essencial para completar o look street.',
        material: '100% Algodão',
        care: 'Lavar à mão. Não torcer.',
        stock: 50
    },
    {
        id: 'p8',
        title: 'Mochila Urban Explorer',
        category: 'accessories',
        price: 85.00,
        sizes: ['Único'],
        isNew: true,
        onSale: false,
        image: 'https://via.placeholder.com/400x500/607D8B/fff?text=Mochila',
        description: 'Mochila urbana com design funcional e moderno. Múltiplos compartimentos incluindo bolso para laptop até 15". Material resistente à água.',
        material: 'Poliéster 600D impermeável',
        care: 'Limpar com pano úmido. Não lavar em máquina.',
        stock: 18
    },
    {
        id: 'p9',
        title: 'Cinto de Lona Tático',
        category: 'accessories',
        price: 18.00,
        sizes: ['Único'],
        isNew: false,
        onSale: true,
        image: 'https://via.placeholder.com/400x200/795548/fff?text=Cinto',
        description: 'Cinto estilo militar em lona resistente. Fivela de engate rápido em metal. Comprimento ajustável, perfeito para estilo urbano.',
        material: 'Lona 100% Nylon',
        care: 'Lavar à mão quando necessário.',
        stock: 35
    },
    {
        id: 'p10',
        title: 'Oversized Tee Limited',
        category: 'men',
        price: 32.00,
        sizes: ['M', 'L', 'XL'],
        isNew: true,
        onSale: false,
        image: 'https://via.placeholder.com/400x500/FFC107/000?text=Oversized',
        description: 'Camiseta oversized edição limitada com estampa exclusiva. Modelagem ampla super confortável. Parte da coleção especial de inverno 2025.',
        material: '100% Algodão Penteado',
        care: 'Lavar do avesso a 30°C. Não usar alvejante.',
        stock: 6
    }
];

// COMO USAR:
// 1. Copie os produtos acima
// 2. Abra o arquivo js/index.js
// 3. Substitua ou adicione ao array sampleProducts
// 4. Salve e recarregue a página
