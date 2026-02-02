<p align="center">
  <img src="https://img.shields.io/badge/Kadosh-Dental%20Management-0e2b52?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEyIDJ2MjBNMiAxMmg0TTE4IDEyaDRNMTIgMTB2Nk0xMCAxMnY0TTE0IDEydjQiLz48L3N2Zz4=" alt="Kadosh">
</p>

<h1 align="center">🦷 Kadosh</h1>
<p align="center">
  <strong>Sistema Integral de Gestión para Clínicas Dentales</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Laravel-10+-FF2D20?style=flat-square&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/MySQL-5.7+-4479A1?style=flat-square&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

<p align="center">
  <a href="#-descripción">Descripción</a> •
  <a href="#-características">Características</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-manual-de-usuario">Manual</a> •
  <a href="#-tecnologías">Tecnologías</a> •
  <a href="#-contribuir">Contribuir</a>
</p>

---

## ✨ Descripción

**Kadosh** es un sistema de gestión diseñado específicamente para clínicas dentales. Permite administrar pacientes, citas, procedimientos, facturación, nómina, odontogramas y más, desde una interfaz moderna y responsiva.

| Aspecto | Descripción |
|---------|-------------|
| **Tipo** | Aplicación web full-stack |
| **Frontend** | React.js (SPA) |
| **Backend** | Laravel (API REST) |
| **Base de datos** | MySQL |
| **Arquitectura** | Multi-tenant (soporta múltiples clínicas) |

---

## 🚀 Características

### 👥 Gestión de Pacientes
- Registro completo con historial médico y odontológico
- Búsqueda avanzada y filtros
- Ficha médica digital
- Adjuntos (imágenes, PDFs)
- Exportar/Importar datos en JSON
- **Registro rápido** desde el módulo de citas

### 📅 Citas y Agenda
- Calendario integrado (vista día, semana, mes)
- Recordatorios automáticos por email
- Integración con Google Calendar
- **Dictado por voz** del motivo de la cita
- Agendar citas con pacientes no registrados

### 🦷 Odontogramas
- Odontogramas interactivos (adultos y niños)
- Dibujo de procedimientos por diente/cara
- Impresión personalizada
- Historial por paciente

### 💰 Facturación y Finanzas
- Facturas y recibos
- Múltiples métodos de pago (efectivo, tarjeta, transferencia, cheque)
- Presupuestos con aviso "sujeto a cambios"
- Envío por WhatsApp, email y PDF
- Contabilidad integrada
- Punto de venta (POS)
- Nómina y salarios de doctores

### 📋 Presupuestos
- Creación y visualización de presupuestos
- Impresión e impresión para WhatsApp
- PDF por email
- Logo y datos de la clínica personalizables

### 💊 Recetas Médicas
- Creación de recetas
- Impresión con logo
- Envío por correo

### 🔐 Auditoría y Seguridad
- Registro de acciones por usuario
- Filtros por módulo y fecha
- Sistema de roles (Administrador, Doctor)

### ⚙️ Configuración
- Información de la clínica (nombre, dirección, teléfono, RNC)
- Logo y favicon personalizables
- Configuración de facturación
- Pagos mensuales y alertas de vencimiento
- **Multi-tenant**: administración de múltiples clínicas

---

## 📦 Instalación

### Requisitos previos

| Requisito | Versión |
|-----------|---------|
| PHP | >= 7.4 |
| Composer | >= 2.0 |
| Node.js | >= 14.x |
| MySQL | >= 5.7 |

### 1. Clonar el repositorio

```bash
git clone https://github.com/edisondja/kadosh.git
cd kadosh
```

### 2. Backend (Laravel)

```bash
cd kadoshbackend
composer install
cp .env.example .env
php artisan key:generate
```

Configurar base de datos en `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=kadosh
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

```bash
php artisan migrate
php artisan storage:link
```

### 3. Frontend (React)

```bash
cd ../kadosh
npm install
```

Configurar la URL de la API en `src/components/funciones_extras.js` o `config_site.json`:

```javascript
// Para desarrollo local
api_url: "http://localhost:8000"
```

```bash
# Desarrollo
npm start

# Producción
npm run build
```

### 4. Iniciar el servidor Laravel

```bash
cd kadoshbackend
php artisan serve
```

---

## 📖 Manual de Usuario

Para instrucciones detalladas de uso (cómo agregar pacientes, citas, facturar, etc.), consulta el **[Manual de Usuario](./docs/MANUAL_USUARIO.md)**.

---

## 🛠 Tecnologías

| Capa | Tecnología |
|------|------------|
| **Frontend** | React, React Router, Axios, Bootstrap, Chart.js, jsPDF, html2canvas, Konva |
| **Backend** | Laravel, Eloquent ORM, Dompdf |
| **Base de datos** | MySQL |
| **Integraciones** | Google Calendar, SMTP |

---

## 📁 Estructura del proyecto

```
kadosh/
├── kadosh/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes de la aplicación
│   │   └── css/
│   └── package.json
│
├── kadoshbackend/          # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── ...
│   ├── database/migrations/
│   ├── routes/api.php
│   └── composer.json
│
└── docs/
    └── MANUAL_USUARIO.md   # Manual de usuario
```

---

## 🤝 Contribuir

1. Haz un **fork** del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit (`git commit -m 'Añade nueva funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👤 Autor

**Edison De Jesus Abreu**

- GitHub: [@edisondja](https://github.com/edisondja)
- Email: edisondja@gmail.com

---

<p align="center">
  Hecho con ❤️ para clínicas dentales · <strong>Kadosh</strong>
</p>
