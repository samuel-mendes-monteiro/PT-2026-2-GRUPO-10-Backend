# Testes da API com Insomnia

Coleção do [Insomnia](https://insomnia.rest/download) para testar manualmente a API: cadastro, login, rotas protegidas e recuperação de senha ("esqueci minha senha").

## Pré-requisitos

- API rodando em `http://localhost:3000` (`npm run start:dev`)
- Banco de dados no ar e migrations aplicadas (`npx prisma migrate dev`)
- Insomnia instalado

## Como importar

1. Abra o Insomnia e clique em **Create → Import**.
2. Selecione o arquivo `.yaml` desta pasta.
3. A coleção **CJR PT** aparece na lista.

## Como o token funciona na coleção

As requisições protegidas (**Get Users**, **About Me**, **Update User** e **Delete User**) pegam o token sozinhas da resposta da requisição **Login**. Você não precisa copiar nada.

Basta rodar o **Login** antes. Toda vez que rodá-lo de novo, o token é atualizado. O Insomnia **não** refaz o login automaticamente, então se aparecer `401`, rode o **Login** outra vez.

> Os campos `_comment` nos corpos das requisições são só anotações e a API os ignora.

## Fluxo 1 — Cadastro e rotas protegidas

Rode nesta ordem:

| # | Requisição | Esperado |
|---|---|---|
| 1 | **Hello World** | `200`, a API está de pé |
| 2 | **Criar User** | `201` (se rodar de novo, `409`: username/email já existem) |
| 3 | **Login** | `200` com o `access_token` |
| 4 | **About Me** | `200` com `sub` (seu **id**) e `email` |
| 5 | **Get Users** | `200` com a lista de usuários |
| 6 | **Update User** | `200` com os dados atualizados |
| 7 | **Delete User** | `200`. Rode por último |

**Atenção aos ids.** O **Update User** e o **Delete User** só funcionam no **próprio usuário logado**. Se o id da URL for de outro usuário, a API responde `403`. Pegue o seu `sub` no **About Me** e troque o número na URL dessas duas requisições (`/user/3/` e `/user/4/`).

**Atenção ao corpo do Update User.** Ele muda `username`, `email` e `senhaHash`. Depois de rodá-lo, o login com os dados antigos deixa de funcionar e o token anterior pode ser invalidado, já que a senha mudou. Ajuste o corpo do **Login** para as novas credenciais antes de continuar.

O **Delete User** apaga o usuário logado. Para seguir testando, recrie-o com **Criar User**.

## Fluxo 2 — Esqueci minha senha

1. **Forgot Password**: envia `{ "email": "teste@gmail.com" }`. A resposta é sempre `200` com uma mensagem genérica, o e-mail existindo ou não.
2. **Copie o token do terminal do Nest.** Sem SMTP configurado no `.env`, o link aparece no log, assim: `.../redefinir-senha?token=XXXXXXXX`. Copie só o valor depois de `token=`. Se `SMTP_HOST` estiver preenchido, o link vai por e-mail.
3. **Reset Password**: cole o token no campo `token` (no lugar de `TOKEN_DO_CONSOLE`) e rode. Esperado: `200`. O token vale **30 minutos** e só pode ser usado **uma vez** (repetir dá `400`).
4. **Login (New Password)**: entra com a nova senha (`novasenha123`). Esperado: `200`.
5. Confirme que a senha **antiga** não funciona mais: rode o **Login** com a senha antiga e espere `401`.

**Usando as rotas protegidas depois do reset.** Elas leem o token da requisição **Login**, que ainda tem a senha antiga no corpo. Troque a senha do corpo do **Login** para `novasenha123` e rode-o de novo. Se nada for feito, o token antigo dá `401`.

**Para repetir o teste.** Rode **Forgot Password** e **Reset Password** de novo com `"novaSenha": "senha_teste_123"` para voltar à senha original.

## Fluxo 3 — Lojas, categorias, produtos, avaliações e comentários

As requisições ficam nas pastas **Lojas**, **Categorias**, **Produtos**, **Avaliações** e **Comentários** da coleção. Faça o **Login** antes (as protegidas pegam o token sozinhas). Rode nesta ordem:

| # | Pasta | Requisição | Esperado |
|---|---|---|---|
| 1 | Lojas | **Criar Loja** | `201` |
| 2 | Lojas | **Criar Loja (nome vazio)** | `400` |
| 3 | Lojas | **Listar Lojas** / **Buscar Loja por Id** | `200` |
| 4 | Lojas | **Editar Loja** | `200` |
| 5 | Categorias | **Criar Categoria** e **Criar Subcategoria** | `201` |
| 6 | Categorias | **Listar Categorias** / **Opcoes de Categoria** / **Buscar Categoria por Id** | `200` |
| 7 | Categorias | **Editar Categoria** | `200` |
| 8 | Produtos | **Criar Produto** | `201` |
| 9 | Produtos | **Criar Produto (preço inválido)** | `400` |
| 10 | Produtos | **Listar Produtos** / **Listar Produtos (filtros)** / **Buscar Produto por Id** | `200` |
| 11 | Produtos | **Editar Produto** | `200` |
| 12 | Avaliações | **Criar Avaliação** | `201` (de novo: `409`) |
| 13 | Avaliações | **Criar Avaliação (nota inválida)** | `400` |
| 14 | Avaliações | **Listar Avaliações** / **Buscar Avaliação por Id** | `200` |
| 15 | Avaliações | **Editar Avaliação** | `200` |
| 16 | Comentários | **Criar Comentário** | `201` |
| 17 | Comentários | **Criar Comentário (sem avaliação)** | `400` |
| 17.1 | Comentários | **Responder Comentário** | `201` (com um `comentarioPaiId` que não existe: `404`) |
| 18 | Comentários | **Listar Comentários** / **Buscar Comentário por Id** | `200` |
| 19 | Comentários | **Editar Comentário** | `200` |
| 20 | todas | **Apagar Comentário**, **Apagar Avaliação**, **Apagar Produto**, **Apagar Categoria**, **Apagar Loja** | `200` (nesta ordem) |

**Ids nas URLs.** As requisições usam `1` como id (ex.: `/lojas/1`, `/products/1`). Se o id criado no seu banco for outro, troque na URL. O `id` aparece na resposta do `POST` correspondente. O `lojaId` do **Criar Produto** é o id da loja criada no passo 1.

**Testando a permissão.** Crie um segundo usuário (**Criar User** com outro username/e-mail), faça **Login** com ele e tente **Editar** ou **Apagar** o que é do primeiro. Esperado: `403` em produtos, avaliações e comentários, e `401` em lojas.

**Rotas públicas.** Os `GET` de categorias, produtos, avaliações e comentários não exigem token (exceto **Opcoes de Categoria**). Os `GET` de lojas **exigem** token.

**Atenção ao apagar.** **Apagar Loja** leva junto os produtos dela. **Apagar Produto** leva as avaliações e os comentários dele. **Apagar Avaliação** leva os comentários dela. **Apagar Categoria** dá `409` se ainda houver produtos nela.

## Referência das requisições

| Requisição | Rota | Autenticação |
|---|---|---|
| Hello World | `GET /` | Não |
| Criar User | `POST /user` | Não |
| Login | `POST /auth/login` | Não |
| Login (New Password) | `POST /auth/login` | Não |
| Forgot Password | `POST /auth/forgot-password` | Não |
| Reset Password | `POST /auth/reset-password` | Não |
| About Me | `GET /auth/me` | Bearer (do Login) |
| Get Users | `GET /user` | Bearer (do Login) |
| Update User | `PATCH /user/:id` | Bearer (do Login) |
| Delete User | `DELETE /user/:id` | Bearer (do Login) |
| Criar Loja | `POST /lojas` | Bearer (do Login) |
| Criar Loja (nome vazio) | `POST /lojas` | Bearer (do Login) |
| Listar Lojas | `GET /lojas` | Bearer (do Login) |
| Buscar Loja por Id | `GET /lojas/:id` | Bearer (do Login) |
| Editar Loja | `PATCH /lojas/:id` | Bearer (do Login) |
| Apagar Loja | `DELETE /lojas/:id` | Bearer (do Login) |
| Criar Categoria | `POST /categories` | Bearer (do Login) |
| Criar Subcategoria | `POST /categories` | Bearer (do Login) |
| Listar Categorias | `GET /categories` | Não |
| Listar Categorias (só raiz) | `GET /categories?raiz=true` | Não |
| Opcoes de Categoria | `GET /categories/opcoes` | Bearer (do Login) |
| Buscar Categoria por Id | `GET /categories/:id` | Não |
| Editar Categoria | `PATCH /categories/:id` | Bearer (do Login) |
| Apagar Categoria | `DELETE /categories/:id` | Bearer (do Login) |
| Criar Produto | `POST /products` | Bearer (do Login) |
| Criar Produto (preço inválido) | `POST /products` | Bearer (do Login) |
| Listar Produtos | `GET /products` | Não |
| Listar Produtos (filtros) | `GET /products?categoria=&busca=` | Não |
| Listar Produtos (ordenados) | `GET /products?ordenarPor=&ordem=` | Não |
| Buscar Produto por Id | `GET /products/:id` | Não |
| Editar Produto | `PATCH /products/:id` | Bearer (do Login) |
| Apagar Produto | `DELETE /products/:id` | Bearer (do Login) |
| Criar Avaliação | `POST /reviews` | Bearer (do Login) |
| Criar Avaliação (nota inválida) | `POST /reviews` | Bearer (do Login) |
| Listar Avaliações | `GET /reviews?produtoId=` | Não |
| Buscar Avaliação por Id | `GET /reviews/:id` | Não |
| Editar Avaliação | `PATCH /reviews/:id` | Bearer (do Login) |
| Apagar Avaliação | `DELETE /reviews/:id` | Bearer (do Login) |
| Criar Comentário | `POST /comments` | Bearer (do Login) |
| Criar Comentário (sem avaliação) | `POST /comments` | Bearer (do Login) |
| Responder Comentário | `POST /comments` | Bearer (do Login) |
| Listar Comentários | `GET /comments?avaliacaoProdutoId=` | Não |
| Buscar Comentário por Id | `GET /comments/:id` | Não |
| Editar Comentário | `PATCH /comments/:id` | Bearer (do Login) |
| Apagar Comentário | `DELETE /comments/:id` | Bearer (do Login) |

## Erros comuns

| Código | Causa provável |
|---|---|
| `400` | Corpo inválido (e-mail mal formado, senha com menos de 8 caracteres) ou token de recuperação inválido/expirado/já usado |
| `401` | Login não executado, token expirado, ou senha trocada depois do login (rode o **Login** de novo) ; também é o que **Editar/Apagar Loja** devolvem quando a loja é de outro usuário |
| `403` | O id da URL não é o do usuário logado, ou o produto/avaliação/comentário é de outro usuário |
| `404` | O recurso com esse id não existe (usuário, categoria, loja, produto, avaliação ou comentário) |
| `409` | Username ou e-mail já cadastrados, avaliação repetida no mesmo produto, ou categoria que ainda tem produtos |
| `429` | Limite de requisições atingido (por exemplo, muitos **Forgot Password** seguidos). Espere 1 minuto |