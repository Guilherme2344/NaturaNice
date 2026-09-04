# Natura Nice - Sistema de Gestão de Estoque e Vendas

<p align="center">
  <b>Desenvolvido por <a href="https://github.com/Guilherme2344">Guilherme2344</a></b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java_25-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 25" />
  <img src="https://img.shields.io/badge/Quarkus-4695EB?style=for-the-badge&logo=quarkus&logoColor=white" alt="Quarkus" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Mantine_UI-339AF0?style=for-the-badge&logo=mantine&logoColor=white" alt="Mantine UI" />
  <img src="https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white" alt="Heroku" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="#-português">Português</a> •
  <a href="#-english">English</a>
</p>

---

## 🇧🇷 Português

### 📖 Sobre o Projeto
O **Natura Nice** é um sistema completo para gestão de estoque, controle de validade de produtos, registro de vendas, parcelamento/abatimento de pagamentos e geração de relatórios financeiros diários, mensais e anuais. A aplicação foi projetada para oferecer alta performance, navegação fluida, segurança de dados por usuário (*multi-tenant*) e relatórios detalhados de faturamento, custos e margem de lucro.

---

### ✨ Recursos Principais
- **Gestão de Produtos**: Cadastro completo com controle de quantidade, preço de compra, preço de venda, marca, categoria e família de produtos.
- **Preservação de Snapshot de Venda (`product_name`)**: Cópia automática do nome do produto no ato da venda para impedir a exibição de "Produto indisponível" mesmo após zerar estoque e excluir o item do catálogo.
- **Alertas de Validade (Regra dos 180 Dias)**:
  - Destaque em amarelo para produtos a vencer entre **0 e 180 dias**.
  - Destaque em vermelho para produtos **vencidos**.
  - Formatação amigável em anos, meses e dias para prazos superiores a 180 dias.
- **Gestão de Vendas & Abatimento de Parcelas**:
  - Efetivação de vendas com pagamentos totais ou parciais.
  - Entidade e histórico de parcelamento (`SalePayment`) registrando data do pagamento, valor abatido, valor acumulado e saldo a pagar.
  - Modal dedicado de abatimento (`ProductPaymentModal`) e botão de visualização de histórico para produtos quitados.
  - **Gerador de Mensagens de Cobrança para WhatsApp**: Cópia com 1 clique de resumos formatados no WhatsApp (geral do cliente ou por produto específico, filtrando apenas itens em aberto).
- **Relatórios Financeiros**:
  - **Relatório Mensal**: Detalhamento diário do faturamento, custo total, lucro e margem (%), com suporte a filtro por cliente.
  - **Relatório Anual**: Faturamento e lucro mensal consolidado de todos os clientes no ano selecionado.
- **Painel Administrativo & Multi-Tenant**:
  - Isolamento estrito de dados por usuário logado.
  - Envio de e-mails em segundo plano (senha provisória e código de recuperação de 6 dígitos) via protocolo SMTP real ou mock.
- **Segurança & Resiliência**:
  - Proteção contra ataques *Brute Force* com Rate Limiting e expiração de tentativas em memória.
  - Detecção inteligente de IPs via Proxy/VPN.
  - Restrição de segurança CORS dinâmico e cabeçalhos HTTP (anti-clickjacking, anti-sniffing).
  - Tratamento global de erros DOM / pointer capture e páginas de erro customizadas (404, 403, 500, 503).
- **Licença Proprietária**: Direitos autorais reservados (*All Rights Reserved*).

---

### 🛠️ Tecnologias & Bibliotecas Utilizadas

#### **Backend & Infraestrutura (API REST)**
| Tecnologia | Logo / Badge | Descrição |
| :--- | :---: | :--- |
| **Java 25** | <img src="https://img.shields.io/badge/Java_25-ED8B00?style=flat-square&logo=openjdk&logoColor=white" /> | Linguagem de programação moderna. |
| **Quarkus 3.x** | <img src="https://img.shields.io/badge/Quarkus-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Framework Java de alta performance com baixo consumo de memória. |
| **PostgreSQL** | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" /> | Banco de dados relacional com extensões `unaccent` e índices `@Index`. |
| **Hibernate ORM** | <img src="https://img.shields.io/badge/Hibernate-59666C?style=flat-square&logo=hibernate&logoColor=white" /> | Camada de persistência JPA simplificada com Panache e entidades `SalePayment`. |
| **Heroku** | <img src="https://img.shields.io/badge/Heroku-430098?style=flat-square&logo=heroku&logoColor=white" /> | Plataforma de hospedagem e deployment em nuvem do backend. |
| **Swagger / OpenAPI** | <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" /> | Documentação interativa das rotas de API. |
| **Quarkus Mailer** | <img src="https://img.shields.io/badge/Quarkus_Mailer-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Envio assíncrono de e-mails via SMTP ou Mock (CDI Events). |

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
**Natura Nice** is a full-featured inventory management, product expiration tracking, installment payment deduction, sales registration, and financial reporting web application. Designed for high performance, smooth navigation, strict user data isolation (*multi-tenant*), and detailed analytics covering revenue, costs, and profit margins.

---

### ✨ Key Features
- **Product Management**: Full CRUD operations covering quantity, purchase price, selling price, brand, category, and family.
- **Sale Snapshot Preservation (`product_name`)**: Automatic snapshot of product names during sales to prevent "Product Unavailable" messages when stock reaches zero.
- **Expiration Rules (180-Day Rule)**:
  - Yellow badge for products expiring within **0 to 180 days**.
  - Red badge for **expired** products.
  - Friendly year, month, and day formatting for items expiring in >180 days.
- **Sales & Installment Payment Management**:
  - Full or partial payment sales registration.
  - `SalePayment` entity and history tracking payment date, amount paid, cumulative paid, and remaining balance ("To Pay").
  - Dedicated deduction modal (`ProductPaymentModal`) and history viewing button for fully paid items.
  - **WhatsApp Billing Message Generator**: One-click copy for WhatsApp formatted summaries (customer account overview or per-product breakdown, filtering pending items).
- **Financial Reports**:
  - **Monthly Report**: Daily breakdown of revenue, total cost, profit, and margin (%), with customer filter.
  - **Annual Report**: Consolidated monthly sales and profit breakdown across all customers.
- **Admin Panel & Multi-Tenant**:
  - Strict data isolation per logged-in user.
  - Background email dispatch (temporary password and 6-digit recovery code) via real SMTP or mock.
- **Security & Resilience**:
  - Brute Force protection via in-memory Rate Limiting and attempt expiration.
  - Smart Proxy/VPN IP detection.
  - Dynamic environment CORS restrictions and HTTP security headers.
  - Global DOM / pointer capture exception handling and custom error pages (404, 403, 500, 503).
- **Proprietary License**: All Rights Reserved.

---

### 🛠️ Technologies & Libraries Used

#### **Backend & Infrastructure (REST API)**
| Technology | Badge | Description |
| :--- | :---: | :--- |
| **Java 25** | <img src="https://img.shields.io/badge/Java_25-ED8B00?style=flat-square&logo=openjdk&logoColor=white" /> | Modern programming language. |
| **Quarkus 3.x** | <img src="https://img.shields.io/badge/Quarkus-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Cloud-native Java framework with low memory footprint. |
| **PostgreSQL** | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" /> | Relational database with `unaccent` and B-Tree `@Index` support. |
| **Hibernate ORM** | <img src="https://img.shields.io/badge/Hibernate-59666C?style=flat-square&logo=hibernate&logoColor=white" /> | JPA persistence layer with Panache patterns and `SalePayment` entities. |
| **Heroku** | <img src="https://img.shields.io/badge/Heroku-430098?style=flat-square&logo=heroku&logoColor=white" /> | Backend cloud hosting and deployment platform. |
| **Swagger / OpenAPI** | <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" /> | Interactive REST API documentation interface. |
| **Quarkus Mailer** | <img src="https://img.shields.io/badge/Quarkus_Mailer-4695EB?style=flat-square&logo=quarkus&logoColor=white" /> | Asynchronous email dispatch via SMTP or Mock mode (CDI Events). |

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
