# ⚡ MercadoExpress

> **Plataforma web de comercio electrónico basada en arquitectura de microservicios para la gestión eficiente de productos, pedidos y envíos en el mercado colombiano.**

---

## 📌 Descripción General

**MercadoExpress** es una plataforma integral de comercio electrónico diseñada para resolver las necesidades del mercado colombiano. Implementa un modelo de **arquitectura de microservicios** desacoplados mediante el patrón *Database-per-Service*, coordinados por un **API Gateway** centralizado, caché con **Redis**, autenticación mediante **JWT (JSON Web Tokens)** con lista negra (blacklisting) y un despliegue completo contenedorizado con **Docker Compose**.

El sistema incorpora:
* **Logística Nacional Colombiana:** Cálculo dinámico de envíos por departamento y municipios con tarifas diferenciadas.
* **Facturación Electrónica:** Generación de facturas con cálculo del 19% de IVA (régimen común DIAN), visualización en pantalla completa y descarga directa en **formato PDF**.
* **Gestión de Pedidos y Trazabilidad:** Seguimiento en tiempo real de estados de paquetes con código de guía (`TRK-XXXX`).
* **Seguridad y Control de Acceso (RBAC):** Sistema de roles diferenciados (Cliente, Operador, Vendedor, Contador, Administrador).
* **Panel de Analíticas e Inteligencia de Negocio:** KPIs de ventas, productos más vendidos, métodos de pago y métricas en tiempo real.

---

## 🏗️ Arquitectura del Sistema

```
                        [ Cliente Web ]          [ Panel Administrador ]
                         (React :5173)                (React :5174)
                               │                           │
                               └─────────────┬─────────────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │    API GATEWAY    │ (:3000)
                                   │  (JWT + Proxies)  │
                                   └─────────┬─────────┘
        ┌──────────────┬──────────────┬──────┴───────┬──────────────┬──────────────┐
        │              │              │              │              │              │
 ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
 │    Auth     ││   Catalog   ││   Orders    ││  Payments   ││  Tracking   ││  Analytics  │
 │   (:4001)   ││   (:4002)   ││   (:4003)   ││   (:4004)   ││   (:4005)   ││   (:4006)   │
 └──────┬──────┘└──────┬──────┘└──────┬──────┘└──────┬──────┘└──────┬──────┘└──────┬──────┘
        │              │              │              │              │              │
 ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
 │   auth_db   ││  catalog_db ││  orders_db  ││ payments_db ││ tracking_db ││ analytics_db│
 │(Postgres 16)││(Postgres 16)││(Postgres 16)││(Postgres 16)││(Postgres 16)││(Postgres 16)│
 └─────────────┘└─────────────┘└─────────────┘└─────────────┘└─────────────┘└─────────────┘
        │              │                                                           │
        └──────────────┴─────────────────────► REDIS ◄─────────────────────────────┘
                                              (:6379)
```

---

## 🚀 Tecnologías Utilizadas

| Componente | Tecnología |
|---|---|
| **Backend** | Node.js, Express.js |
| **Frontend Clientes** | React 19, Vite 8, Lucide React, React Hot Toast |
| **Frontend Admin** | React 19, Vite 8 |
| **Bases de Datos** | PostgreSQL 16 (6 instancias independientes) |
| **Caché y Sesiones** | Redis 7 (Cache-aside + Token blacklisting) |
| **Autenticación** | JWT (JSON Web Tokens) + Bcrypt |
| **Contenedorización** | Docker, Docker Compose (14 contenedores) |

---

## 📂 Estructura del Repositorio

```
MercadoExpress/
├── gateway/                 # API Gateway central (puerto 3000)
├── services/
│   ├── auth/                # Servicio de autenticación y usuarios (puerto 4001)
│   ├── catalog/             # Servicio de catálogo e inventario (puerto 4002)
│   ├── orders/              # Servicio de órdenes y cálculo de envíos (puerto 4003)
│   ├── payments/            # Servicio de pagos y facturación IVA (puerto 4004)
│   ├── tracking/            # Servicio de rastreo y eventos de envío (puerto 4005)
│   └── analytics/           # Servicio de inteligencia de negocios (puerto 4006)
├── frontend/                # Tienda web pública para clientes y vendedores
├── admin-frontend/          # Panel administrativo de gestión
├── docker-compose.yml       # Orquestación de los 14 servicios y bases de datos
├── .env.example             # Plantilla de variables de entorno
└── README.md                # Documentación del proyecto
```

---

## 🛠️ Instalación y Despliegue con Docker

### Requisitos previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
* [Git](https://git-scm.com/) instalado.

### 1. Clonar el repositorio
```bash
git clone https://github.com/HenryJMJ/MercadoExpress.git
cd MercadoExpress
```

### 2. Configurar variables de entorno
Copiar el archivo de plantilla:
```bash
cp .env.example .env
```

### 3. Levantar la plataforma completa
```bash
docker compose up --build -d
```

### 4. Acceder a los servicios
* **Tienda Web (Clientes):** [http://localhost:5173](http://localhost:5173)
* **Panel de Administración:** [http://localhost:5174](http://localhost:5174)
* **API Gateway:** [http://localhost:3000/health](http://localhost:3000/health)

---

## 📄 Funcionalidades Principales

* 🛒 **Catálogo Dinámico:** Filtrado por categorías, búsqueda en tiempo real y ordenamiento por precio o relevancia.
* 📦 **Logística Colombiana:** Costos automáticos de envío para los 32 departamentos del país y promoción de primer envío gratis.
* 💳 **Pasarela de Pago y Facturación:** Simulación de pagos (Tarjeta de Crédito y PSE) con emisión de factura electrónica legal (19% IVA, CUFE y descarga en PDF).
* 🚚 **Trazabilidad en Tiempo Real:** Módulo de seguimiento para consultar el estado del paquete mediante código de rastreo.
* 👤 **Panel de Usuario, Perfil y Configuración:**
  * Gestión de datos personales y teléfono.
  * Autocompletado de dirección habitual de entrega.
  * Cambio seguro de contraseñas con encriptación bcrypt.
  * Exportación de datos de usuario (Habeas Data Ley 1581).
* 📊 **Dashboard Administrativo:** Monitor de ventas, métricas financieras y aprobación de productos de vendedores.

---

## 👥 Equipo de Trabajo

* **Sergio Chacón Cárdenas**
* **Johan Felipe Rodríguez León**

*Facultad de Ingeniería — Programa de Ingeniería de Sistemas y Computación*
