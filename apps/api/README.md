# Carlão - Marketplace de Serviços

Sistema completo de marketplace de serviços com gestão de agências, fornecedores, solicitações, pagamentos e painel administrativo.

## 🏗️ Estrutura do Projeto

```
backend/
├── src/                    # Código-fonte da aplicação
│   ├── auth/              # Módulo de autenticação
│   ├── user/              # Módulo de usuários
│   ├── service/           # Módulo de serviços
│   ├── payment/           # Módulo de pagamentos
│   ├── product/           # Módulo de produtos
│   ├── location/          # Módulo de localização
│   └── admin/             # Módulo administrativo
├── prisma/                # Configuração do banco de dados
│   ├── schema.prisma      # Schema do banco
│   ├── migrations/        # Migrações do banco
│   └── seed.ts           # Dados iniciais
├── docker-compose.yml     # Configuração do Docker
└── README.md             # Este arquivo
```

## 🚀 Tecnologias

### Backend

- **NestJS** - Framework Node.js escalável
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - ORM moderno com type-safety
- **JWT** - Autenticação segura
- **Zod** - Validação de dados
- **Swagger** - Documentação automática da API
- **Docker** - Containerização

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 20 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (recomendado)
- **PostgreSQL** (caso não use Docker)

## ⚡ Quick Start

Para quem quer iniciar rapidamente:

```bash
# 1. Clone e instale dependências
git clone <url-do-repositorio>
cd backend
pnpm install

# 2. Configure variáveis de ambiente
cp .env.example .env

# 3. Inicie o banco de dados
pnpm run docker:up

# 4. Configure o banco
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed

# 5. Inicie o servidor
pnpm run start:dev
```

**Pronto!** Acesse:

- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Login Admin: carlos@carlao.com / admin123

### ✅ Checklist de Verificação

Marque os itens conforme você os completa:

- [ ] Node.js 20+ instalado
- [ ] Docker e Docker Compose funcionando
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados rodando (containers ativos)
- [ ] Migrações executadas
- [ ] Seed executado (dados de teste)
- [ ] Servidor iniciado
- [ ] API respondendo em http://localhost:3000
- [ ] Swagger funcionando em http://localhost:3000/api

## 🔧 Configuração e Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd backend
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configuração do Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/carlao_db?schema=public"

# Configuração JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Configuração do Servidor
PORT=3000
NODE_ENV="development"
```

### 4. Configuração do Banco de Dados

#### Opção A: Usando Docker (Recomendado)

```bash
# Subir o banco PostgreSQL com Docker
pnpm run docker:up

# Verificar se o container está rodando
docker ps
```

#### Opção B: PostgreSQL Local

Se você já tem o PostgreSQL instalado localmente, ajuste a `DATABASE_URL` no arquivo `.env`:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/carlao_db?schema=public"
```

### 5. Configurar o banco de dados

```bash
# Gerar cliente Prisma
pnpm run prisma:generate

# Executar migrações
pnpm run prisma:migrate

# Inserir dados iniciais (seed)
pnpm run prisma:seed
```

### 6. Iniciar o servidor

```bash
# Modo desenvolvimento (com hot-reload)
pnpm run start:dev

# Modo produção
pnpm run start:prod
```

## 🌐 Acesso à Aplicação

- **API Backend**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api
- **Prisma Studio**: http://localhost:5555 (execute `pnpm run prisma:studio`)

## 👥 Usuários Padrão

Após executar o seed, você terá acesso aos seguintes usuários de teste:

### Administradores

- **Email**: carlos@carlao.com | **Senha**: admin123
- **Email**: ana@carlao.com | **Senha**: admin123

### Agências

- **Email**: contato@turismosp.com | **Senha**: agency123
- **Email**: vendas@viagensecia.com | **Senha**: agency123

### Fornecedores

- **Email**: joao@transporte.com | **Senha**: supplier123
- **Email**: maria@viptransfer.com | **Senha**: supplier123

### Clientes

- **Email**: carlos.customer@carlao.com | **Senha**: customer123
- **Email**: ana.customer@carlao.com | **Senha**: customer123

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run start:dev          # Inicia servidor em modo desenvolvimento
pnpm run start:debug        # Inicia servidor em modo debug

# Build e produção
pnpm run build              # Compila o projeto
pnpm run start:prod         # Inicia servidor em produção

# Banco de dados
pnpm run prisma:generate    # Gera cliente Prisma
pnpm run prisma:migrate     # Executa migrações
pnpm run prisma:seed        # Insere dados iniciais
pnpm run prisma:studio      # Abre Prisma Studio
pnpm run db:reset           # Reseta banco de dados

# Docker
pnpm run docker:up          # Sobe containers Docker
pnpm run docker:down        # Para containers Docker
pnpm run docker:logs        # Visualiza logs dos containers

# Testes
pnpm run test               # Executa testes
pnpm run test:watch         # Executa testes em modo watch
pnpm run test:cov           # Executa testes com cobertura
pnpm run test:e2e           # Executa testes end-to-end

# Qualidade do código
pnpm run lint               # Executa ESLint
pnpm run format             # Formata código com Prettier
```

## 🔄 Fluxo de Desenvolvimento

### 1. Desenvolvimento Local

```bash
# Inicie o banco de dados
pnpm run docker:up

# Inicie o servidor
pnpm run start:dev
```

### 2. Modificações no Schema

```bash
# Após alterar prisma/schema.prisma
pnpm run prisma:migrate
pnpm run prisma:generate
```

### 3. Reset do Banco (se necessário)

```bash
# Reseta banco e reaplica seed
pnpm run db:reset
```

## 🐳 Docker

### Subir toda a aplicação com Docker

```bash
# Subir banco de dados e aplicação
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down
```

### Comandos úteis do Docker

```bash
# Rebuild da imagem
docker-compose build --no-cache

# Entrar no container da aplicação
docker-compose exec app bash

# Entrar no container do banco
docker-compose exec postgres psql -U postgres -d carlao_db
```

## 🔍 Troubleshooting

### Problema: Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker ps

# Verificar logs do banco
docker-compose logs postgres

# Recriar containers
docker-compose down
docker-compose up -d
```

### Problema: Erro de migração

```bash
# Resetar banco completamente
pnpm run db:reset

# Ou manual
pnpm dlx prisma migrate reset
pnpm dlx prisma migrate dev
pnpm run prisma:seed
```

### Problema: Porta já em uso

```bash
# Verificar qual processo está usando a porta
lsof -i :3000  # ou :5433 para PostgreSQL

# Parar processo se necessário
kill -9 <PID>
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:3000/api
- **JSON da API**: http://localhost:3000/api-json

## 🚀 Deploy

### Preparação para produção

```bash
# Build da aplicação
pnpm run build:prod

# Executar migrações em produção
pnpm run prisma:deploy
```

### Variáveis de ambiente para produção

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/db"
JWT_SECRET="strong-secret-key"
PORT=3000
```

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação acima
2. Consulte os logs da aplicação
3. Verifique se todas as dependências estão instaladas
4. Certifique-se de que o banco de dados está rodando

## 📊 Estrutura do Banco de Dados

O sistema possui as seguintes entidades principais:

- **Users**: Usuários do sistema (Admin, Agência, Fornecedor, Cliente)
- **Services**: Serviços oferecidos
- **Products**: Produtos dentro dos serviços
- **Orders**: Pedidos realizados
- **Payments**: Pagamentos processados
- **Locations**: Localizações geográficas
