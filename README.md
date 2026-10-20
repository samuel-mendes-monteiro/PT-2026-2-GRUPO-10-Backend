# Backend PT CJR 2026.2

Repositório de desenvolvimento web com o framework **NestJS** (back-end), criado para o processo trainee da empresa júnior **CJR** da Universidade de Brasília.

---

## Sumário

- [Nest (Back-end)](#nest-back-end)
  - [Instalação](#instalação)
  - [Prisma (Banco de dados)](#prisma-banco-de-dados)

---

## Nest (Back-end)

### Inicialização

crie sua .env

#### Windows

```bash
  copy .env.example .env
```

#### Linux

```bash
  cp .env.example .env
```

##### Configure sua .env preenchendo os campos conforme necessário

- DATABASE_URL
- JWT_SECRET

### Instalação

Instale os pacotes:

```bash
npm install
```

---

### Prisma (Banco de dados)

#### Gere o Arquivo generated

> ```bash
> npx prisma generate
> ```

#### Visualizando os dados

```bash
npx prisma studio
```

Ou com algum software como o Insomnia

```bash
npm run start:dev
```
