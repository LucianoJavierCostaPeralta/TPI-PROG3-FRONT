# Configuración SMTP para Supabase

Este archivo describe cómo configurar el envío de correos de confirmación usando Gmail.

## Pasos para generar una App Password en Gmail

1. Activa la verificación en dos pasos en tu cuenta de Google.
2. Ingresa a tu cuenta de Google y ve a "Seguridad".
3. Busca "Contraseñas de aplicaciones" y crea una nueva contraseña de aplicación para "Mail".
4. Copia la contraseña de 16 caracteres generada.
5. Reemplaza `TU_CORREO_GMAIL` y `TU_APP_PASSWORD_DE_GMAIL` en `supabase/config/email.json`.

## Ejemplo de configuración

```json
{
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "tu_correo@gmail.com",
      "pass": "tu_app_password_de_gmail"
    }
  }
}
```

## Nota

- `secure: false` es correcto para el puerto 587 con STARTTLS.
- Asegúrate de que Supabase lea este archivo desde `supabase/config/email.json`.
- Si usas credenciales reales, no subas este archivo a un repositorio público.
