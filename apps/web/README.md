# Sistema de Gestão de Serviços

Um sistema de gestão de serviços desenvolvido com React, TypeScript e Vite, utilizando TailwindCSS para estilização.

## Tecnologias Utilizadas

- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utilitário
- **React Query** - Gerenciamento de estado e requisições
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Zustand** - Gerenciamento de estado global
- **Lucide React** - Biblioteca de ícones

## Funcionalidades

- Dashboard com métricas e estatísticas
- Gestão de usuários (Agências, Fornecedores, Administradores)
- Gestão de empresas parceiras
- Gestão de serviços
- Solicitações de serviços
- Sistema de avaliações
- Gestão de pagamentos
- Relatórios e analytics
- Configurações do sistema

## Pré-requisitos

- Node.js 20.18.0 ou superior
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pnpm install
# ou
yarn
```

3. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o TypeScript e constrói o projeto para produção
- `npm run lint` - Executa o linter no código
- `npm run lint:fix` - Corrige automaticamente problemas de linting
- `npm run format` - Formata o código com Prettier
- `npm run format:check` - Verifica a formatação do código
- `npm run preview` - Visualiza a build de produção localmente
- `npm run type-check` - Verifica os tipos TypeScript

## Estrutura do Projeto

- `/src` - Código fonte da aplicação
  - `/components` - Componentes React reutilizáveis
  - `/hooks` - Custom hooks React
  - `/lib` - Utilitários e funções auxiliares
  - `/pages` - Componentes de página
  - `/services` - Serviços de API
  - `/types` - Definições de tipos TypeScript
