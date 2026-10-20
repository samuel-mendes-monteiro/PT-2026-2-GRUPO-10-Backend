# Backend PT CJR 2026.2 — Grupo 10

API REST desenvolvida em **NestJS** para o processo trainee da empresa júnior **CJR** (Universidade de Brasília). O projeto modela uma plataforma de lojas e produtos com avaliações, e hoje já entrega cadastro de usuários e autenticação via **JWT**.

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Endpoints](#endpoints)
- [Autenticação](#autenticação)
- [Banco de dados](#banco-de-dados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Testando a API](#testando-a-api)

## Tecnologias

| Área              | Ferramenta                              |
| ----------------- | --------------------------------------- |
| Framework         | NestJS 12 (Express)                     |
| Linguagem         | TypeScript (ESM)                        |
| Banco de dados    | PostgreSQL 17                           |
| ORM               | Prisma 7 com `@prisma/adapter-pg`       |
| Autenticação      | `@nestjs/jwt` + `bcrypt`                |
| Validação         | `class-validator` / `class-transformer` |
| Testes            | Vitest + Supertest                      |
| Lint / formatação | oxlint / Prettier                       |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior e npm
- [Docker](https://www.docker.com/) (opcional, para subir o PostgreSQL) ou um PostgreSQL instalado localmente

## Como rodar

**1. Instale as dependências.** O `postinstall` já executa o `prisma generate`, que cria o client em `src/generated/prisma`.

```bash
npm install
```

**2. Crie o arquivo `.env`** a partir do exemplo e preencha os valores (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

```bash
# Linux / macOS
cp .env.example .env

# Windows (cmd)
copy .env.example .env
```

**3. Suba o banco de dados.**

Com Docker (usa o `docker-compose.yml`, PostgreSQL na porta 5432):

```bash
npm run db:up
```

Ou, se preferir um PostgreSQL local, crie um banco e aponte a `DATABASE_URL` para ele.

**4. Aplique as migrations.**

```bash
npm run prisma:migrate
```

**5. Inicie a aplicação.**

```bash
npm run start:dev
```

A API fica disponível em `http://localhost:3000`.


## Variáveis de ambiente

| Variável            | Descrição                                    | Exemplo                                                                  |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `POSTGRES_USER`     | Usuário do PostgreSQL (usado pelo Docker)    | `postgres`                                                               |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL (usada pelo Docker)      | `postgres`                                                               |
| `POSTGRES_DB`       | Nome do banco (usado pelo Docker)            | `pt_grupo10`                                                             |
| `DATABASE_URL`      | String de conexão usada pelo Prisma          | `postgresql://postgres:postgres@localhost:5432/pt_grupo10?schema=public` |
| `JWT_SECRET`        | Chave usada para assinar e validar os tokens | uma string longa e aleatória                                             |
| `PORT`              | Reservada   | `3000`                                                                   |


## Scripts disponíveis

| Comando                             | O que faz                                     |
| ----------------------------------- | --------------------------------------------- |
| `npm run start:dev`                 | Inicia em modo desenvolvimento, com watch     |
| `npm run start:debug`               | Inicia com debug e watch                      |
| `npm run build`                     | Compila o projeto para `dist/`                |
| `npm run start:prod`                | Executa a versão compilada (`node dist/main`) |
| `npm run lint`                      | Roda o oxlint em `src/` e `test/`             |
| `npm run format`                    | Formata o código com Prettier                 |
| `npm test`                          | Executa os testes unitários                   |
| `npm run test:watch`                | Testes em modo watch                          |
| `npm run test:cov`                  | Testes com relatório de cobertura             |
| `npm run test:e2e`                  | Executa os testes e2e                         |
| `npm run prisma:generate`           | Gera o Prisma Client                          |
| `npm run prisma:migrate`            | Cria/aplica migrations em desenvolvimento     |
| `npm run prisma:studio`             | Abre o Prisma Studio para visualizar os dados |
| `npm run db:up` / `npm run db:down` | Sobe / derruba o PostgreSQL via Docker        |

## Endpoints

Por padrão **todas as rotas exigem token JWT**. As exceções são as marcadas com o decorator `@Public()`.

| Método   | Rota          | Auth    | Descrição                                                 |
| -------- | ------------- | ------- | --------------------------------------------------------- |
| `GET`    | `/`           | Pública | Health check (`Hello World!`)                             |
| `POST`   | `/auth/login` | Pública | Autentica e retorna o `access_token`                      |
| `GET`    | `/auth/me`    | Token   | Retorna o payload do token (`sub`, `email`, `iat`, `exp`) |
| `POST`   | `/user`       | Token   | Cria um usuário                                           |
| `GET`    | `/user`       | Token   | Lista os usuários                                         |
| `GET`    | `/user/:id`   | Token   | Busca um usuário por id                                   |
| `PATCH`  | `/user/:id`   | Token   | Atualiza um usuário                                       |
| `DELETE` | `/user/:id`   | Token   | Remove um usuário                                         |

### Exemplos de corpo

**`POST /auth/login`**

```json
{
  "email": "teste@gmail.com",
  "senha": "senha_teste_123"
}
```

Resposta (`200`):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**`POST /user`**

```json
{
  "username": "teste_username",
  "nome": "Teste",
  "email": "teste@gmail.com",
  "senhaHash": "senha_teste_123",
  "fotoPerfilUrl": "https://exemplo.com/foto.png"
}
```

O campo `senhaHash` recebe a **senha em texto puro** (mínimo de 8 caracteres). O hash com bcrypt é feito pelo servidor antes de salvar. `fotoPerfilUrl` é opcional.

### Códigos de erro comuns

| Status | Quando acontece                                                         |
| ------ | ----------------------------------------------------------------------- |
| `400`  | Corpo inválido (e-mail mal formatado, campo ausente ou com tipo errado) |
| `401`  | Token ausente/inválido ou credenciais incorretas                        |
| `404`  | Usuário não encontrado                                                  |
| `409`  | `username` ou `email` já cadastrado                                     |

## Autenticação

1. O cliente envia `email` e `senha` para `POST /auth/login`.
2. O `LoginValidationMiddleware` valida o corpo da requisição (`email` válido e `senha` string não vazia) e responde `400` com a lista de erros se algo estiver errado.
3. O `AuthService` busca o usuário, compara a senha com o hash (bcrypt) e, se estiver correta, assina um JWT com validade de **1 dia**.
4. Nas demais rotas, o `AuthGuard` (registrado globalmente) lê o header `Authorization: Bearer <token>` e valida o token com o `JWT_SECRET`.
5. Para liberar uma rota sem autenticação, use o decorator `@Public()`.
6. Para acessar o usuário logado dentro de um controller, use o decorator `@CurrentUser()`.

## Banco de dados

O schema está em `prisma/schema.prisma`, e a migration inicial em `prisma/migrations`.

| Modelo                | Tabela                  | Descrição                                           |
| --------------------- | ----------------------- | --------------------------------------------------- |
| `Usuario`             | `usuarios`              | Usuários da plataforma                              |
| `Loja`                | `lojas`                 | Lojas, pertencentes a um usuário                    |
| `Categoria`           | `categorias`            | Categorias de produtos, com suporte a subcategorias |
| `Produto`             | `produtos`              | Produtos de uma loja, ligados a uma categoria       |
| `ImagemProduto`       | `imagens_produto`       | Imagens de cada produto, com ordem                  |
| `AvaliacaoProduto`    | `avaliacoes_produto`    | Nota e comentário de um usuário sobre um produto    |
| `AvaliacaoLoja`       | `avaliacoes_loja`       | Nota e comentário de um usuário sobre uma loja      |
| `ComentarioAvaliacao` | `comentarios_avaliacao` | Comentários em avaliações de produto ou de loja     |

Para visualizar e editar os dados pelo navegador:

```bash
npm run prisma:studio
```

> A pasta `src/generated/prisma` é gerada automaticamente e está no `.gitignore`. Se ela sumir, rode `npm run prisma:generate`.

## Estrutura do projeto

```text
.
├── prisma/
│   ├── migrations/          # Migrations do banco
│   └── schema.prisma        # Modelos do Prisma
├── src/
│   ├── auth/
│   │   ├── decorators/      # @Public() e @CurrentUser()
│   │   ├── dto/             # LoginRequestBody
│   │   ├── guards/          # AuthGuard (JWT, global)
│   │   ├── middleware/      # LoginValidationMiddleware
│   │   ├── types/           # UserPayload, UserToken, AuthenticatedRequest
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── user/                # CRUD de usuários
│   ├── prisma/              # PrismaModule e PrismaService
│   ├── generated/prisma/    # Client gerado (não versionado)
│   ├── app.module.ts
│   └── main.ts
├── test/                    # Testes e2e
├── Testes_Insomnia/         # Coleção de requisições para o Insomnia
├── docker-compose.yml       # PostgreSQL para desenvolvimento
└── prisma.config.ts
```

## Testando a API

A pasta `Testes_Insomnia/` contém uma coleção pronta para importar no [Insomnia](https://insomnia.rest/). Ela traz requisições de criar usuário, listar, atualizar, login, `/auth/me` e health check.

Fluxo sugerido:

1. Faça `POST /auth/login` e copie o `access_token`.
2. Nas demais requisições, envie o header `Authorization: Bearer <access_token>`.
