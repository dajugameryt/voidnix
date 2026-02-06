// ===== CONFIGURAÇÃO DO APPWRITE =====
// IMPORTANTE: Substitua estas credenciais pelas suas próprias
// Para obter suas credenciais:
// 1. Acesse https://cloud.appwrite.io/
// 2. Vá no seu projeto
// 3. Em Settings > API, copie o Project ID e Endpoint

const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '68d3f276002fe7ca992d',
    databaseId: '69242142000e84dc2029',
    productsCollectionId: 'products',
    invoicesCollectionId: 'invoices', // Coleção de faturas
    storageId: '6924221900051862cf89', // ID do bucket onde estão as imagens
    stripeCheckoutFunctionId: '6924ca1b00066a436744' // ID da função de checkout
};

// Inicializar Appwrite SDK
let appwrite;
let account;
let databases;
let storage;
let functions;

try {
    // Inicializar cliente Appwrite
    appwrite = new Appwrite.Client();
    
    appwrite
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId);
    
    // Inicializar serviços
    account = new Appwrite.Account(appwrite);
    databases = new Appwrite.Databases(appwrite);
    storage = new Appwrite.Storage(appwrite);
    functions = new Appwrite.Functions(appwrite);
    
    console.log('✅ Appwrite inicializado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao inicializar Appwrite:', error);
    console.warn('⚠️ Appwrite não configurado. Usando dados locais.');
}

// Função para obter URL da imagem do Storage
function getImageUrl(fileId, width = 1200, quality = 95) {
    if (!storage || !fileId) return 'imagem/placeholder.jpg';
    
    try {
        return storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            width,   // largura (aumentada para 1200px)
            0,       // altura (0 = manter proporção)
            'center', // gravity
            quality, // qualidade (aumentada para 95)
            0,       // border width
            '000000', // border color
            0,       // border radius
            1,       // opacity
            0,       // rotation
            'FFFFFF', // background
            'jpg'    // output format (jpg geralmente melhor que webp)
        );
    } catch (error) {
        console.error('Erro ao obter URL da imagem:', error);
        return 'imagem/placeholder.jpg';
    }
}
