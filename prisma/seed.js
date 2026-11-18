import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/pt_grupo10?schema=public';

const pool = new Pool({ connectionString });

async function main() {
  console.log('🌱 Iniciando povoamento do banco de dados...\n');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🧹 Limpando dados anteriores com TRUNCATE CASCADE...');
    await client.query(`
      TRUNCATE TABLE 
        "comentarios_avaliacao",
        "avaliacoes_produto",
        "avaliacoes_loja",
        "imagens_produto",
        "produtos",
        "lojas",
        "tokens_recuperacao_senha",
        "categorias",
        "usuarios"
      RESTART IDENTITY CASCADE;
    `);

    // ==========================================
    // 1. USUÁRIOS
    // ==========================================
    console.log('👤 Criando usuários...');
    const defaultPassword = await bcrypt.hash('Senha123!', 10);

    const usuariosData = [
      {
        username: 'admin',
        nome: 'Administrador Stockles',
        email: 'admin@stockles.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      {
        username: 'roberto_mercado',
        nome: 'Roberto Silva',
        email: 'roberto@bompreco.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      },
      {
        username: 'carlos_farmacia',
        nome: 'Carlos Eduardo',
        email: 'carlos@farmaciavivabem.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
      {
        username: 'mariana_beleza',
        nome: 'Mariana Rocha',
        email: 'mariana@glowbeleza.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      },
      {
        username: 'ana_moda',
        nome: 'Ana Paula Oliveira',
        email: 'ana@urbanstyle.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      },
      {
        username: 'lucas_tech',
        nome: 'Lucas Mendes',
        email: 'lucas@techzone.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
      },
      {
        username: 'felipe_games',
        nome: 'Felipe Costa',
        email: 'felipe@pixelplay.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
      },
      {
        username: 'camila_brinquedos',
        nome: 'Camila Santos',
        email: 'camila@mundomagico.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      },
      {
        username: 'juliana_casa',
        nome: 'Juliana Duarte',
        email: 'juliana@larconforto.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      },
      // Compradores e avaliadores
      {
        username: 'ricardo_cliente',
        nome: 'Ricardo Lima',
        email: 'ricardo.cliente@gmail.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      },
      {
        username: 'beatriz_cliente',
        nome: 'Beatriz Souza',
        email: 'beatriz.cliente@gmail.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
      },
      {
        username: 'gabriel_cliente',
        nome: 'Gabriel Martins',
        email: 'gabriel.cliente@gmail.com',
        foto_perfil_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
      },
    ];

    const usuariosMap = {};
    for (const u of usuariosData) {
      const res = await client.query(
        `INSERT INTO "usuarios" ("username", "nome", "email", "senha_hash", "senha_versao", "foto_perfil_url", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 0, $5, NOW(), NOW())
         RETURNING "id"`,
        [u.username, u.nome, u.email, defaultPassword, u.foto_perfil_url]
      );
      usuariosMap[u.username] = res.rows[0].id;
    }
    console.log(`✅ ${Object.keys(usuariosMap).length} usuários inseridos.`);

    // ==========================================
    // 2. CATEGORIAS E SUBCATEGORIAS
    // ==========================================
    console.log('🏷️  Criando categorias e subcategorias...');

    // Exatamente as 8 categorias do front com ícones
    const categoriasEstrutura = [
      {
        nome: 'Mercado',
        subcategorias: ['Bebidas', 'Mercearia', 'Laticínios', 'Limpeza'],
      },
      {
        nome: 'Farmácia',
        subcategorias: ['Medicamentos', 'Vitaminas', 'Higiene', 'Bebê'],
      },
      {
        nome: 'Beleza',
        subcategorias: ['Maquilhagem', 'Skincare', 'Cabelo', 'Perfumes'],
      },
      {
        nome: 'Moda',
        subcategorias: ['Roupas', 'Calçado', 'Acessórios', 'Infantil'],
      },
      {
        nome: 'Eletrônicos',
        subcategorias: ['Smartphones', 'Computadores', 'TVs', 'Acessórios'],
      },
      {
        nome: 'Jogos',
        subcategorias: ['PlayStation', 'Xbox', 'Nintendo', 'PC'],
      },
      {
        nome: 'Brinquedos',
        subcategorias: ['Jogos de Tabuleiro', 'Bonecos e Figuras', 'Educativos', 'Pelúcias'],
      },
      {
        nome: 'Casa',
        subcategorias: ['Móveis', 'Decoração', 'Cozinha', 'Cama, Mesa e Banho'],
      },
    ];

    const categoriasMap = {}; // Guarda IDs de pais e filhas
    for (const cat of categoriasEstrutura) {
      const resPai = await client.query(
        `INSERT INTO "categorias" ("nome", "categoria_pai_id") VALUES ($1, NULL) RETURNING "id"`,
        [cat.nome]
      );
      const paiId = resPai.rows[0].id;
      categoriasMap[cat.nome] = paiId;

      for (const subNome of cat.subcategorias) {
        const resSub = await client.query(
          `INSERT INTO "categorias" ("nome", "categoria_pai_id") VALUES ($1, $2) RETURNING "id"`,
          [subNome, paiId]
        );
        // Chave composta para subcategorias: "Mercado > Bebidas" e também subNome
        categoriasMap[`${cat.nome} > ${subNome}`] = resSub.rows[0].id;
      }
    }
    console.log('✅ 8 categorias raiz e 32 subcategorias inseridas.');

    // ==========================================
    // 3. LOJAS
    // ==========================================
    console.log('🏪 Criando lojas...');
    const lojasData = [
      {
        usuario_id: usuariosMap['roberto_mercado'],
        categoria_id: categoriasMap['Mercado'],
        nome: 'SuperMercado Bom Preço',
        descricao: 'Alimentos frescos, bebidas e produtos de mercearia com entrega rápida e os melhores preços.',
        logo_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300',
        banner_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
        sticker_url: '/images/CarrosselCategorias/mercado.svg',
      },
      {
        usuario_id: usuariosMap['carlos_farmacia'],
        categoria_id: categoriasMap['Farmácia'],
        nome: 'Farmácia Viva Bem',
        descricao: 'Sua saúde e cuidado diário em primeiro lugar. Medicamentos, vitaminas e produtos para bebê.',
        logo_url: 'https://images.unsplash.com/photo-1586015555751-63c29994c6d3?w=300',
        banner_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200',
        sticker_url: '/images/CarrosselCategorias/remedio.svg',
      },
      {
        usuario_id: usuariosMap['mariana_beleza'],
        categoria_id: categoriasMap['Beleza'],
        nome: 'Glow Beleza & Cosméticos',
        descricao: 'O universo da beleza em um só lugar. Linhas completas de skincare, perfumes e maquiagens.',
        logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
        banner_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200',
        sticker_url: '/images/CarrosselCategorias/batom.svg',
      },
      {
        usuario_id: usuariosMap['ana_moda'],
        categoria_id: categoriasMap['Moda'],
        nome: 'Urban Style Modas',
        descricao: 'Tendências contemporâneas, calçados e vestuário com o melhor caimento e estilo autêntico.',
        logo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
        banner_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
        sticker_url: '/images/CarrosselCategorias/moda.svg',
      },
      {
        usuario_id: usuariosMap['lucas_tech'],
        categoria_id: categoriasMap['Eletrônicos'],
        nome: 'TechZone Eletrônicos',
        descricao: 'Tecnologia de ponta: smartphones, notebooks, televisores e acessórios com garantia total.',
        logo_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300',
        banner_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
        sticker_url: '/images/CarrosselCategorias/laptop.svg',
      },
      {
        usuario_id: usuariosMap['felipe_games'],
        categoria_id: categoriasMap['Jogos'],
        nome: 'Pixel Play Games',
        descricao: 'O paraíso gamer! Consoles PlayStation, Xbox, Nintendo Switch, periféricos para PC e lançamentos.',
        logo_url: 'https://images.unsplash.com/photo-1612287232230-67d7102e1c31?w=300',
        banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200',
        sticker_url: '/images/CarrosselCategorias/videogame.svg',
      },
      {
        usuario_id: usuariosMap['camila_brinquedos'],
        categoria_id: categoriasMap['Brinquedos'],
        nome: 'Mundo Mágico Brinquedos',
        descricao: 'Diversão para todas as idades! Jogos de tabuleiro, figuras colecionáveis, pelúcias e educativos.',
        logo_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300',
        banner_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200',
        sticker_url: '/images/CarrosselCategorias/BONECA.png',
      },
      {
        usuario_id: usuariosMap['juliana_casa'],
        categoria_id: categoriasMap['Casa'],
        nome: 'Lar & Conforto',
        descricao: 'Transforme seu lar com móveis elegantes, utilidades de cozinha, decoração e roupas de cama.',
        logo_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300',
        banner_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200',
        sticker_url: '/images/CarrosselCategorias/CASA.png',
      },
    ];

    const lojasMap = {};
    for (const l of lojasData) {
      const res = await client.query(
        `INSERT INTO "lojas" ("usuario_id", "categoria_id", "nome", "descricao", "logo_url", "banner_url", "sticker_url", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING "id"`,
        [l.usuario_id, l.categoria_id, l.nome, l.descricao, l.logo_url, l.banner_url, l.sticker_url]
      );
      lojasMap[l.nome] = res.rows[0].id;
    }
    console.log(`✅ ${Object.keys(lojasMap).length} lojas inseridas.`);

    // ==========================================
    // 4. PRODUTOS & IMAGENS
    // ==========================================
    console.log('📦 Criando produtos e imagens...');

    const produtosData = [
      // ---------- MERCADO ----------
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Mercearia',
        nome: 'Café Especial Gourmet Torrado 500g',
        descricao: 'Grãos 100% arábica com notas aromáticas de caramelo e chocolate. Torra média balanceada.',
        preco: 28.90,
        estoque: 45,
        imagens: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'],
      },
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Mercearia',
        nome: 'Azeite de Oliva Extra Virgem 500ml',
        descricao: 'Prensagem a frio com acidez máxima de 0,2%. Importado de Portugal.',
        preco: 42.50,
        estoque: 30,
        imagens: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'],
      },
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Bebidas',
        nome: 'Vinho Tinto Cabernet Sauvignon 750ml',
        descricao: 'Vinho encorpado com taninos aveludados e notas de frutas vermelhas maduras.',
        preco: 59.90,
        estoque: 20,
        imagens: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600'],
      },
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Bebidas',
        nome: 'Cerveja Artesanal IPA Puro Malte 500ml',
        descricao: 'Cerveja artesanal com amargor marcante e aroma cítrico de lúpulos nobres.',
        preco: 16.90,
        estoque: 80,
        imagens: ['https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600'],
      },
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Laticínios',
        nome: 'Queijo Parmesão Curado Artesanal 300g',
        descricao: 'Maturado por 12 meses, textura granulada e sabor intenso inconfundível.',
        preco: 34.90,
        estoque: 25,
        imagens: ['https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600'],
      },
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Limpeza',
        nome: 'Sabão Líquido Concentrado Lavanderia 3L',
        descricao: 'Rende até 60 lavagens. Fórmula com alto poder de remoção de manchas e aroma duradouro.',
        preco: 44.90,
        estoque: 50,
        imagens: ['https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600'],
      },
      {
        loja: 'SuperMercado Bom Preço',
        categoria: 'Mercado > Limpeza',
        nome: 'Desinfetante Floral Multiuso 2L',
        descricao: 'Elimina 99,9% dos germes e bactérias deixando uma agradável fragrância floral.',
        preco: 11.90,
        estoque: 0, // Indisponível para teste no front
        imagens: ['https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600'],
      },

      // ---------- FARMÁCIA ----------
      {
        loja: 'Farmácia Viva Bem',
        categoria: 'Farmácia > Vitaminas',
        nome: 'Multivitamínico Completo A-Z 60 Cápsulas',
        descricao: 'Suplemento vitamínico e mineral para fortalecer a imunidade e disposição diária.',
        preco: 49.90,
        estoque: 40,
        imagens: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'],
      },
      {
        loja: 'Farmácia Viva Bem',
        categoria: 'Farmácia > Vitaminas',
        nome: 'Vitamina C 1000mg + Zinco Efervescente',
        descricao: 'Antioxidante potente que auxilia no bom funcionamento do sistema imunológico.',
        preco: 19.90,
        estoque: 70,
        imagens: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=600'],
      },
      {
        loja: 'Farmácia Viva Bem',
        categoria: 'Farmácia > Higiene',
        nome: 'Protetor Solar Facial Toque Seco FPS 50 50g',
        descricao: 'Controle de oleosidade por 12 horas, textura leve e acabamento matte invisível.',
        preco: 64.90,
        estoque: 35,
        imagens: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
      },
      {
        loja: 'Farmácia Viva Bem',
        categoria: 'Farmácia > Higiene',
        nome: 'Enxaguante Bucal Antisséptico Menta 500ml',
        descricao: 'Proteção contra placa bacteriana e mau hálito sem ardor.',
        preco: 22.90,
        estoque: 50,
        imagens: ['https://images.unsplash.com/photo-1559671089-8d6a8ebdc737?w=600'],
      },
      {
        loja: 'Farmácia Viva Bem',
        categoria: 'Farmácia > Bebê',
        nome: 'Kit Fraldas Descartáveis Confort Premium Tam M 48 Un',
        descricao: 'Camadas absorventes respiráveis e canais de ar que mantêm o bebê sequinho a noite toda.',
        preco: 79.90,
        estoque: 25,
        imagens: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600'],
      },
      {
        loja: 'Farmácia Viva Bem',
        categoria: 'Farmácia > Medicamentos',
        nome: 'Curativos Adesivos Flexíveis e Transparentes 40 Un',
        descricao: 'Barreira protetora contra sujeira e germes com alta fixação.',
        preco: 12.50,
        estoque: 90,
        imagens: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600'],
      },

      // ---------- BELEZA ----------
      {
        loja: 'Glow Beleza & Cosméticos',
        categoria: 'Beleza > Maquilhagem',
        nome: 'Batom Líquido Velvet Matte Longa Duração',
        descricao: 'Alta pigmentação, secagem rápida e cobertura uniforme sem ressecar os lábios.',
        preco: 39.90,
        estoque: 40,
        imagens: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600'],
      },
      {
        loja: 'Glow Beleza & Cosméticos',
        categoria: 'Beleza > Maquilhagem',
        nome: 'Paleta de Sombras Nude Essence 12 Cores',
        descricao: 'Tons neutros e cintilantes com textura ultrafina e alta fixação.',
        preco: 89.90,
        estoque: 20,
        imagens: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600'],
      },
      {
        loja: 'Glow Beleza & Cosméticos',
        categoria: 'Beleza > Skincare',
        nome: 'Sérum Facial Ácido Hialurônico Puro 30ml',
        descricao: 'Hidratação profunda, preenchimento de linhas finas e luminosidade radiante.',
        preco: 79.90,
        estoque: 35,
        imagens: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'],
      },
      {
        loja: 'Glow Beleza & Cosméticos',
        categoria: 'Beleza > Cabelo',
        nome: 'Óleo Reparador Capilar de Argan 100ml',
        descricao: 'Finalizador térmico que sela cutículas, reduz o frizz e dá brilho espelhado aos fios.',
        preco: 52.90,
        estoque: 30,
        imagens: ['https://images.unsplash.com/photo-1608248597359-577c2e391b42?w=600'],
      },
      {
        loja: 'Glow Beleza & Cosméticos',
        categoria: 'Beleza > Perfumes',
        nome: 'Perfume Feminino Floral Eau de Parfum 100ml',
        descricao: 'Fragrância marcante e sofisticada com buquê de jasmim, rosas e baunilha de Madagascar.',
        preco: 229.90,
        estoque: 15,
        imagens: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600'],
      },

      // ---------- MODA ----------
      {
        loja: 'Urban Style Modas',
        categoria: 'Moda > Roupas',
        nome: 'Camiseta Básica Algodão Egípcio Preta',
        descricao: 'Toque macio incomparável, gola redonda reforçada e modelagem regular atemporal.',
        preco: 69.90,
        estoque: 60,
        imagens: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'],
      },
      {
        loja: 'Urban Style Modas',
        categoria: 'Moda > Roupas',
        nome: 'Jaqueta Jeans Oversized Unissex',
        descricao: 'Denim 100% algodão com lavagem vintage e bolsos funcionais.',
        preco: 189.90,
        estoque: 18,
        imagens: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'],
      },
      {
        loja: 'Urban Style Modas',
        categoria: 'Moda > Calçado',
        nome: 'Tênis Casual Streetwear Branco',
        descricao: 'Design minimalista, solado em borracha antiderrapante e palmilha ultra confortável.',
        preco: 249.90,
        estoque: 25,
        imagens: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
      },
      {
        loja: 'Urban Style Modas',
        categoria: 'Moda > Acessórios',
        nome: 'Relógio Minimalista Masculino em Aço',
        descricao: 'Mecanismo analógico de precisão quartzo, mostrador limpo e pulseira em malha milanesa.',
        preco: 199.90,
        estoque: 15,
        imagens: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      },
      {
        loja: 'Urban Style Modas',
        categoria: 'Moda > Infantil',
        nome: 'Conjunto Moletom Infantil Confort',
        descricao: 'Casaco com capuz e calça em tecido felpado macio para manter as crianças aquecidas.',
        preco: 89.90,
        estoque: 30,
        imagens: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600'],
      },

      // ---------- ELETRÔNICOS ----------
      {
        loja: 'TechZone Eletrônicos',
        categoria: 'Eletrônicos > Smartphones',
        nome: 'Smartphone Galaxy 5G 128GB Preto',
        descricao: 'Tela AMOLED 6.6" 120Hz, câmera quádrupla 64MP e bateria de longa duração 5000mAh.',
        preco: 1899.00,
        estoque: 14,
        imagens: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
      },
      {
        loja: 'TechZone Eletrônicos',
        categoria: 'Eletrônicos > Smartphones',
        nome: 'iPhone 15 Pro 256GB Titânio',
        descricao: 'Chip A17 Pro, design em titânio aeroespacial e sistema avançado de câmeras 48MP.',
        preco: 6999.00,
        estoque: 8,
        imagens: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'],
      },
      {
        loja: 'TechZone Eletrônicos',
        categoria: 'Eletrônicos > Computadores',
        nome: 'Notebook Ultrafino 15.6" Core i7 16GB SSD 512GB',
        descricao: 'Alta performance para produtividade, corpo em alumínio e tela Full HD antirreflexo.',
        preco: 3799.00,
        estoque: 10,
        imagens: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'],
      },
      {
        loja: 'TechZone Eletrônicos',
        categoria: 'Eletrônicos > TVs',
        nome: 'Smart TV 55" 4K UHD HDR Wi-Fi Bluetooth',
        descricao: 'Resolução 4K cristalina, som imersivo Dolby Audio e acesso rápido a todos os apps de streaming.',
        preco: 2499.00,
        estoque: 7,
        imagens: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'],
      },
      {
        loja: 'TechZone Eletrônicos',
        categoria: 'Eletrônicos > Acessórios',
        nome: 'Fone de Ouvido Bluetooth com Cancelamento de Ruído',
        descricao: 'Driver de 40mm, bateria de até 35 horas e cancelamento de ruído ativo inteligente.',
        preco: 299.90,
        estoque: 40,
        imagens: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
      },

      // ---------- JOGOS ----------
      {
        loja: 'Pixel Play Games',
        categoria: 'Jogos > PlayStation',
        nome: 'Console PlayStation 5 Slim 1TB',
        descricao: 'Carregamento ultrarrápido com SSD dedicado, áudio 3D e compatibilidade com jogos PS5 e PS4.',
        preco: 3699.00,
        estoque: 5,
        imagens: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600'],
      },
      {
        loja: 'Pixel Play Games',
        categoria: 'Jogos > PlayStation',
        nome: 'Controle Sem Fio DualSense PS5 Midnight Black',
        descricao: 'Gatilhos adaptáveis dinâmicos e resposta tátil integrada para maior imersão.',
        preco: 389.90,
        estoque: 20,
        imagens: ['https://images.unsplash.com/photo-1592840496073-e70ba6497ae1?w=600'],
      },
      {
        loja: 'Pixel Play Games',
        categoria: 'Jogos > Nintendo',
        nome: 'Console Nintendo Switch OLED 64GB Neon',
        descricao: 'Tela OLED vibrante de 7 polegadas, suporte ajustável amplo e dock com porta LAN.',
        preco: 2199.00,
        estoque: 8,
        imagens: ['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600'],
      },
      {
        loja: 'Pixel Play Games',
        categoria: 'Jogos > PC',
        nome: 'Teclado Mecânico Gamer RGB Switch Red',
        descricao: 'Acionamento linear rápido, iluminação RGB personalizável por tecla e anti-ghosting total.',
        preco: 279.90,
        estoque: 25,
        imagens: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600'],
      },
      {
        loja: 'Pixel Play Games',
        categoria: 'Jogos > Xbox',
        nome: 'Console Xbox Series S 512GB',
        descricao: 'Desempenho de nova geração no menor console de todos os tempos. Totalmente digital.',
        preco: 2399.00,
        estoque: 9,
        imagens: ['https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600'],
      },

      // ---------- BRINQUEDOS ----------
      {
        loja: 'Mundo Mágico Brinquedos',
        categoria: 'Brinquedos > Jogos de Tabuleiro',
        nome: 'Jogo de Tabuleiro Catan Edição Clássica',
        descricao: 'O aclamado jogo de estratégia onde você negocia, constrói e coloniza a ilha de Catan.',
        preco: 249.90,
        estoque: 15,
        imagens: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600'],
      },
      {
        loja: 'Mundo Mágico Brinquedos',
        categoria: 'Brinquedos > Bonecos e Figuras',
        nome: 'Action Figure Homem de Ferro Colecionável 30cm',
        descricao: 'Figura articulada premium com armadura detalhada e acessórios intercambiáveis.',
        preco: 129.90,
        estoque: 20,
        imagens: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600'],
      },
      {
        loja: 'Mundo Mágico Brinquedos',
        categoria: 'Brinquedos > Educativos',
        nome: 'Blocos de Montar Criativos Castelo 500 Peças',
        descricao: 'Estimula a criatividade e coordenação motora de crianças a partir de 4 anos.',
        preco: 159.90,
        estoque: 18,
        imagens: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'],
      },
      {
        loja: 'Mundo Mágico Brinquedos',
        categoria: 'Brinquedos > Pelúcias',
        nome: 'Urso de Pelúcia Gigante Antialérgico 80cm',
        descricao: 'Super macio, fofinho e preenchido com fibra siliconada hipoalergênica.',
        preco: 149.90,
        estoque: 12,
        imagens: ['https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600'],
      },

      // ---------- CASA ----------
      {
        loja: 'Lar & Conforto',
        categoria: 'Casa > Móveis',
        nome: 'Cadeira de Escritório Ergonômica Presidente Mesh',
        descricao: 'Apoio lombar ajustável, mecanismo relax e encosto em tela mesh respirável.',
        preco: 699.00,
        estoque: 15,
        imagens: ['https://images.unsplash.com/photo-1580481077195-c3a82104536b?w=600'],
      },
      {
        loja: 'Lar & Conforto',
        categoria: 'Casa > Cozinha',
        nome: 'Jogo de Panelas Antiaderente Cerâmica 5 Peças',
        descricao: 'Cozimento uniforme sem grudar, livre de toxinas e cabos soft-touch antitérmicos.',
        preco: 349.90,
        estoque: 18,
        imagens: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600'],
      },
      {
        loja: 'Lar & Conforto',
        categoria: 'Casa > Decoração',
        nome: 'Luminária de Mesa Articulada Moderna Preto Fosco',
        descricao: 'Estilo escandinavo, bivolt, perfeita para leitura e home office.',
        preco: 129.90,
        estoque: 30,
        imagens: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
      },
      {
        loja: 'Lar & Conforto',
        categoria: 'Casa > Cama, Mesa e Banho',
        nome: 'Jogo de Cama Queen 400 Fios 100% Algodão',
        descricao: 'Toque acetinado macio, inclui lençol com elástico, sobrelençol e duas fronhas.',
        preco: 219.90,
        estoque: 20,
        imagens: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
      },
      {
        loja: 'Lar & Conforto',
        categoria: 'Casa > Cozinha',
        nome: 'Cafeteira Francesa Prensa em Inox 600ml',
        descricao: 'Preparo simples de café encorpado sem necessidade de filtro de papel.',
        preco: 89.90,
        estoque: 40,
        imagens: ['https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600'],
      },
    ];

    const produtosMap = {};
    for (const p of produtosData) {
      const lojaId = lojasMap[p.loja];
      const categoriaId = categoriasMap[p.categoria];

      const resProd = await client.query(
        `INSERT INTO "produtos" ("loja_id", "categoria_id", "nome", "descricao", "preco", "estoque", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING "id"`,
        [lojaId, categoriaId, p.nome, p.descricao, p.preco, p.estoque]
      );
      const produtoId = resProd.rows[0].id;
      produtosMap[p.nome] = produtoId;

      // Inserir imagens do produto
      for (let i = 0; i < p.imagens.length; i++) {
        await client.query(
          `INSERT INTO "imagens_produto" ("produto_id", "url_imagem", "ordem")
           VALUES ($1, $2, $3)`,
          [produtoId, p.imagens[i], i + 1]
        );
      }
    }
    console.log(`✅ ${Object.keys(produtosMap).length} produtos com imagens inseridos.`);

    // ==========================================
    // 5. AVALIAÇÕES DE PRODUTOS
    // ==========================================
    console.log('⭐ Criando avaliações de produtos...');
    const avaliacoesProdutosData = [
      {
        usuario: 'ricardo_cliente',
        produto: 'Café Especial Gourmet Torrado 500g',
        nota: 5,
        comentario: 'Café espetacular! Aroma muito intenso e sabor equilibrado, sem aquele amargor de queimado.',
      },
      {
        usuario: 'beatriz_cliente',
        produto: 'Café Especial Gourmet Torrado 500g',
        nota: 4,
        comentario: 'Muito bom para a prensa francesa. Entrega foi muito rápida!',
      },
      {
        usuario: 'gabriel_cliente',
        produto: 'Azeite de Oliva Extra Virgem 500ml',
        nota: 5,
        comentario: 'Azeite de altíssima qualidade, deu outro sabor para as saladas aqui em casa.',
      },
      {
        usuario: 'ricardo_cliente',
        produto: 'Smartphone Galaxy 5G 128GB Preto',
        nota: 5,
        comentario: 'Aparelho muito fluido, câmeras excelentes e a bateria dura mais de um dia fácil.',
      },
      {
        usuario: 'beatriz_cliente',
        produto: 'Smartphone Galaxy 5G 128GB Preto',
        nota: 4,
        comentario: 'Gostei muito da tela de 120Hz. Apenas o carregador na caixa que poderia ser mais potente.',
      },
      {
        usuario: 'gabriel_cliente',
        produto: 'Console PlayStation 5 Slim 1TB',
        nota: 5,
        comentario: 'Simplesmente o melhor videogame que já tive! O DualSense traz uma imersão surreal.',
      },
      {
        usuario: 'beatriz_cliente',
        produto: 'Batom Líquido Velvet Matte Longa Duração',
        nota: 5,
        comentario: 'Cor linda e não craquela nos lábios durante o dia. Recomendo demais!',
      },
      {
        usuario: 'ricardo_cliente',
        produto: 'Camiseta Básica Algodão Egípcio Preta',
        nota: 5,
        comentario: 'O tecido é extremamente confortável e o caimento no corpo ficou perfeito.',
      },
      {
        usuario: 'beatriz_cliente',
        produto: 'Cadeira de Escritório Ergonômica Presidente Mesh',
        nota: 5,
        comentario: 'Salvou minhas costas no home office! Muito fácil de montar e regular.',
      },
      {
        usuario: 'gabriel_cliente',
        produto: 'Jogo de Tabuleiro Catan Edição Clássica',
        nota: 5,
        comentario: 'Sensacional para jogar com os amigos no final de semana. Qualidade dos componentes é ótima.',
      },
      {
        usuario: 'ricardo_cliente',
        produto: 'Multivitamínico Completo A-Z 60 Cápsulas',
        nota: 4,
        comentario: 'Tomo diariamente há 2 semanas e já sinto mais energia no trabalho.',
      },
    ];

    const avaliacoesProdutosMap = [];
    for (const ap of avaliacoesProdutosData) {
      const usuarioId = usuariosMap[ap.usuario];
      const produtoId = produtosMap[ap.produto];

      const res = await client.query(
        `INSERT INTO "avaliacoes_produto" ("usuario_id", "produto_id", "nota", "comentario", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING "id"`,
        [usuarioId, produtoId, ap.nota, ap.comentario]
      );
      avaliacoesProdutosMap.push({ id: res.rows[0].id, ...ap });
    }
    console.log(`✅ ${avaliacoesProdutosMap.length} avaliações de produtos inseridas.`);

    // ==========================================
    // 6. AVALIAÇÕES DE LOJAS
    // ==========================================
    console.log('🏬 Criando avaliações de lojas...');
    const avaliacoesLojasData = [
      {
        usuario: 'ricardo_cliente',
        loja: 'SuperMercado Bom Preço',
        nota: 5,
        comentario: 'Entrega rápida no mesmo dia, produtos vieram bem embalados e frescos!',
      },
      {
        usuario: 'beatriz_cliente',
        loja: 'Farmácia Viva Bem',
        nota: 5,
        comentario: 'Atendimento nota 10 e preços muito competitivos. Minha farmácia favorita.',
      },
      {
        usuario: 'gabriel_cliente',
        loja: 'TechZone Eletrônicos',
        nota: 5,
        comentario: 'Comprei meu celular e chegou com nota fiscal e garantia tudo certinho.',
      },
      {
        usuario: 'beatriz_cliente',
        loja: 'Glow Beleza & Cosméticos',
        nota: 5,
        comentario: 'Loja impecável, veio com amostrinhas grátis que adorei experimentar!',
      },
      {
        usuario: 'ricardo_cliente',
        loja: 'Pixel Play Games',
        nota: 5,
        comentario: 'Excelente loja para gamers, suporte tirou todas as dúvidas antes da compra.',
      },
    ];

    const avaliacoesLojasMap = [];
    for (const al of avaliacoesLojasData) {
      const usuarioId = usuariosMap[al.usuario];
      const lojaId = lojasMap[al.loja];

      const res = await client.query(
        `INSERT INTO "avaliacoes_loja" ("usuario_id", "loja_id", "nota", "comentario", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING "id"`,
        [usuarioId, lojaId, al.nota, al.comentario]
      );
      avaliacoesLojasMap.push({ id: res.rows[0].id, ...al });
    }
    console.log(`✅ ${avaliacoesLojasMap.length} avaliações de lojas inseridas.`);

    // ==========================================
    // 7. COMENTÁRIOS E RESPOSTAS (THREADS)
    // ==========================================
    console.log('💬 Criando comentários e respostas aninhadas...');

    // Resposta da loja ao review de café
    const resCom1 = await client.query(
      `INSERT INTO "comentarios_avaliacao" ("usuario_id", "avaliacao_produto_id", "avaliacao_loja_id", "comentario_pai_id", "conteudo", "createdAt", "updatedAt")
       VALUES ($1, $2, NULL, NULL, $3, NOW(), NOW())
       RETURNING "id"`,
      [
        usuariosMap['roberto_mercado'],
        avaliacoesProdutosMap[0].id,
        'Olá Ricardo! Muito obrigado pela preferência e pelo carinho. Buscamos sempre os melhores grãos artesanais!',
      ]
    );
    const com1Id = resCom1.rows[0].id;

    // Réplica do cliente na thread
    await client.query(
      `INSERT INTO "comentarios_avaliacao" ("usuario_id", "avaliacao_produto_id", "avaliacao_loja_id", "comentario_pai_id", "conteudo", "createdAt", "updatedAt")
       VALUES ($1, $2, NULL, $3, $4, NOW(), NOW())`,
      [
        usuariosMap['ricardo_cliente'],
        avaliacoesProdutosMap[0].id,
        com1Id,
        'Com certeza comprarei novamente no próximo mês!',
      ]
    );

    // Resposta da loja ao review de smartphone
    const resCom2 = await client.query(
      `INSERT INTO "comentarios_avaliacao" ("usuario_id", "avaliacao_produto_id", "avaliacao_loja_id", "comentario_pai_id", "conteudo", "createdAt", "updatedAt")
       VALUES ($1, $2, NULL, NULL, $3, NOW(), NOW())
       RETURNING "id"`,
      [
        usuariosMap['lucas_tech'],
        avaliacoesProdutosMap[3].id,
        'Agradecemos a confiança, Ricardo! Qualquer dúvida sobre configurações adicionais estamos à disposição.',
      ]
    );

    // Resposta da loja na avaliação da loja Bom Preço
    await client.query(
      `INSERT INTO "comentarios_avaliacao" ("usuario_id", "avaliacao_produto_id", "avaliacao_loja_id", "comentario_pai_id", "conteudo", "createdAt", "updatedAt")
       VALUES ($1, NULL, $2, NULL, $3, NOW(), NOW())`,
      [
        usuariosMap['roberto_mercado'],
        avaliacoesLojasMap[0].id,
        'Obrigado pelo retorno positivo! Trabalhamos com dedicação diária para entregar no prazo combinado.',
      ]
    );

    // Resposta na avaliação da loja Glow Beleza
    await client.query(
      `INSERT INTO "comentarios_avaliacao" ("usuario_id", "avaliacao_produto_id", "avaliacao_loja_id", "comentario_pai_id", "conteudo", "createdAt", "updatedAt")
       VALUES ($1, NULL, $2, NULL, $3, NOW(), NOW())`,
      [
        usuariosMap['mariana_beleza'],
        avaliacoesLojasMap[3].id,
        'Que amor, Beatriz! Ficamos muito felizes que você tenha amado os mimos. Até a próxima comprinha!',
      ]
    );

    console.log('✅ Comentários e respostas aninhadas inseridos.');

    await client.query('COMMIT');
    console.log('\n🎉 Povoamento concluído com sucesso!');
    console.log('==========================================');
    console.log('🔑 Credenciais para teste no login:');
    console.log('   Senha padrão para todos: Senha123!');
    console.log('   Admin:      admin@stockles.com');
    console.log('   Lojistas:   roberto@bompreco.com, carlos@farmaciavivabem.com, mariana@glowbeleza.com');
    console.log('   Clientes:   ricardo.cliente@gmail.com, beatriz.cliente@gmail.com');
    console.log('==========================================');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante o povoamento:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
