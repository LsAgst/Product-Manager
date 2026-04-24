# Product Manager

Sistema de gerenciamento de produtos com backend em ASP.NET Core e frontend em React + TypeScript.

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

## Configuração

### Iniciando tudo de uma vez

Pela raiz do projeto, rode:

```bash
cd frontend
npm install
npm run dev:all
```

Ou em um unico comando (sem entrar na pasta):

```bash
npm --prefix frontend install
npm --prefix frontend run dev:all
```

Isso inicia o backend e o frontend simultaneamente no mesmo terminal. A API ficará em `http://localhost:5232` e a aplicação em `http://localhost:5173`.

> Na primeira execução o banco de dados será criado e as migrations aplicadas automaticamente.

---

### Backend (separado)

1. Navegue até a pasta do backend:

```bash
cd Backend/Backend
```

2. Copie o arquivo de exemplo e ajuste as credenciais:

```bash
copy appsettings.example.json appsettings.json
```

Edite `appsettings.json` com o usuário e senha do seu PostgreSQL:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=product_manager;Username=postgres;Password=sua_senha"
```

3. Execute o backend:

```bash
dotnet run
```

O banco de dados, as migrações e os dados iniciais são criados e aplicados automaticamente na primeira execução — não é necessário criar o banco manualmente. A API ficará disponível em `http://localhost:5232`.

### Frontend (separado)

1. Navegue até a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o frontend:

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

## Funcionalidades

- **Produtos**: listagem paginada com filtros por nome, categoria e faixa de preço
- **CRUD completo**: criação, edição e exclusão (soft delete) de produtos
- **SKU**: geração automática ou informado manualmente
- **Categorias**: criação e listagem
- **Regras de negócio**:
  - Estoque não pode ser negativo
  - Produtos da categoria Eletrônicos têm preço mínimo de R$ 50,00
  - SKU deve ser único por produto

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Lista produtos (paginado, com filtros) |
| GET | `/api/products/{id}` | Busca produto por ID |
| POST | `/api/products` | Cria produto |
| PUT | `/api/products/{id}` | Atualiza produto |
| DELETE | `/api/products/{id}` | Remove produto (soft delete) |
| GET | `/api/categories` | Lista categorias |
| POST | `/api/categories` | Cria categoria |

### Parâmetros de filtro (GET /api/products)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `search` | string | Filtra por nome ou SKU |
| `categoryId` | guid | Filtra por categoria |
| `minPrice` | decimal | Preço mínimo |
| `maxPrice` | decimal | Preço máximo |
| `page` | int | Página atual (padrão: 1) |
| `pageSize` | int | Itens por página (padrão: 10) |
