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

## Erros comuns

| Código | Causa provável |
|---|---|
| `400` | Corpo inválido (e-mail mal formado, senha com menos de 8 caracteres) ou token de recuperação inválido/expirado/já usado |
| `401` | Login não executado, token expirado, ou senha trocada depois do login (rode o **Login** de novo) |
| `403` | O id da URL não é o do usuário logado |
| `404` | Usuário com esse id não existe |
| `409` | Username ou e-mail já cadastrados |
| `429` | Limite de requisições atingido (por exemplo, muitos **Forgot Password** seguidos). Espere 1 minuto |
