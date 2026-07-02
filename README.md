# Zona Score

Aplicación de gestión logística desarrollada con React Native y Expo. Permite registrar empresas, administrar choferes, crear y asignar entregas, y seguir el avance de cada envío desde la aplicación móvil o web.

## Funcionalidades

- Registro de empresas y administradores.
- Inicio, recuperación y persistencia de sesión con Laravel Sanctum.
- Alta y listado de choferes.
- Creación y asignación de entregas.
- Flujo del chofer: asignada, aceptada, en camino y finalizada.
- Confirmación de entrega mediante el DNI del cliente.
- Validación de email, DNI, CUIT, teléfono y fechas.
- Tema claro, oscuro o sincronizado con el dispositivo.
- Compatibilidad con Android, iOS y web.

## Tecnologías

- React Native 0.81
- Expo SDK 54
- TypeScript
- Expo Router
- React Native Paper
- Redux Toolkit
- Axios
- React Hook Form, Zod
- AsyncStorage
- Laravel Sanctum en el backend

## Requisitos

- Node.js 20 o superior.
- npm.
- Expo Go o un emulador Android/iOS.
- Backend Laravel de ZoneScore instalado y en ejecución.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone git@github.com:LucianoJavierCostaPeralta/TPI-PROG3-FRONT.git
cd TPI-PROG3-FRONT
npm install
```

Crear el archivo de configuración local:

```bash
cp .env.example .env
```

### Preparar el backend

En otra terminal, clonar y configurar la API:

```bash
git clone git@github.com:LucianoJavierCostaPeralta/TPI-PROG3-BACK-API.git
cd TPI-PROG3-BACK-API
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Antes de ejecutar las migraciones se debe configurar la conexión de base de datos en el archivo `.env` de Laravel.

## Conexión con Laravel

La aplicación utiliza la variable `EXPO_PUBLIC_API_URL` para conectarse con la API:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
```

La dirección depende de dónde se ejecute la aplicación:

| Entorno | URL |
| --- | --- |
| Emulador Android | `http://10.0.2.2:8000/api/v1` |
| Simulador iOS | `http://127.0.0.1:8000/api/v1` |
| Navegador web | `http://127.0.0.1:8000/api/v1` |
| Dispositivo físico | `http://IP_LOCAL_DE_LA_PC:8000/api/v1` |

Para un emulador o navegador, iniciar Laravel normalmente:

```bash
php artisan serve
```

Para Expo Go en un dispositivo físico, Laravel debe aceptar conexiones desde la red local:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

El teléfono y la computadora deben estar conectados a la misma red. Después de modificar `.env`, reiniciar Expo limpiando la caché.

## Ejecución

```bash
# Servidor de desarrollo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

Para limpiar la caché:

```bash
npx expo start --clear
```

## Flujo de prueba

1. Registrar una empresa.
2. Iniciar sesión como administrador.
3. Crear un chofer. Su contraseña inicial es `123456`.
4. Crear una entrega indicando el DNI del cliente.
5. Asignar la entrega al chofer.
6. Cerrar la sesión del administrador.
7. Iniciar sesión con el email del chofer.
8. Aceptar la entrega.
9. Iniciar el recorrido.
10. Finalizar la entrega ingresando el DNI correcto del cliente.

Los cambios de estado válidos son:

```text
Pendiente → Asignada → Aceptada → En camino → Finalizada
```

## Arquitectura

El frontend sigue una arquitectura por responsabilidades:

- **Expo Router** define las rutas y la navegación basada en archivos.
- **Screens** coordinan el estado de cada pantalla y los casos de uso.
- **Atomic Design** organiza la interfaz en átomos, moléculas, organismos y templates.
- **Services** encapsula Axios y los contratos de la API Laravel.
- **Redux Toolkit** administra estado global, como las preferencias visuales.
- **AsyncStorage** conserva el token de autenticación y preferencias locales.
- **Utils** centraliza reglas reutilizables, como las validaciones.

### Estructura principal

```text
src/
├── app/              # Rutas de Expo Router
├── assets/           # Imágenes, iconos y recursos
├── components/       # Componentes con Atomic Design
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── screens/          # Pantallas y lógica de presentación
├── services/api/     # Cliente Axios y servicios de Laravel
├── store/            # Redux y providers
├── styles/           # Tema y tokens visuales
└── utils/            # Validaciones compartidas
```

## Autenticación

Laravel devuelve un token Sanctum al iniciar sesión o registrar una empresa. La aplicación lo almacena en AsyncStorage y lo envía automáticamente como token Bearer en cada solicitud protegida.

Al iniciar la aplicación:

- Si existe un token válido, se restaura la sesión.
- Si el token expiró o fue revocado, se elimina y se solicita iniciar sesión nuevamente.
- Al cerrar sesión, el token se revoca en Laravel y se elimina del dispositivo.

## Validaciones

- DNI: exactamente 8 dígitos.
- CUIT: exactamente 11 dígitos.
- Teléfono: entre 8 y 15 dígitos.
- Email: debe incluir usuario y dominio, por ejemplo `example@example.com`.
- Fecha de nacimiento: debe ser anterior al día actual.
- Los campos numéricos descartan caracteres no permitidos.

## Verificación

Comprobar el tipado del proyecto:

```bash
npx tsc --noEmit
```

Comprobar que Laravel está accesible:

```bash
curl http://127.0.0.1:8000/api/health
```

La respuesta esperada incluye `"status": "ok"`.

## Problemas frecuentes

### No se puede conectar con el servidor

- Verificar que Laravel esté ejecutándose.
- No utilizar `127.0.0.1` desde un teléfono físico.
- Utilizar `10.0.2.2` solamente en el emulador Android.
- En un teléfono físico, utilizar la IP local de la computadora.
- Reiniciar Expo después de modificar `.env`.

### Credenciales incorrectas

Este mensaje proviene de Laravel y confirma que la aplicación pudo comunicarse con la API. Verificar el email, la contraseña y que el usuario esté activo.

## Equipo

- Luciano Javier Costa Peralta — administrador del proyecto.
- Daiana Del Grecco — desarrollo.
- Ulises Rudaz — desarrollo.
