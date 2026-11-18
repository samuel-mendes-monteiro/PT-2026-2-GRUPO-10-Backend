-- ==============================================================================
-- Script SQL de Povoamento Inicial (Seed) - Stock.io / Stockles
-- Compatível com PostgreSQL / Prisma
-- Credenciais padrão de todos os usuários: Senha123!
-- ==============================================================================

BEGIN;

-- 1. Limpeza das tabelas
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

-- 2. Usuários (Senha padrão: Senha123!)
INSERT INTO "usuarios" ("id", "username", "nome", "email", "senha_hash", "senha_versao", "foto_perfil_url", "createdAt", "updatedAt") VALUES
(1, 'admin', 'Administrador Stockles', 'admin@stockles.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', NOW(), NOW()),
(2, 'roberto_mercado', 'Roberto Silva', 'roberto@bompreco.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', NOW(), NOW()),
(3, 'carlos_farmacia', 'Carlos Eduardo', 'carlos@farmaciavivabem.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', NOW(), NOW()),
(4, 'mariana_beleza', 'Mariana Rocha', 'mariana@glowbeleza.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', NOW(), NOW()),
(5, 'ana_moda', 'Ana Paula Oliveira', 'ana@urbanstyle.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', NOW(), NOW()),
(6, 'lucas_tech', 'Lucas Mendes', 'lucas@techzone.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200', NOW(), NOW()),
(7, 'felipe_games', 'Felipe Costa', 'felipe@pixelplay.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200', NOW(), NOW()),
(8, 'camila_brinquedos', 'Camila Santos', 'camila@mundomagico.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', NOW(), NOW()),
(9, 'juliana_casa', 'Juliana Duarte', 'juliana@larconforto.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', NOW(), NOW()),
(10, 'ricardo_cliente', 'Ricardo Lima', 'ricardo.cliente@gmail.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', NOW(), NOW()),
(11, 'beatriz_cliente', 'Beatriz Souza', 'beatriz.cliente@gmail.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200', NOW(), NOW()),
(12, 'gabriel_cliente', 'Gabriel Martins', 'gabriel.cliente@gmail.com', '$2b$10$EK5sSWrnygTGz5iHbgCvQO3hLL.VFQy2HTDCNVe6hAM8lbzUpwuIq', 0, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200', NOW(), NOW());

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM "usuarios"));

-- 3. Categorias Raiz (As 8 categorias com ícones no front)
INSERT INTO "categorias" ("id", "nome", "categoria_pai_id") VALUES
(1, 'Mercado', NULL),
(2, 'Farmácia', NULL),
(3, 'Beleza', NULL),
(4, 'Moda', NULL),
(5, 'Eletrônicos', NULL),
(6, 'Jogos', NULL),
(7, 'Brinquedos', NULL),
(8, 'Casa', NULL);

-- 4. Subcategorias
INSERT INTO "categorias" ("id", "nome", "categoria_pai_id") VALUES
-- Mercado (id 1)
(9, 'Bebidas', 1),
(10, 'Mercearia', 1),
(11, 'Laticínios', 1),
(12, 'Limpeza', 1),
-- Farmácia (id 2)
(13, 'Medicamentos', 2),
(14, 'Vitaminas', 2),
(15, 'Higiene', 2),
(16, 'Bebê', 2),
-- Beleza (id 3)
(17, 'Maquilhagem', 3),
(18, 'Skincare', 3),
(19, 'Cabelo', 3),
(20, 'Perfumes', 3),
-- Moda (id 4)
(21, 'Roupas', 4),
(22, 'Calçado', 4),
(23, 'Acessórios', 4),
(24, 'Infantil', 4),
-- Eletrônicos (id 5)
(25, 'Smartphones', 5),
(26, 'Computadores', 5),
(27, 'TVs', 5),
(28, 'Acessórios', 5),
-- Jogos (id 6)
(29, 'PlayStation', 6),
(30, 'Xbox', 6),
(31, 'Nintendo', 6),
(32, 'PC', 6),
-- Brinquedos (id 7)
(33, 'Jogos de Tabuleiro', 7),
(34, 'Bonecos e Figuras', 7),
(35, 'Educativos', 7),
(36, 'Pelúcias', 7),
-- Casa (id 8)
(37, 'Móveis', 8),
(38, 'Decoração', 8),
(39, 'Cozinha', 8),
(40, 'Cama, Mesa e Banho', 8);

SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM "categorias"));

-- 5. Lojas
INSERT INTO "lojas" ("id", "usuario_id", "nome", "descricao", "logo_url", "banner_url", "sticker_url", "createdAt", "updatedAt") VALUES
(1, 2, 'SuperMercado Bom Preço', 'Alimentos frescos, bebidas e produtos de mercearia com entrega rápida e os melhores preços.', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200', '/images/CarrosselCategorias/mercado.svg', NOW(), NOW()),
(2, 3, 'Farmácia Viva Bem', 'Sua saúde e cuidado diário em primeiro lugar. Medicamentos, vitaminas e produtos para bebê.', 'https://images.unsplash.com/photo-1586015555751-63c29994c6d3?w=300', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200', '/images/CarrosselCategorias/remedio.svg', NOW(), NOW()),
(3, 4, 'Glow Beleza & Cosméticos', 'O universo da beleza em um só lugar. Linhas completas de skincare, perfumes e maquiagens.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200', '/images/CarrosselCategorias/batom.svg', NOW(), NOW()),
(4, 5, 'Urban Style Modas', 'Tendências contemporâneas, calçados e vestuário com o melhor caimento e estilo autêntico.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200', '/images/CarrosselCategorias/moda.svg', NOW(), NOW()),
(5, 6, 'TechZone Eletrônicos', 'Tecnologia de ponta: smartphones, notebooks, televisores e acessórios com garantia total.', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200', '/images/CarrosselCategorias/laptop.svg', NOW(), NOW()),
(6, 7, 'Pixel Play Games', 'O paraíso gamer! Consoles PlayStation, Xbox, Nintendo Switch, periféricos para PC e lançamentos.', 'https://images.unsplash.com/photo-1612287232230-67d7102e1c31?w=300', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200', '/images/CarrosselCategorias/videogame.svg', NOW(), NOW()),
(7, 8, 'Mundo Mágico Brinquedos', 'Diversão para todas as idades! Jogos de tabuleiro, figuras colecionáveis, pelúcias e educativos.', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200', '/images/CarrosselCategorias/BONECA.png', NOW(), NOW()),
(8, 9, 'Lar & Conforto', 'Transforme seu lar com móveis elegantes, utilidades de cozinha, decoração e roupas de cama.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200', '/images/CarrosselCategorias/CASA.png', NOW(), NOW());

SELECT setval('lojas_id_seq', (SELECT MAX(id) FROM "lojas"));

-- 6. Produtos
INSERT INTO "produtos" ("id", "loja_id", "categoria_id", "nome", "descricao", "preco", "estoque", "createdAt", "updatedAt") VALUES
-- Mercado (Loja 1)
(1, 1, 10, 'Café Especial Gourmet Torrado 500g', 'Grãos 100% arábica com notas aromáticas de caramelo e chocolate. Torra média balanceada.', 28.90, 45, NOW(), NOW()),
(2, 1, 10, 'Azeite de Oliva Extra Virgem 500ml', 'Prensagem a frio com acidez máxima de 0,2%. Importado de Portugal.', 42.50, 30, NOW(), NOW()),
(3, 1, 9, 'Vinho Tinto Cabernet Sauvignon 750ml', 'Vinho encorpado com taninos aveludados e notas de frutas vermelhas maduras.', 59.90, 20, NOW(), NOW()),
(4, 1, 9, 'Cerveja Artesanal IPA Puro Malte 500ml', 'Cerveja artesanal com amargor marcante e aroma cítrico de lúpulos nobres.', 16.90, 80, NOW(), NOW()),
(5, 1, 11, 'Queijo Parmesão Curado Artesanal 300g', 'Maturado por 12 meses, textura granulada e sabor intenso inconfundível.', 34.90, 25, NOW(), NOW()),
(6, 1, 12, 'Sabão Líquido Concentrado Lavanderia 3L', 'Rende até 60 lavagens. Fórmula com alto poder de remoção de manchas.', 44.90, 50, NOW(), NOW()),
(7, 1, 12, 'Desinfetante Floral Multiuso 2L', 'Elimina 99,9% dos germes e bactérias deixando uma agradável fragrância floral.', 11.90, 0, NOW(), NOW()),

-- Farmácia (Loja 2)
(8, 2, 14, 'Multivitamínico Completo A-Z 60 Cápsulas', 'Suplemento vitamínico e mineral para fortalecer a imunidade e disposição diária.', 49.90, 40, NOW(), NOW()),
(9, 2, 14, 'Vitamina C 1000mg + Zinco Efervescente', 'Antioxidante potente que auxilia no bom funcionamento do sistema imunológico.', 19.90, 70, NOW(), NOW()),
(10, 2, 15, 'Protetor Solar Facial Toque Seco FPS 50 50g', 'Controle de oleosidade por 12 horas, textura leve e acabamento matte invisível.', 64.90, 35, NOW(), NOW()),
(11, 2, 15, 'Enxaguante Bucal Antisséptico Menta 500ml', 'Proteção contra placa bacteriana e mau hálito sem ardor.', 22.90, 50, NOW(), NOW()),
(12, 2, 16, 'Kit Fraldas Confort Premium Tam M 48 Un', 'Camadas absorventes respiráveis que mantêm o bebê sequinho a noite toda.', 79.90, 25, NOW(), NOW()),
(13, 2, 13, 'Curativos Adesivos Flexíveis 40 Un', 'Barreira protetora contra sujeira e germes com alta fixação.', 12.50, 90, NOW(), NOW()),

-- Beleza (Loja 3)
(14, 3, 17, 'Batom Líquido Velvet Matte Longa Duração', 'Alta pigmentação, secagem rápida e cobertura uniforme sem ressecar os lábios.', 39.90, 40, NOW(), NOW()),
(15, 3, 17, 'Paleta de Sombras Nude Essence 12 Cores', 'Tons neutros e cintilantes com textura ultrafina e alta fixação.', 89.90, 20, NOW(), NOW()),
(16, 3, 18, 'Sérum Facial Ácido Hialurônico Puro 30ml', 'Hidratação profunda, preenchimento de linhas finas e luminosidade radiante.', 79.90, 35, NOW(), NOW()),
(17, 3, 19, 'Óleo Reparador Capilar de Argan 100ml', 'Finalizador térmico que sela cutículas, reduz o frizz e dá brilho espelhado.', 52.90, 30, NOW(), NOW()),
(18, 3, 20, 'Perfume Feminino Floral Eau de Parfum 100ml', 'Fragrância marcante e sofisticada com buquê de jasmim, rosas e baunilha.', 229.90, 15, NOW(), NOW()),

-- Moda (Loja 4)
(19, 4, 21, 'Camiseta Básica Algodão Egípcio Preta', 'Toque macio incomparável, gola redonda reforçada e modelagem regular atemporal.', 69.90, 60, NOW(), NOW()),
(20, 4, 21, 'Jaqueta Jeans Oversized Unissex', 'Denim 100% algodão com lavagem vintage e bolsos funcionais.', 189.90, 18, NOW(), NOW()),
(21, 4, 22, 'Tênis Casual Streetwear Branco', 'Design minimalista, solado em borracha antiderrapante e palmilha ultra confortável.', 249.90, 25, NOW(), NOW()),
(22, 4, 23, 'Relógio Minimalista Masculino em Aço', 'Mecanismo analógico de precisão quartzo e mostrador limpo em aço inoxidável.', 199.90, 15, NOW(), NOW()),
(23, 4, 24, 'Conjunto Moletom Infantil Confort', 'Casaco com capuz e calça em tecido felpado macio para manter as crianças aquecidas.', 89.90, 30, NOW(), NOW()),

-- Eletrônicos (Loja 5)
(24, 5, 25, 'Smartphone Galaxy 5G 128GB Preto', 'Tela AMOLED 6.6" 120Hz, câmera quádrupla 64MP e bateria de longa duração 5000mAh.', 1899.00, 14, NOW(), NOW()),
(25, 5, 25, 'iPhone 15 Pro 256GB Titânio', 'Chip A17 Pro, design em titânio aeroespacial e sistema avançado de câmeras 48MP.', 6999.00, 8, NOW(), NOW()),
(26, 5, 26, 'Notebook Ultrafino 15.6" Core i7 16GB SSD 512GB', 'Alta performance para produtividade, corpo em alumínio e tela Full HD.', 3799.00, 10, NOW(), NOW()),
(27, 5, 27, 'Smart TV 55" 4K UHD HDR Wi-Fi Bluetooth', 'Resolução 4K cristalina, som imersivo Dolby Audio e apps integrados.', 2499.00, 7, NOW(), NOW()),
(28, 5, 28, 'Fone de Ouvido Bluetooth Cancelamento Ruído', 'Driver de 40mm, bateria de até 35 horas e cancelamento ativo de ruído.', 299.90, 40, NOW(), NOW()),

-- Jogos (Loja 6)
(29, 6, 29, 'Console PlayStation 5 Slim 1TB', 'Carregamento ultrarrápido com SSD dedicado, áudio 3D e gráficos em 4K.', 3699.00, 5, NOW(), NOW()),
(30, 6, 29, 'Controle Sem Fio DualSense PS5 Midnight Black', 'Gatilhos adaptáveis dinâmicos e resposta tátil integrada para maior imersão.', 389.90, 20, NOW(), NOW()),
(31, 6, 31, 'Console Nintendo Switch OLED 64GB Neon', 'Tela OLED vibrante de 7 polegadas, suporte ajustável amplo e dock com porta LAN.', 2199.00, 8, NOW(), NOW()),
(32, 6, 32, 'Teclado Mecânico Gamer RGB Switch Red', 'Acionamento linear rápido, iluminação RGB personalizável e anti-ghosting total.', 279.90, 25, NOW(), NOW()),
(33, 6, 30, 'Console Xbox Series S 512GB', 'Desempenho de nova geração no menor console de todos os tempos. Totalmente digital.', 2399.00, 9, NOW(), NOW()),

-- Brinquedos (Loja 7)
(34, 7, 33, 'Jogo de Tabuleiro Catan Edição Clássica', 'O aclamado jogo de estratégia onde você negocia, constrói e coloniza a ilha de Catan.', 249.90, 15, NOW(), NOW()),
(35, 7, 34, 'Action Figure Homem de Ferro Colecionável 30cm', 'Figura articulada premium com armadura detalhada e acessórios intercambiáveis.', 129.90, 20, NOW(), NOW()),
(36, 7, 35, 'Blocos de Montar Criativos Castelo 500 Peças', 'Estimula a criatividade e coordenação motora de crianças a partir de 4 anos.', 159.90, 18, NOW(), NOW()),
(37, 7, 36, 'Urso de Pelúcia Gigante Antialérgico 80cm', 'Super macio, fofinho e preenchido com fibra siliconada hipoalergênica.', 149.90, 12, NOW(), NOW()),

-- Casa (Loja 8)
(38, 8, 37, 'Cadeira de Escritório Ergonômica Presidente Mesh', 'Apoio lombar ajustável, mecanismo relax e encosto em tela mesh respirável.', 699.00, 15, NOW(), NOW()),
(39, 8, 39, 'Jogo de Panelas Antiaderente Cerâmica 5 Peças', 'Cozimento uniforme sem grudar, livre de toxinas e cabos soft-touch antitérmicos.', 349.90, 18, NOW(), NOW()),
(40, 8, 38, 'Luminária de Mesa Articulada Moderna Preto Fosco', 'Estilo escandinavo, bivolt, perfeita para leitura e home office.', 129.90, 30, NOW(), NOW()),
(41, 8, 40, 'Jogo de Cama Queen 400 Fios 100% Algodão', 'Toque acetinado macio, inclui lençol com elástico, sobrelençol e fronhas.', 219.90, 20, NOW(), NOW()),
(42, 8, 39, 'Cafeteira Francesa Prensa em Inox 600ml', 'Preparo simples de café encorpado sem necessidade de filtro de papel.', 89.90, 40, NOW(), NOW());

SELECT setval('produtos_id_seq', (SELECT MAX(id) FROM "produtos"));

-- 7. Imagens dos Produtos
INSERT INTO "imagens_produto" ("produto_id", "url_imagem", "ordem") VALUES
(1, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600', 1),
(2, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', 1),
(3, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', 1),
(4, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600', 1),
(5, 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600', 1),
(6, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600', 1),
(7, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600', 1),
(8, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 1),
(9, 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600', 1),
(10, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 1),
(11, 'https://images.unsplash.com/photo-1559671089-8d6a8ebdc737?w=600', 1),
(12, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600', 1),
(13, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600', 1),
(14, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', 1),
(15, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', 1),
(16, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 1),
(17, 'https://images.unsplash.com/photo-1608248597359-577c2e391b42?w=600', 1),
(18, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600', 1),
(19, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600', 1),
(20, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600', 1),
(21, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 1),
(22, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 1),
(23, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600', 1),
(24, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 1),
(25, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', 1),
(26, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 1),
(27, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', 1),
(28, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 1),
(29, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600', 1),
(30, 'https://images.unsplash.com/photo-1592840496073-e70ba6497ae1?w=600', 1),
(31, 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600', 1),
(32, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', 1),
(33, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600', 1),
(34, 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600', 1),
(35, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600', 1),
(36, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', 1),
(37, 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600', 1),
(38, 'https://images.unsplash.com/photo-1580481077195-c3a82104536b?w=600', 1),
(39, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600', 1),
(40, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 1),
(41, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600', 1),
(42, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 1);

-- 8. Avaliações de Produtos
INSERT INTO "avaliacoes_produto" ("id", "usuario_id", "produto_id", "nota", "comentario", "createdAt", "updatedAt") VALUES
(1, 10, 1, 5, 'Café espetacular! Aroma muito intenso e sabor equilibrado, sem aquele amargor de queimado.', NOW(), NOW()),
(2, 11, 1, 4, 'Muito bom para a prensa francesa. Entrega foi muito rápida!', NOW(), NOW()),
(3, 12, 2, 5, 'Azeite de altíssima qualidade, deu outro sabor para as saladas aqui em casa.', NOW(), NOW()),
(4, 10, 24, 5, 'Aparelho muito fluido, câmeras excelentes e a bateria dura mais de um dia fácil.', NOW(), NOW()),
(5, 11, 24, 4, 'Gostei muito da tela de 120Hz. Apenas o carregador na caixa que poderia ser mais potente.', NOW(), NOW()),
(6, 12, 29, 5, 'Simplesmente o melhor videogame que já tive! O DualSense traz uma imersão surreal.', NOW(), NOW()),
(7, 11, 14, 5, 'Cor linda e não craquela nos lábios durante o dia. Recomendo demais!', NOW(), NOW()),
(8, 10, 19, 5, 'O tecido é extremamente confortável e o caimento no corpo ficou perfeito.', NOW(), NOW()),
(9, 11, 38, 5, 'Salvou minhas costas no home office! Muito fácil de montar e regular.', NOW(), NOW()),
(10, 12, 34, 5, 'Sensacional para jogar com os amigos no final de semana. Qualidade dos componentes é ótima.', NOW(), NOW()),
(11, 10, 8, 4, 'Tomo diariamente há 2 semanas e já sinto mais energia no trabalho.', NOW(), NOW());

SELECT setval('avaliacoes_produto_id_seq', (SELECT MAX(id) FROM "avaliacoes_produto"));

-- 9. Avaliações de Lojas
INSERT INTO "avaliacoes_loja" ("id", "usuario_id", "loja_id", "nota", "comentario", "createdAt", "updatedAt") VALUES
(1, 10, 1, 5, 'Entrega rápida no mesmo dia, produtos vieram bem embalados e frescos!', NOW(), NOW()),
(2, 11, 2, 5, 'Atendimento nota 10 e preços muito competitivos. Minha farmácia favorita.', NOW(), NOW()),
(3, 12, 5, 5, 'Comprei meu celular e chegou com nota fiscal e garantia tudo certinho.', NOW(), NOW()),
(4, 11, 3, 5, 'Loja impecável, veio com amostrinhas grátis que adorei experimentar!', NOW(), NOW()),
(5, 10, 6, 5, 'Excelente loja para gamers, suporte tirou todas as dúvidas antes da compra.', NOW(), NOW());

SELECT setval('avaliacoes_loja_id_seq', (SELECT MAX(id) FROM "avaliacoes_loja"));

-- 10. Comentários e Respostas Aninhadas (Threads)
INSERT INTO "comentarios_avaliacao" ("id", "usuario_id", "avaliacao_produto_id", "avaliacao_loja_id", "comentario_pai_id", "conteudo", "createdAt", "updatedAt") VALUES
-- Resposta da loja ao review de café
(1, 2, 1, NULL, NULL, 'Olá Ricardo! Muito obrigado pela preferência e pelo carinho. Buscamos sempre os melhores grãos artesanais!', NOW(), NOW()),
-- Tréplica do cliente
(2, 10, 1, NULL, 1, 'Com certeza comprarei novamente no próximo mês!', NOW(), NOW()),
-- Resposta da loja TechZone ao review do Galaxy
(3, 6, 4, NULL, NULL, 'Agradecemos a confiança, Ricardo! Qualquer dúvida sobre configurações adicionais estamos à disposição.', NOW(), NOW()),
-- Resposta da loja Bom Preço à avaliação de loja
(4, 2, NULL, 1, NULL, 'Obrigado pelo retorno positivo! Trabalhamos com dedicação diária para entregar no prazo combinado.', NOW(), NOW()),
-- Resposta da loja Glow Beleza à avaliação de loja
(5, 4, NULL, 4, NULL, 'Que amor, Beatriz! Ficamos muito felizes que você tenha amado os mimos. Até a próxima comprinha!', NOW(), NOW());

SELECT setval('comentarios_avaliacao_id_seq', (SELECT MAX(id) FROM "comentarios_avaliacao"));

COMMIT;
