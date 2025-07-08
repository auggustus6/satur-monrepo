# 🚀 Guia de Deploy - Monorepo Satur

Este guia mostra como colocar no ar seu monorepo com **Turborepo**, **pnpm**, **React (frontend)**, **NestJS (backend)** e **PostgreSQL**.

---

## 📦 Estrutura do Projeto

```
satur/
├── apps/
│   ├── api/     # Backend (NestJS)
│   └── web/     # Frontend (React)
├── packages/
│   └── ui/      # Componentes compartilhados
├── pnpm-lock.yaml
├── turbo.json
└── ...
```

---

## 1️⃣ Deploy Local (Desenvolvimento)

### Pré-requisitos
- Node.js 18+
- pnpm
- Docker e Docker Compose

### Passos
```bash
# 1. Instale as dependências
pnpm install

# 2. Suba o banco de dados
pnpm --filter api run docker:up

# 3. Rode as migrations e o seed
pnpm --filter api run prisma:migrate
pnpm --filter api run prisma:seed

# 4. Rode tudo em modo dev
pnpm dev
```
- Frontend: http://localhost:5173
- API: http://localhost:3000
- Prisma Studio: http://localhost:5555

---

## 2️⃣ Deploy em Produção (VPS, DigitalOcean, EC2, etc)

### Pré-requisitos
- Docker instalado na máquina
- Variáveis de ambiente configuradas (`.env` na API)

### Passos

#### 1. **Build do Frontend e Backend**
```bash
# Build do frontend
pnpm --filter web run build
# Build do backend
pnpm --filter api run build
```

#### 2. **Configurar Docker Compose**
Crie um arquivo `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: satur_db
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      context: ./apps/api
    env_file:
      - ./apps/api/.env
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/satur_db
    depends_on:
      - postgres
    ports:
      - '3000:3000'

  web:
    build:
      context: ./apps/web
    environment:
      VITE_API_URL: http://localhost:3000
    ports:
      - '5173:5173'

volumes:
  pgdata:
```

#### 3. **Build e Deploy com Docker Compose**
```bash
# Build das imagens
sudo docker-compose -f docker-compose.prod.yml build
# Subir tudo
sudo docker-compose -f docker-compose.prod.yml up -d
```

- Frontend: http://<seu-ip>:5173
- API: http://<seu-ip>:3000

---

## 3️⃣ Deploy em Cloud (Railway, Render, Vercel, etc)

### **Banco de Dados**
- Use um serviço gerenciado (ex: Railway, Supabase, Neon, Render)
- Copie a `DATABASE_URL` fornecida e coloque no `.env` da API

### **Backend (NestJS)**
- Railway/Render: conecte o repo, configure build (`pnpm install && pnpm build`) e start (`pnpm start:prod`)
- Configure as variáveis de ambiente
- Exponha a porta 3000

### **Frontend (React)**
- Vercel/Netlify: conecte o repo, configure build (`pnpm build`) e start (`pnpm preview` ou `vite preview`)
- Configure a variável `VITE_API_URL` apontando para a URL da API

---

## 🔑 Dicas Finais
- Sempre use variáveis de ambiente seguras em produção
- Use HTTPS em produção
- Monitore logs e recursos do servidor
- Faça backup do banco de dados regularmente

---

## 🆘 Suporte
- Dúvidas? Abra uma issue ou entre em contato com a equipe!
