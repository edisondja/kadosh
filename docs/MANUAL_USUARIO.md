# 📘 Manual de Usuario - Odontoed

**Sistema de Gestión para Clínicas Dentales**

---

## Índice

1. [Acceso al sistema](#1-acceso-al-sistema)
2. [Panel principal](#2-panel-principal)
3. [Gestión de pacientes](#3-gestión-de-pacientes)
4. [Citas y agenda](#4-citas-y-agenda)
5. [Odontogramas](#5-odontogramas)
6. [Facturación y pagos](#6-facturación-y-pagos)
7. [Presupuestos](#7-presupuestos)
8. [Doctores y procedimientos](#8-doctores-y-procedimientos)
9. [Contabilidad y finanzas](#9-contabilidad-y-finanzas)
10. [Recetas médicas](#10-recetas-médicas)
11. [Reportes y auditoría](#11-reportes-y-auditoría)
12. [Configuración](#12-configuración)

---

## 1. Acceso al sistema

### Iniciar sesión

1. Abre el navegador y entra a la URL de tu clínica.
2. En la pantalla de **login**, introduce:
   - **Usuario**: tu nombre de usuario o email
   - **Contraseña**: tu contraseña
3. Haz clic en **Iniciar sesión**.
4. Si las credenciales son correctas, se abrirá el panel principal.

### Cerrar sesión

- En el menú lateral, haz clic en **Cerrar sesión** (icono de puerta roja).

---

## 2. Panel principal

El panel principal muestra el **Dashboard** con acceso rápido a todos los módulos.

### Menú lateral

El menú está organizado en secciones:

| Sección | Descripción |
|---------|-------------|
| **Gestión** | Pacientes, doctores, procedimientos, usuarios |
| **Citas** | Notificaciones, administración de citas |
| **Finanzas** | Contabilidad, nómina, punto de venta, salarios |
| **Reportes** | Reportes, auditoría |
| **Sistema** | Configuración, exportar/importar |

### Buscador del menú

- Usa el cuadro **"Buscar en el menú..."** para filtrar las opciones por nombre.

---

## 3. Gestión de pacientes

### Agregar un nuevo paciente

1. Menú → **Agregar Paciente**.
2. Completa los campos obligatorios:
   - Nombre
   - Apellido
   - Cédula
   - Teléfono
   - Fecha de nacimiento
3. Opcional: dirección, sexo, email, etc.
4. Haz clic en **Guardar**.

### Buscar y ver pacientes

1. Desde el **Dashboard** o el menú, accede a la lista de pacientes.
2. Usa la barra de búsqueda para filtrar por nombre, cédula o teléfono.
3. Haz clic en un paciente para ver su **perfil** y:
   - Ficha médica
   - Odontogramas
   - Facturas
   - Presupuestos
   - Citas

### Actualizar datos de un paciente

1. Entra al **perfil del paciente**.
2. Haz clic en **Actualizar** o **Editar paciente**.
3. Modifica los datos necesarios y guarda.

---

## 4. Citas y agenda

### Ver el calendario

1. Menú → **Administración de Citas**.
2. Selecciona un **doctor** en el desplegable superior.
3. El calendario mostrará las citas del doctor seleccionado.
4. Cambia la vista: **Día**, **Semana** o **Mes**.

### Agregar una cita

1. En el calendario:
   - **Opción A**: Haz clic en un espacio vacío para crear una nueva cita.
   - **Opción B**: Haz clic en el botón **Agregar Cita** (después de elegir el doctor).
2. En el modal:
   - **Buscar paciente**: escribe el nombre para buscar o agregar uno nuevo.
   - **Agregar paciente nuevo (no registrado)**: si el paciente aún no está en el sistema, haz clic aquí y completa nombre, apellido, cédula y teléfono para registrarlo al instante.
   - **Hora de inicio** y **Hora de fin**.
   - **Motivo de la cita**:
     - Escribe el motivo manualmente, o
     - Haz clic en **Dictar** y habla el motivo; el texto se transcribirá automáticamente. Haz clic de nuevo en **Detener** para parar.
3. Haz clic en **Guardar**.

### Editar una cita

1. Haz clic sobre la cita en el calendario.
2. Modifica los datos que necesites.
3. Haz clic en **Actualizar**.

### Eliminar una cita

1. Abre la cita haciendo clic sobre ella.
2. Haz clic en **Eliminar** (si está disponible según tu rol).

### Notificaciones

- Menú → **Notificaciones** para ver alertas, cumpleaños y recordatorios.

---

## 5. Odontogramas

### Crear un odontograma

1. Entra al **perfil del paciente**.
2. Ve a la sección de **Odontogramas**.
3. Haz clic en **Crear Odontograma**.
4. Selecciona el tipo:
   - **Adulto**: dentición permanente.
   - **Niño**: dentición temporal (dientes de leche).
5. Haz clic en los dientes para marcar procedimientos:
   - Selecciona la cara del diente (superficie).
   - Elige el procedimiento o color.
6. Guarda el odontograma.

### Ver odontogramas

- En el perfil del paciente, verás la lista de odontogramas.
- Haz clic en uno para ver el detalle.
- Puedes **imprimir** el odontograma.

---

## 6. Facturación y pagos

### Crear una factura

1. En el **perfil del paciente**, ve a **Facturas**.
2. Haz clic en **Agregar Factura**.
3. Selecciona el doctor.
4. Agrega procedimientos:
   - Busca el procedimiento.
   - Indica cantidad y precio si aplica.
5. Revisa el total y haz clic en **Guardar**.

### Pagar una factura

1. Abre la factura.
2. Haz clic en **Pagar**.
3. Selecciona el **método de pago**:
   - Efectivo
   - Tarjeta
   - Transferencia
   - Cheque
   - Mixto
4. Ingresa el monto y confirma.
5. Se emitirá un recibo (con sonido de caja registradora).

### Ver y enviar recibos

- Los recibos se pueden **imprimir** o **enviar por email**.
- En la interfaz de la factura verás las opciones correspondientes.

---

## 7. Presupuestos

### Crear un presupuesto

1. En el perfil del paciente, ve a **Presupuestos**.
2. Haz clic en **Crear Presupuesto**.
3. Agrega procedimientos y cantidades.
4. Guarda el presupuesto.

### Ver y usar un presupuesto

1. Abre el presupuesto desde la lista.
2. Opciones disponibles:
   - **Imprimir**: para imprimir en papel.
   - **WhatsApp**: genera un PDF y lo prepara para enviar por WhatsApp.
   - **Email**: envía el presupuesto por correo electrónico.

> ⚠️ **Nota**: Los presupuestos incluyen el aviso "Presupuesto sujeto a cambios" para informar al cliente que los precios pueden variar.

---

## 8. Doctores y procedimientos

### Agregar doctor

1. Menú → **Agregar Doctor**.
2. Completa nombre, apellido, especialidad y datos de contacto.
3. Guarda.

### Agregar procedimiento

1. Menú → **Agregar Procedimiento**.
2. Nombre del procedimiento y precio.
3. Opcional: asignar ganancias o comisiones.
4. Guarda.

### Especialidades

- Menú → **Especialidades** para gestionar las especialidades de los doctores.

### Asignar ganancias por recibo

- Menú → **Asignar Ganancias por Recibo** para distribuir ingresos entre doctores según recibo.

---

## 9. Contabilidad y finanzas

### Contabilidad

1. Menú → **Contabilidad**.
2. Revisa ingresos, gastos y balance.
3. Registra gastos si es necesario.

### Nómina

- Menú → **Nómina** para gestionar pagos a empleados.

### Punto de venta (POS)

- Menú → **Punto de Venta** para ventas de productos e inventario.

### Salarios de doctores

- Menú → **Salarios Doctores** para ver comisiones y pagos a doctores.

### Historial de pagos

- Menú → **Historial de Pagos** para consultar todos los pagos realizados.

---

## 10. Recetas médicas

### Crear una receta

1. Desde el perfil del paciente o desde el módulo de recetas.
2. Agrega medicamentos, dosis e instrucciones.
3. Guarda.
4. Opciones: **Imprimir** o **Enviar por email**.

---

## 11. Reportes y auditoría

### Generar reportes

1. Menú → **Generar Reportes**.
2. Elige el tipo de reporte y el rango de fechas.
3. Genera el reporte.

### Auditoría

1. Menú → **Auditoría**.
2. Consulta el registro de acciones del sistema.
3. Filtra por módulo, usuario o fecha.

---

## 12. Configuración

### Información de la clínica

1. Menú → **Configuración**.
2. Completa o actualiza:
   - Nombre de la clínica
   - Dirección
   - Teléfono
   - RNC
   - Email
   - Logo
   - Favicon
   - Tipo de factura (comprobante/factura)
   - Clave secreta (para eliminaciones u operaciones críticas)

### Exportar/Importar

- Menú → **Exportar/Importar** para hacer copias de seguridad o migrar datos.

### Administrar Tenants (multi-clínica)

- Si tu instalación es multi-tenant, Menú → **Administrar Tenants** para gestionar clínicas adicionales.

---

## Consejos útiles

| Acción | Consejo |
|--------|---------|
| **Dictado por voz** | Usa Chrome o Edge para el dictado del motivo de la cita. |
| **Registro rápido** | Puedes registrar pacientes nuevos directamente al agendar una cita. |
| **Presupuestos** | Envíalos por WhatsApp o email desde la misma vista del presupuesto. |
| **Buscar en el menú** | Si el menú es largo, usa el buscador para encontrar opciones rápido. |

---

## Soporte

Para soporte técnico o consultas sobre Odontoed, contacta al administrador del sistema o al desarrollador.

---

*Manual de Usuario - Odontoed · Sistema de Gestión Dental*
