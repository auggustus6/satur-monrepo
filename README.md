# Satur - Monorepo

Este é o monorepo do projeto Satur, estruturado usando **Turborepo** para facilitar o desenvolvimento e reutilização de código entre diferentes aplicações.

## 🏗️ Estrutura do Projeto

```
satur/
├── apps/                          # Aplicações
│   ├── api/                       # Backend (NestJS)
│   │   ├── src/                   # Código fonte da API
│   │   ├── prisma/                # Schema e migrations do banco
│   │   └── package.json
│   └── web/                       # Frontend (React + Vite)
│       ├── src/                   # Código fonte do frontend
│       └── package.json
├── packages/                      # Bibliotecas compartilhadas
│   └── ui/                        # Componentes de UI reutilizáveis
│       ├── src/                   # Componentes React
│       └── package.json
├── package.json                   # Configuração do workspace
├── turbo.json                     # Configuração do Turborepo
└── README.md                      # Este arquivo
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado)

### Instalação

```bash
# Instalar dependências de todos os packages
pnpm install
```

## 🎯 Scripts Disponíveis

### Scripts Gerais (Turborepo)

```bash
# Executar build em todos os apps
pnpm build

# Executar modo desenvolvimento em todos os apps
pnpm dev

# Executar lint em todos os apps
pnpm lint

# Executar testes em todos os apps
pnpm test

# Executar type-check em todos os apps
pnpm type-check

# Limpar builds
pnpm clean

# Formatar código
pnpm format
```

### Scripts Específicos por App

```bash
# Executar apenas a API
pnpm api:dev

# Executar apenas o frontend
pnpm web:dev

# Executar apenas o package UI
pnpm ui:dev
```

## 📦 Packages

### @satur/ui

Biblioteca de componentes UI reutilizáveis baseada em:
- **React** - Biblioteca base
- **Radix UI** - Componentes primitivos acessíveis
- **Tailwind CSS** - Estilização utilitária
- **Class Variance Authority** - Gerenciamento de variantes
- **clsx** + **tailwind-merge** - Utilitários para classes CSS

#### Componentes Disponíveis

- `Button` - Botão com múltiplas variantes
- `Input` - Campo de entrada
- `Label` - Rótulo para formulários
- `Card` - Container de conteúdo
- `Badge` - Etiqueta de status
- `Dialog` - Modal/diálogo
- `Select` - Seletor dropdown
- `Checkbox` - Caixa de seleção
- `RadioGroup` - Grupo de radio buttons
- `Switch` - Interruptor on/off
- `Tabs` - Navegação em abas
- `Separator` - Separador visual
- `Popover` - Conteúdo flutuante
- `Command` - Interface de comando
- `Form` - Componentes de formulário
- `Pagination` - Paginação
- `MultiSelect` - Seleção múltipla
- E muitos outros...

#### Exemplo de Uso

```tsx
import { Button, Card, CardContent } from '@satur/ui';

export const MyComponent = () => {
  return (
    <Card>
      <CardContent>
        <Button variant="primary" size="lg">
          Clique aqui
        </Button>
      </CardContent>
    </Card>
  );
};
```

## 🛠️ Desenvolvimento

### Adicionando Novos Packages

1. Criar novo diretório em `packages/`
2. Adicionar `package.json` com nome `@satur/nome-do-package`
3. Configurar scripts necessários
4. Adicionar dependência nos apps que precisam usar

### Adicionando Novos Apps

1. Criar novo diretório em `apps/`
2. Configurar `package.json` com nome único
3. Adicionar scripts `dev`, `build`, `lint`, `test`
4. Configurar dependências do workspace se necessário

## 🔧 Configuração

### Turborepo

O `turbo.json` define o pipeline de build:

- **build**: Compila todos os apps e packages
- **dev**: Executa modo desenvolvimento
- **lint**: Verifica código
- **test**: Executa testes
- **type-check**: Verifica tipos TypeScript

### Workspaces

O `package.json` raiz configura os workspaces:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

## 🎨 Padrões de Código

- **TypeScript** em todos os projetos
- **ESLint** + **Prettier** para formatação
- **Conventional Commits** para mensagens
- **Tailwind CSS** para estilização

## 🚀 Deploy

### API (Backend)

```bash
# Build do backend
pnpm turbo run build --filter=api

# Executar em produção
cd apps/api
pnpm start:prod
```

### Frontend (Web)

```bash
# Build do frontend
pnpm turbo run build --filter=web

# Os arquivos estáticos estarão em apps/web/dist/
```

## 📋 Banco de Dados

O banco de dados usa **Prisma** com PostgreSQL. Scripts disponíveis:

```bash
cd apps/api

# Gerar cliente Prisma
pnpm prisma:generate

# Executar migrations
pnpm prisma:migrate

# Abrir Prisma Studio
pnpm prisma:studio

# Seed do banco
pnpm prisma:seed
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato:

- Email: suporte@satur.com
- GitHub Issues: [Reportar Bug](../../issues)

---

Feito com ❤️ pela equipe Satur
