# 🦷 Kadosh - Sistema de Gestión Dental

<div align="center">

![Kadosh Logo](https://img.shields.io/badge/Kadosh-Dental%20Management-blue?style=for-the-badge&logo=tooth)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Sistema completo de gestión para clínicas dentales**

[Características](#-características) • [Tecnologías](#-tecnologías) • [Instalación](#-instalación) • [Uso](#-uso) • [Contribuir](#-contribuir)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Descripción

**Kadosh** es un sistema integral de gestión diseñado específicamente para clínicas dentales. Facilita la administración completa de pacientes, citas, procedimientos, facturación, nómina y más, todo desde una interfaz moderna e intuitiva.

### ¿Por qué Kadosh?

- ✅ **Completo**: Cubre todas las necesidades de una clínica dental
- ✅ **Moderno**: Interfaz intuitiva y responsive
- ✅ **Seguro**: Sistema de auditoría y validaciones robustas
- ✅ **Escalable**: Arquitectura preparada para crecer
- ✅ **Eficiente**: Optimizado para el día a día

---

## ✨ Características

### 👥 Gestión de Pacientes
- 📝 Registro completo de información del paciente
- 📋 Historial médico y odontológico
- 📎 Gestión de archivos adjuntos (imágenes, PDFs)
- 🔍 Búsqueda avanzada y filtros
- 📤 Exportar/Importar datos en JSON

### 🦷 Odontogramas Interactivos
- 🎨 Odontogramas para adultos y niños (dientes de leche)
- 🖱️ Interfaz interactiva con feedback visual y sonoro
- 🎯 Selección precisa de dientes y caras
- 💾 Guardado de dibujos y procedimientos
- 🖨️ Impresión de odontogramas con opciones personalizadas

### 💰 Facturación y Pagos
- 🧾 Generación de facturas y recibos
- 💳 Múltiples métodos de pago (efectivo, tarjeta, transferencia, cheque, mixto)
- 📊 Reportes financieros detallados
- 🔔 Sonido de caja registradora al procesar pagos
- 📧 Envío de recibos por correo electrónico

### 📅 Gestión de Citas
- 📆 Calendario integrado
- 🔔 Recordatorios automáticos
- 📱 Integración con Google Calendar
- 📧 Notificaciones por email

### 👨‍⚕️ Gestión de Doctores
- 👤 Perfiles completos de doctores
- 🎓 Especialidades médicas
- 💼 Sistema de salarios y comisiones
- 📈 Reportes de productividad

### 💼 Nómina y Comisiones
- 💵 Cálculo automático de comisiones por procedimiento
- 📋 Gestión de pagos de nómina
- 📊 Reportes de ganancias por doctor
- 📅 Períodos de pago configurables

### 🏪 Punto de Venta (POS)
- 🛒 Gestión de inventario de productos
- 💰 Ventas de productos y servicios
- 📦 Control de stock
- 📊 Reportes de ventas

### 📝 Prescripciones
- 💊 Creación de recetas médicas
- 🖨️ Impresión de prescripciones con logo de clínica
- 📧 Envío por correo electrónico
- 📋 Historial de prescripciones

### 🔍 Auditoría
- 📊 Registro completo de todas las acciones
- 👤 Trazabilidad por usuario
- 🔍 Filtros avanzados por módulo y fecha
- 📈 Estadísticas de uso

### ⚙️ Configuración
- 🏥 Personalización de información de la clínica
- 🖼️ Logo y favicon personalizables
- 📄 Configuración de facturación (comprobante/factura)
- 🔐 Clave secreta para operaciones críticas
- 📧 Configuración de email

### 💳 Sistema de Pagos Mensuales
- 📅 Gestión de suscripciones mensuales
- ⚠️ Alertas de vencimiento (3 días de gracia)
- 📊 Historial de pagos
- 🔔 Notificaciones automáticas

---

## 🛠️ Tecnologías

### Frontend
- **React.js** - Biblioteca de JavaScript para interfaces de usuario
- **React Router** - Enrutamiento de aplicaciones
- **Axios** - Cliente HTTP
- **Alertify.js** - Notificaciones elegantes
- **Bootstrap** - Framework CSS
- **Canvas API** - Para odontogramas interactivos

### Backend
- **Laravel** - Framework PHP
- **MySQL** - Base de datos relacional
- **Eloquent ORM** - ORM para Laravel
- **Dompdf** - Generación de PDFs
- **Laravel Mail** - Sistema de correo

### Integraciones
- **Google Calendar API** - Sincronización de citas
- **SMTP** - Envío de correos electrónicos

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **PHP** >= 7.4
- **Composer** >= 2.0
- **Node.js** >= 14.x
- **npm** >= 6.x
- **MySQL** >= 5.7
- **Apache/Nginx** (recomendado)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/edisondja/kadosh.git
cd kadosh
```

### 2. Instalar dependencias del Backend

```bash
cd kadoshbackend
composer install
```

### 3. Configurar el Backend

```bash
# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Configurar base de datos en .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kadosh
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 4. Ejecutar migraciones

```bash
php artisan migrate
php artisan db:seed  # Opcional: datos de ejemplo
```

### 5. Configurar almacenamiento

```bash
php artisan storage:link
```

### 6. Instalar dependencias del Frontend

```bash
cd ../kadosh
npm install
```

### 7. Configurar variables de entorno del Frontend

Edita `src/components/funciones_extras.js` y configura la URL base de tu API:

```javascript
const url_base = "http://localhost:8000";
```

### 8. Compilar el Frontend

```bash
# Desarrollo
npm start

# Producción
npm run build
```

---

## ⚙️ Configuración

### Configuración Inicial

1. **Accede al sistema** con las credenciales de administrador
2. **Ve a Configuración** en el menú
3. **Completa la información de la clínica**:
   - Nombre de la clínica
   - Dirección
   - Teléfono
   - RNC
   - Email
   - Logo
   - Tipo de numeración de factura
   - Clave secreta para eliminaciones

### Integración con Google Calendar

1. Obtén las credenciales de Google Calendar API
2. Configura las variables en `.env`:
   ```
   GOOGLE_CALENDAR_CLIENT_ID=tu_client_id
   GOOGLE_CALENDAR_CLIENT_SECRET=tu_client_secret
   GOOGLE_CALENDAR_REDIRECT_URI=tu_redirect_uri
   ```
3. Activa la integración en Configuración

---

## 📖 Uso

### Iniciar Sesión

1. Accede a la aplicación
2. Ingresa tus credenciales de usuario
3. Selecciona tu rol (Administrador, Doctor, etc.)

### Crear un Paciente

1. Ve a **Pacientes** → **Nuevo Paciente**
2. Completa el formulario con la información del paciente
3. Guarda los datos

### Crear un Odontograma

1. Accede al perfil del paciente
2. Haz clic en **Crear Odontograma**
3. Selecciona el tipo (Adulto o Niño)
4. Haz clic en los dientes para agregar procedimientos
5. Selecciona el tratamiento deseado
6. Guarda el odontograma

### Procesar un Pago

1. Ve a la factura del paciente
2. Haz clic en **Pagar**
3. Selecciona el tipo de pago
4. Ingresa el monto
5. Confirma el pago (se reproducirá el sonido de caja registradora)

---

## 📁 Estructura del Proyecto

```
kadosh/
├── kadosh/                    # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── css/             # Estilos
│   │   └── assets/          # Recursos
│   ├── package.json
│   └── README.md
│
└── kadoshbackend/            # Backend (Laravel)
    ├── app/
    │   ├── Http/
    │   │   └── Controllers/  # Controladores
    │   ├── Models/          # Modelos Eloquent
    │   └── Helpers/         # Helpers
    ├── database/
    │   ├── migrations/      # Migraciones
    │   └── seeds/          # Seeders
    ├── routes/
    │   └── api.php         # Rutas API
    ├── config/             # Configuración
    └── composer.json
```

---

## 📡 API Documentation

### Endpoints Principales

#### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/paciente` - Crear paciente
- `GET /api/paciente/{id}` - Obtener paciente
- `PUT /api/paciente/{id}` - Actualizar paciente
- `DELETE /api/paciente/{id}` - Eliminar paciente

#### Odontogramas
- `POST /api/crear_odontograma` - Crear odontograma
- `GET /api/listar_odontogramas_paciente/{id}` - Listar odontogramas
- `GET /api/obtener_odontograma/{id}` - Obtener odontograma
- `DELETE /api/eliminar_odontograma/{id}` - Eliminar odontograma

#### Facturas
- `POST /api/crear_factura` - Crear factura
- `GET /api/facturas_paciente/{id}` - Facturas del paciente
- `POST /api/pagar_recibo` - Procesar pago

#### Citas
- `GET /api/citas` - Listar citas
- `POST /api/crear_cita` - Crear cita
- `PUT /api/actualizar_cita/{id}` - Actualizar cita
- `DELETE /api/eliminar_cita/{id}` - Eliminar cita

Para más detalles, consulta la documentación completa de la API.

---

## 📸 Capturas de Pantalla

> _Las capturas de pantalla se agregarán próximamente_

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. 🍴 Haz un Fork del proyecto
2. 🌿 Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push a la rama (`git push origin feature/AmazingFeature`)
5. 🔀 Abre un Pull Request

### Guía de Contribución

- Sigue las convenciones de código existentes
- Añade comentarios donde sea necesario
- Actualiza la documentación si es necesario
- Prueba tus cambios antes de hacer commit

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👤 Contacto

**Edison De Jesus Abreu**

- 👤 GitHub: [@edisondja](https://github.com/edisondja)
- 📧 Email: edisondja@gmail.com
- 🌐 Proyecto: [Kadosh](https://github.com/edisondja/kadosh)

---

## 🙏 Agradecimientos

- A todos los contribuidores que han ayudado a mejorar este proyecto
- A la comunidad de desarrolladores de código abierto
- A todas las clínicas dentales que confían en Kadosh

---

<div align="center">

**Hecho con ❤️ por [Edison De Jesus Abreu](https://github.com/edisondja)**

⭐ Si te gusta este proyecto, ¡dale una estrella!

</div>
