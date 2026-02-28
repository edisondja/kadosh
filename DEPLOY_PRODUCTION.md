# Despliegue en producción – Evitar errores de chunks y estilos

## ⚠️ IMPORTANTE (para que carguen estilos y no salga "Unexpected token '<'")

**Tienes que subir TODO el contenido de la carpeta `build/` al MISMO directorio en el servidor.**

- Dentro de ese directorio debe estar: `index.html`, `manifest.json`, y la carpeta **`static/`** (con `static/js/` y `static/css/` dentro).
- **No** pongas `index.html` en un sitio y la carpeta `static` en otro.
- Si la app va en una subcarpeta (ej. `/kadosh/`), mete **todo** lo que hay dentro de `build/` dentro de esa subcarpeta: así tendrás `/kadosh/index.html`, `/kadosh/static/js/...`, `/kadosh/static/css/...`.

Si no haces esto, pueden fallar los estilos o los chunks (error "Unexpected token '<'").

---

## Errores que puedes ver

1. **`Uncaught SyntaxError: Unexpected token '<'`** en `*.chunk.js`  
   El servidor está devolviendo **HTML** (por ejemplo `index.html`) cuando el navegador pide un archivo **.js**. Hay que servir los estáticos reales.

2. **`Manifest: property 'start_url' ignored`**  
   El `manifest.json` debe tener `"start_url": "."` (ya está así en el proyecto) y desplegarse en el mismo origen que la app.

3. **`SES Removing unpermitted intrinsics` (lockdown-install.js)**  
   Viene de una **extensión del navegador** (ej. Lockdown). No es de tu app; se puede ignorar o desactivar la extensión.

---

## Cómo desplegar el build

- Sube **todo el contenido** de la carpeta `build/` (no la carpeta `build` en sí).
- `index.html` y la carpeta `static/` deben estar **en el mismo nivel** (mismo “directorio base”).
- Con `"homepage": "."` los scripts y estilos usan rutas **relativas** (`./static/js/...`, `./static/css/...`), así que la URL base puede ser la raíz (`/`) o una subcarpeta (ej. `/app/`), pero todo el build debe ir junto.

Ejemplo de estructura correcta en el servidor:

```text
tu-dominio.com/
  index.html
  manifest.json
  favicon.ico
  static/
    js/
      main.xxxxx.chunk.js
      2.xxxxx.chunk.js
      ...
    css/
      main.xxxxx.chunk.css
      ...
```

Si la app está en una subcarpeta, por ejemplo `https://midominio.com/kadosh/`:

```text
tu-dominio.com/kadosh/
  index.html
  manifest.json
  static/
    js/
    css/
```

---

## Configuración del servidor

El servidor **no** debe devolver `index.html` para las peticiones a archivos estáticos (`.js`, `.css`, etc.). Primero debe intentar servir el archivo real; solo las rutas de la SPA deben caer en `index.html`.

### Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/donde/esta/el/build;
    index index.html;

    # Servir archivos estáticos (JS, CSS, etc.) directamente
    location /static/ {
        try_files $uri =404;
    }

    # SPA: el resto de rutas devuelven index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Si la app está en una subcarpeta, por ejemplo `/kadosh`:

```nginx
location /kadosh {
    alias /ruta/donde/esta/el/build;
    try_files $uri $uri/ /kadosh/index.html;
}
location /kadosh/static/ {
    alias /ruta/donde/esta/el/build/static/;
}
```

### Apache (.htaccess en la raíz del build)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  # No reescribir peticiones a archivos o carpetas que existen (estáticos)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # El resto, para la SPA
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## Después de cambiar la configuración

1. `npm run build`
2. Subir **todo** el contenido de `build/` al servidor (manteniendo la estructura).
3. Ajustar Nginx/Apache como arriba y recargar el servidor.
4. Probar en una ventana de incógnito (sin extensiones) para no ver el aviso de SES/lockdown.

Con esto se corrigen los errores de **Unexpected token '<'** y el aviso del **manifest** en producción.
