# 🐳 Docker Setup - Backend

Este guia explica como executar o backend usando Docker para desenvolvimento local.

## 📋 Pré-requisitos

- Docker
- Docker Compose

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)

Execute o backend com PostgreSQL em containers:

```bash
# Construir e iniciar os serviços
docker-compose up --build

# Executar em background
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar os serviços
docker-compose down

# Parar e remover volumes (limpa o banco)
docker-compose down -v
```

### Opção 2: Apenas Banco PostgreSQL

Se você quiser executar apenas o PostgreSQL no Docker e o backend localmente:

```bash
# Executar apenas o PostgreSQL
docker-compose up postgres -d

# Configurar variável de ambiente
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/carlao_db?schema=public"

# Executar backend localmente
npm run start:dev
```

## 🔧 Configurações

### Variáveis de Ambiente

O `docker-compose.yml` já inclui as variáveis necessárias:

- `DATABASE_URL`: Conexão com PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `JWT_EXPIRES_IN`: Tempo de expiração do token
- `PORT`: Porta da aplicação (3000)
- `NODE_ENV`: Ambiente (production)

### Portas

- **Backend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Swagger**: http://localhost:3000/api

## 📊 Comandos Úteis

```bash
# Ver containers rodando
docker-compose ps

# Executar comandos no container da aplicação
docker-compose exec app npm run prisma:migrate
docker-compose exec app npm run prisma:seed

# Acessar shell do container
docker-compose exec app sh

# Acessar PostgreSQL
docker-compose exec postgres psql -U postgres -d carlao_db

# Rebuild apenas a aplicação
docker-compose build app

# Ver logs de um serviço específico
docker-compose logs app
docker-compose logs postgres
```

## 🗄️ Banco de Dados

### Migrations

```bash
# Executar migrations
docker-compose exec app npx prisma migrate dev

# Reset do banco
docker-compose exec app npx prisma migrate reset

# Seed do banco
docker-compose exec app npm run prisma:seed
```

### Backup e Restore

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres carlao_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres carlao_db < backup.sql
```

## 🔍 Troubleshooting

### Problemas Comuns

**Porta já em uso:**
```bash
# Verificar o que está usando a porta
lsof -i :3000
lsof -i :5432

# Parar containers
docker-compose down
```

**Problemas de permissão:**
```bash
# Limpar volumes
docker-compose down -v
docker volume prune
```

**Container não inicia:**
```bash
# Ver logs detalhados
docker-compose logs app

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 🏗️ Estrutura

```
backend/
├── Dockerfile              # Imagem da aplicação
├── docker-compose.yml      # Orquestração dos serviços
├── DOCKER.md               # Este arquivo
└── ...
```

## 📝 Notas

- O volume `postgres_data` persiste os dados do banco entre restarts
- O container da aplicação é rebuildo automaticamente quando há mudanças
- Para desenvolvimento, considere usar `npm run start:dev` localmente para hot reload
- O Dockerfile usa multi-stage build para otimizar o tamanho da imagem
