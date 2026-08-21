# Natura Nice - Sistema de Gestão de Estoque e Vendas

<p align="center">
  <b>Desenvolvido por <a href="https://github.com/Guilherme2344">Guilherme2344</a></b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java_25-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java 25" />
  <img src="https://img.shields.io/badge/Quarkus-4695EB?style=for-the-badge&logo=quarkus&logoColor=white" alt="Quarkus" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Mantine_UI-339AF0?style=for-the-badge&logo=mantine&logoColor=white" alt="Mantine UI" />
  <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="#-português">Português</a> •
  <a href="#-english">English</a>
</p>

---

## 🇧🇷 Português

### 📖 Sobre o Projeto
O **Natura Nice** é um sistema completo para gestão de estoque, controle de validade de produtos, registro de vendas e geração de relatórios financeiros diários, mensais e anuais. A aplicação foi projetada para oferecer alta performance, navegação fluida, segurança de dados e relatórios detalhados de faturamento, custos e margem de lucro.

---

### ✨ Recursos Principais
- **Gestão de Produtos**: Cadastro completo com controle de quantidade, preço de compra, preço de venda, marca, categoria e família de produtos.
- **Alertas de Validade**: Telas dedicadas para monitoramento de produtos à vencer e produtos vencidos.
- **Registro de Vendas**: Modal rápido para efetivação de vendas de produtos com suporte a vínculo de cliente.
- **Relatórios Financeiros**:
  - **Relatório Mensal**: Detalhamento diário do faturamento, custo total, lucro e margem (%).
  - **Relatório Anual**: Detalhamento mensal comparativo de vendas.
  - **Filtros por Cliente**: Análise de desempenho por cliente individual.
- **Painel Administrativo**: Gestão de usuários (administradores e comuns) com envio automático de e-mail de primeiro acesso (senha provisória).
- **Segurança & Autenticação**:
  - Controle de sessão com tempo limite e expiração automática.
  - Recuperação de senha por e-mail com token temporário.
  - Restrição de segurança CORS dinâmico por ambiente.
  - Cabeçalhos de segurança HTTP (anti-clickjacking, anti-sniffing).
  - Páginas de erro customizadas (404, 403, 500, 503).
- **Licença Proprietária**: Direitos autorais reservados (*All Rights Reserved*).

---

### 🛠️ Tecnologias & Bibliotecas Utilizadas

#### **Backend (API REST)**
| Tecnologia | Logo / Badge | Descrição |
| :--- | :---: | :--- |
| **Java 25** | <img src="https://img.shields.io/badge/Java_25-ED8B00?style=flat-square&logo=java&logoColor=white" /> | Linguagem de programação moderna. |
| **Quarkus 3.x** | <img src="https://img.shields.io/badge/Quarkus-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Framework Java de alta performance com baixo consumo de memória. |
| **PostgreSQL** | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" /> | Banco de dados relacional com extensões `unaccent` e índices `@Index`. |
| **Hibernate ORM** | <img src="https://img.shields.io/badge/Hibernate-59666C?style=flat-square&logo=hibernate&logoColor=white" /> | Camada de persistência JPA simplificada com Panache. |
| **Swagger / OpenAPI** | <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" /> | Documentação interativa das rotas de API. |
| **Quarkus Mailer** | <img src="https://img.shields.io/badge/Quarkus_Mailer-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Envio assíncrono de e-mails em segundo plano (CDI Events). |

#### **Frontend (Single Page Application)**
| Tecnologia / Biblioteca | Logo / Badge | Descrição |
| :--- | :---: | :--- |
| **React 19** | <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" /> | Interface de usuário reativa e modular. |
| **TypeScript** | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" /> | Linguagem fortemente tipada. |
| **Vite 6** | <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" /> | Bundler de altíssima velocidade para desenvolvimento e build. |
| **Mantine UI 7** | <img src="https://img.shields.io/badge/Mantine_UI-339AF0?style=flat-square&logo=mantine&logoColor=white" /> | Biblioteca de componentes visuais, layout responsivo e temas. |
| **TanStack React Query** | <img src="https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=react-query&logoColor=white" /> | Gerenciamento de estado de servidor e cache em memória RAM. |
| **Axios** | <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" /> | Cliente HTTP para consumo de APIs com interceptores. |
| **React Router v7** | <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white" /> | Roteamento no navegador com títulos dinâmicos e páginas de erro. |
| **Yup** | <img src="https://img.shields.io/badge/Yup-3178C6?style=flat-square&logo=yup&logoColor=white" /> | Validação de esquemas e formulários no cliente. |
| **Lucide Icons** | <img src="https://img.shields.io/badge/Lucide-F56565?style=flat-square&logo=lucide&logoColor=white" /> | Biblioteca de ícones vetoriais em SVG. |

---

### 📐 Arquitetura & Diagramas

> 📌 **Espaço Reservado para Diagramas**
> *(Insira aqui futuramente seus diagramas de arquitetura, diagramas UML de classes e diagrama entidade-relacionamento - ER)*

```markdown
<!-- Espaço para inserção dos diagramas -->
<!-- Exemplo: ![Diagrama de Arquitetura](./docs/arquitetura.png) -->
<!-- Exemplo: ![Diagrama ER](./docs/erd.png) -->
```

---

### 🚀 Como Executar o Projeto

#### **Pré-requisitos**
- Java 25+ instalado
- Node.js 18+ e npm instalados
- Banco de dados PostgreSQL rodando localmente

#### **1. Configuração do Backend**
```bash
cd backend

# Execute o backend em modo de desenvolvimento (Porta 8080)
./mvnw quarkus:dev
```

#### **2. Configuração do Frontend**
```bash
cd frontend

# Instale as dependências
npm install

# Execute o frontend em modo de desenvolvimento (Porta 5173 / 8081)
npm run dev
```

---

<br />

---

## 🇺🇸 English

### 📖 About the Project
**Natura Nice** is a full-featured inventory management, product expiration tracking, sales registration, and financial reporting web application. Designed for high performance, smooth navigation, data security, and detailed analytics covering revenue, costs, and profit margins.

---

### ✨ Key Features
- **Product Management**: Full CRUD operations covering quantity, purchase price, selling price, brand, category, and family.
- **Expiration Alerts**: Dedicated screens monitoring near-expiration and expired items.
- **Sales Processing**: Fast checkout modal for registering product sales linked to customers.
- **Financial Reports**:
  - **Monthly Report**: Daily breakdown of revenue, total cost, profit, and margin (%).
  - **Annual Report**: Comparative monthly sales analytics.
  - **Customer Filters**: Performance analysis filtered by individual client.
- **Admin Panel**: User management (admin and standard roles) with automated onboarding email dispatch (temporary passwords).
- **Security & Authentication**:
  - Session timeout and automatic expiration control.
  - Password recovery via email with temporary verification tokens.
  - Dynamic environment CORS security restriction.
  - HTTP security headers (anti-clickjacking, anti-sniffing).
  - Custom error pages (404, 403, 500, 503).
- **Proprietary License**: All Rights Reserved.

---

### 🛠️ Technologies & Libraries Used

#### **Backend (REST API)**
| Technology | Badge | Description |
| :--- | :---: | :--- |
| **Java 25** | <img src="https://img.shields.io/badge/Java_25-ED8B00?style=flat-square&logo=java&logoColor=white" /> | Modern programming language. |
| **Quarkus 3.x** | <img src="https://img.shields.io/badge/Quarkus-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Cloud-native Java framework with low memory footprint. |
| **PostgreSQL** | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" /> | Relational database with `unaccent` and B-Tree `@Index` support. |
| **Hibernate ORM** | <img src="https://img.shields.io/badge/Hibernate-59666C?style=flat-square&logo=hibernate&logoColor=white" /> | JPA persistence layer with Panache patterns. |
| **Swagger / OpenAPI** | <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" /> | Interactive REST API documentation interface. |

#### **Frontend (Single Page Application)**
| Technology / Library | Badge | Description |
| :--- | :---: | :--- |
| **React 19** | <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" /> | Reactive and componentized UI library. |
| **TypeScript** | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" /> | Strongly typed programming language. |
| **Vite 6** | <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" /> | Next-generation frontend bundler and dev tool. |
| **Mantine UI 7** | <img src="https://img.shields.io/badge/Mantine_UI-339AF0?style=flat-square&logo=mantine&logoColor=white" /> | Responsive component library and styling theme. |
| **TanStack React Query** | <img src="https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=react-query&logoColor=white" /> | Server state management and RAM caching. |
| **Axios** | <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" /> | HTTP client featuring request/response interceptors. |
| **React Router v7** | <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white" /> | Client-side routing with dynamic title handler. |

---

### 📐 Architecture & Diagrams

> 📌 **Reserved Diagram Space**
> *(Insert your system architecture, UML class diagrams, and Entity-Relationship ER diagrams here)*

```markdown
<!-- Placeholder for diagrams -->
<!-- Example: ![Architecture Diagram](./docs/architecture.png) -->
<!-- Example: ![ER Diagram](./docs/erd.png) -->
```

---

### 🚀 How to Run the Project

#### **Prerequisites**
- Java 25+ installed
- Node.js 18+ and npm installed
- PostgreSQL database running locally

#### **1. Backend Setup**
```bash
cd backend

# Run the Quarkus backend in development mode (Port 8080)
./mvnw quarkus:dev
```

#### **2. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Run the React Vite frontend in development mode (Port 5173 / 8081)
npm run dev
```

---

### 📄 License
This project is proprietary software. All rights reserved by [Guilherme2344](https://github.com/Guilherme2344).
