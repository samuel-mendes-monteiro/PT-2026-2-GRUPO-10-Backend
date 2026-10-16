# Backend PT CJR 2026.2

Repositório de desenvolvimento web com o framework **NestJS** (back-end), criado para o processo trainee da empresa júnior **CJR** da Universidade de Brasília.

---

## Sumário

- [Nest (Back-end)](#nest-back-end)
  - [Instalação](#instalação)
  - [Prisma (Banco de dados)](#prisma-banco-de-dados)

---

## Nest (Back-end)

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

---

## Next (Front-end)

### Rodando em desenvolvimento

```bash
npm run dev
```
A aplicação ficará disponível em `http://localhost:3000`.

#### Rodando testes 

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

```


