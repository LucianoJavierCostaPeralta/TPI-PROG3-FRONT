# ZoneScore - Guía de incorporación para nuevos desarrolladores

Este documento resume el proyecto tal como está hoy. La idea es que puedas entrar al repo, entender qué hace cada capa y saber dónde tocar sin romper el resto.

Si hay dudas entre este documento y `ARCHITECTURE.md`, tomá este archivo como referencia más actual.

## 1. Qué es la app

ZoneScore es una aplicación de gestión logística con React Native + Expo. El producto cubre tres roles:

- Administrador: maneja choferes, entregas, mapa, métricas y notificaciones.
- Chofer: ve sus pedidos, controla el viaje y confirma entregas.
- Asesor: recibe y gestiona solicitudes de contacto.

La app consume una API Laravel, persiste sesión con token, usa Redux para el tema global y organiza la UI con Atomic Design.

## 2. Stack real del proyecto

- React Native 0.81
- Expo SDK 54
- Expo Router
- TypeScript
- React Native Paper
- Redux Toolkit
- Axios
- AsyncStorage
- React Native Maps
- Expo Image Picker
- OSRM para trazar rutas reales

## 3. Cómo arranca la aplicación

El punto de entrada es `src/app/index.tsx`:

1. Se muestra el splash.
2. Se verifica si existe sesión guardada.
3. Si el token existe, se pide el perfil al backend.
4. Si el perfil responde bien, se va a `/home`.
5. Si no hay sesión válida, se deriva a `/onboarding1`.

Providers globales:

- `src/app/_layout.tsx` monta `SafeAreaProvider` y `AppProviders`.
- `src/store/AppProviders.tsx` envuelve la app con Redux y `PaperProvider`.
- El tema de React Native Paper se resuelve según el modo guardado en Redux + AsyncStorage.

## 4. Rutas y navegación

La app usa Expo Router con route groups invisibles.

### Auth group

`src/app/(auth)/_layout.tsx`

- `onboarding1`
- `onboarding2`
- `login`
- `register`
- `reset-password`

### Main group

`src/app/(main)/_layout.tsx`

- `home`
- `contactar-asesor`
- `configuracion`
- `perfil`
- `editar-perfil`
- `legal`

### Flujo básico

- Splash -> onboarding -> login -> home.
- Desde `home` se navega a perfil, edición de perfil, legal, contacto o configuración según el rol y la acción.

## 5. Estructura de carpetas

```text
src/
├── app/              # Rutas de Expo Router
├── assets/           # Fuentes, imágenes, SVG
├── components/       # Atomic Design
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── constants/        # Constantes de dominio y colores compartidos
├── hooks/            # Estado y acciones por caso de uso
├── screens/          # Pantallas orquestadoras
├── services/         # Cliente API y servicios externos
├── store/            # Redux y providers
├── styles/           # Theme, tokens, espaciados, colores
├── types/            # Contratos del dominio y helpers
└── utils/            # Normalización, validación y transformaciones
```

## 6. Capas del frontend

### Screens

Las screens coordinan la lógica de pantalla y reciben datos/herramientas desde hooks.

Ejemplos:

- `LoginScreen`
- `HomeScreen`
- `EditarPerfilScreen`
- `ConfiguracionScreen`
- `PerfilScreen`

### Templates

Los templates definen la estructura visual de una pantalla completa.

Ejemplos:

- `ScreenLayout`
- `SplashTemplate`
- `LoginTemplate`
- `RegisterTemplate`
- `EditarPerfilTemplate`

### Organisms

Contienen secciones completas de negocio y UI.

Ejemplos:

- `AdminHomePanel`
- `DriverHomePanel`
- `DriversPanel`
- `DeliveriesPanel`
- `DeliveryDetailPanel`
- `MapPanel`
- `NotificationsPanel`
- `ResumenGeneral`

### Molecules

Componentes reutilizables de tamaño medio.

Ejemplos:

- `DateField`
- `SectionCard`
- `InfoCard`
- `AppTopBar`
- `BottomTabMenu`
- `LoginForm`

### Atoms

Bloques base.

Ejemplos:

- `CTAButton`
- `TextInputField`
- `Checkbox`
- `UserAvatar`
- `EmptyState`
- `MarkerNode`

## 7. Estado global y data flow

### Redux

El store hoy es chico:

- `temaSlice` guarda el modo de tema (`sistema`, `claro`, `oscuro`).
- El valor resuelto se persiste en AsyncStorage.
- `PaperProvider` recibe el theme final desde `src/styles/theme.ts`.

### Workspace local

La mayor parte del estado de negocio vive en hooks, no en Redux.

- `useWorkspaceData` carga perfil + datos según rol.
- `useDashboardState` agrupa formularios, selección y flags de UI.
- `useHomeDashboard` compone todos los hooks del panel principal.

## 8. Servicios API

El cliente está en `src/services/api/client.ts`.

### Configuración

- Usa `EXPO_PUBLIC_API_URL` si existe.
- Si no existe, usa `10.0.2.2` en Android o `127.0.0.1` en iOS/web.
- Inserta automáticamente el token Bearer desde AsyncStorage.
- Convierte errores de Laravel a mensajes legibles con `getApiErrorMessage`.

### Auth service

`src/services/api/auth.ts`

- `login(email, password)` -> `/login`
- `register(payload)` -> `/registro`
- `recoverPassword(email)` -> `/recuperar-password`
- `getProfile()` -> `/profile`
- `updateProfile(userId, role, payload)` -> `/users/:id` o `/admin/choferes/:id`
- `logout()` -> `/logout`
- `clearSession()` elimina el token local

### Drivers service

`src/services/api/drivers.ts`

- `listDrivers()` -> `/admin/choferes`
- `createDriver()` -> `/admin/choferes`
- `deleteDriver()` -> `/admin/choferes/:id`

### Admin deliveries service

`src/services/api/adminDeliveries.ts`

- `listAdminDeliveries()` -> `/admin/entregas`
- `createDelivery()` -> `/admin/entregas`
- `updateDelivery()` -> `/admin/entregas/:id`
- `deleteDelivery()` -> `/admin/entregas/:id`
- `assignDriver()` -> `/admin/entregas/:id/assign`

### Driver deliveries service

`src/services/api/driverDeliveries.ts`

- `listDriverDeliveries()` -> `/chofer/entregas`
- `acceptDelivery()` -> `/chofer/entregas/:id/accept`
- `updateDeliveryState()` -> `/chofer/entregas/:id/state`

### Advisor service

- `enviarSolicitudAsesoramiento(mensaje)` -> `/solicitudes-asesoramiento`

### OSRM

- `fetchStreetRoute(coordinates)` usa el servicio público de OSRM.
- La URL base quedó en `src/constants/osrm.ts`.

## 9. Modelos de dominio

Los tipos centrales están en `src/types/workspace.ts`.

### Roles

- `administrador`
- `asesor`
- `chofer`

### Entidades principales

- `Company`
- `UserProfile`
- `Driver`
- `DeliveryOrder`
- `AppNotification`
- `AppWorkspace`

### Estados de entrega

`ORDER_STATUS` es la referencia interna:

- `PENDING = 1`
- `ASSIGNED = 2`
- `ACCEPTED = 3`
- `ON_THE_WAY = 4`
- `DELIVERED = 5`
- `FINISHED = 6`
- `CANCELLED = 7`

### Helpers importantes

- `getOrderField`
- `getOrderDestination`
- `getOrderProducts`
- `parseDeliveryFormDate`
- `formatDateForInput`
- `normalizeOrderStatus`
- `getBackendStatusLabel`

## 10. Flujos principales

### Arranque de la app

1. `src/app/index.tsx` muestra el splash inicial.
2. Cuando termina la animación, se llama a `hasStoredSession()`.
3. Si no hay token guardado, la app va a `/onboarding1`.
4. Si hay token, se llama a `getProfile()` para validar que la sesión siga viva.
5. Si el perfil responde bien, la app reemplaza la ruta por `/home`.
6. Si el backend rechaza el token, se ejecuta `clearSession()` y se vuelve a onboarding.

### Onboarding

1. `onboarding1` presenta el valor de la gestión de entregas.
2. `onboarding2` refuerza rutas optimizadas y monitoreo de conductores.
3. Desde la primera pantalla se puede saltar directo a `/login`.
4. Desde la segunda pantalla se avanza a `/login` con `router.replace`, sin dejar el onboarding en el historial.

### Login

1. El usuario entra a `/login`.
2. `LoginForm` controla correo y contraseña en estado local.
3. Antes de enviar, valida que ambos campos existan y que el correo tenga formato válido.
4. `LoginScreen` normaliza el email con `trim().toLowerCase()`.
5. `login(email, password)` llama a `POST /login`.
6. Si la respuesta es correcta, la API devuelve `user` y `token`.
7. El token se guarda en AsyncStorage con la clave `zonescore:auth-token`.
8. El navegador se redirige a `HomeScreen` con `navigation.reset`, para que el login no quede en el stack.
9. Si el backend responde con error, `getApiErrorMessage()` transforma el mensaje para mostrarlo en pantalla.
10. Si el usuario toca "Olvidé mi contraseña", la misma pantalla habilita el formulario de recuperación sin salir del login.

### Recuperación de contraseña

1. El usuario abre el formulario de recuperación desde `LoginForm`.
2. La app valida que el correo no esté vacío y que sea un email válido.
3. `recoverPassword(email)` llama a `POST /recuperar-password`.
4. Si el backend responde bien, se muestra un `Alert` con el mensaje devuelto.
5. Luego se limpia el formulario y se oculta el bloque de recuperación.

### Register

1. El usuario entra a `/register` desde la pantalla de login.
2. `RegisterContent` administra el formulario con React Hook Form + Zod.
3. Se validan nombre de empresa, CUIT, email, contraseña, teléfono, tamaño de flota y aceptación de términos.
4. Al enviar, `RegisterScreen` normaliza los campos y llama a `register()`.
5. `register()` hace `POST /registro` y recibe `user` + `token`.
6. El token se persiste en AsyncStorage igual que en login.
7. La navegación se resetea hacia `HomeScreen`, por lo que la empresa queda logueada al terminar el alta.
8. Si hay error de validación o del backend, se muestra en la misma vista.

### Logout

1. `logout()` intenta avisar al backend con `POST /logout`.
2. Tanto si el backend responde bien como si falla, el token local se borra.
3. La sesión queda inválida en el dispositivo y la próxima apertura vuelve a validar desde `index.tsx`.

### Administrador

- Ve métricas y alertas en home.
- Crea, edita y elimina choferes.
- Crea y asigna entregas.
- Consulta mapa general y detalle de pedidos.
- Revisa notificaciones.
- Edita su perfil.

### CRUD de choferes

1. El administrador abre el panel de choferes desde el home.
2. El formulario usa `DriverForm` con nombre, email, teléfono, DNI y fecha de nacimiento.
3. Antes de enviar, `validateDriverForm()` obliga a completar nombre, documento, email, teléfono y fecha.
4. `handleCreateDriver()` normaliza los campos y llama a `createDriver()`.
5. `createDriver()` hace `POST /admin/choferes`.
6. El backend crea el usuario chofer con contraseña inicial fija `123456`.
7. Si la creación sale bien, se limpia el formulario, se cierra el panel y se recarga el workspace.
8. Si ocurre un error, se muestra `getApiErrorMessage()` en pantalla.
9. Para borrar un chofer, `handleDeleteDriver()` llama a `DELETE /admin/choferes/:id`.
10. Si el backend responde bien, el chofer se quita del estado local y se muestra un alert de éxito.

### CRUD de entregas

1. El administrador abre el panel de entregas.
2. `DeliveryForm` junta cliente, DNI, productos, destino, referencia, observaciones, fecha y chofer opcional.
3. `validateDeliveryForm()` revisa los campos obligatorios antes de enviar.
4. `handleCreateDelivery()` llama a `createDelivery()` con los datos normalizados.
5. `createDelivery()` hace `POST /admin/entregas`.
6. Si se eligió un chofer en el formulario, después de crear la entrega se llama a `assignDriver()`.
7. `assignDriver()` hace `PATCH /admin/entregas/:id/assign`.
8. Luego se resetea el formulario, se cierra el panel y se recarga el workspace.
9. Para editar una entrega, `startEditingDelivery()` precarga el formulario con `deliveryToForm()`.
10. `handleEditDelivery()` valida otra vez, compara el chofer actual con el nuevo y, si cambió, vuelve a asignarlo.
11. La edición actualiza el pedido en memoria, cierra el modo edición, reinicia el formulario y fuerza una recarga del workspace.
12. El cambio de chofer también puede hacerse sin editar toda la entrega, desde el selector del panel o desde el detalle.

### Flujo de estado de una entrega

1. El chofer recibe una entrega asignada o acepta una existente.
2. `handleUpdateOrderStatus()` bloquea iniciar una nueva entrega si ya tiene una activa en `accepted` o `on the way`.
3. `acceptDelivery()` llama a `PATCH /chofer/entregas/:id/accept`.
4. `updateDeliveryState()` llama a `PATCH /chofer/entregas/:id/state`.
5. Para pasar a "en camino", se envía `estado_id = 4`.
6. Para finalizar, se envía `estado_id = 5` y puede ir `cliente_dni` para validar la entrega.
7. Para cancelar desde la UI local, se marca la orden como cancelada en AsyncStorage y en el estado del workspace.
8. Cada cambio de estado puede generar una notificación local con `createStatusNotification()`.
9. Después de cada acción, la app recarga el workspace para reflejar el nuevo estado desde backend.

### Chofer

- Ve su recorrido y la próxima parada.
- Puede aceptar una entrega asignada.
- Puede pasarla a “en camino”.
- Puede finalizarla ingresando el DNI del cliente.
- Puede cancelar la entrega si el flujo lo permite.

### Asesor

- Usa el módulo de contacto para recibir una solicitud.
- Hoy el flujo es principalmente UI + POST a backend.

## 11. Hooks que importan de verdad

### `useWorkspaceData`

- Carga perfil actual.
- Resuelve el rol.
- Pide datos de choferes o entregas según rol.
- Inicializa notificaciones locales.
- Expone `loadWorkspace`, `handleMarkAsRead`, `handleMarkAllAsRead`.

### `useHomeDashboard`

- Une estado local + workspace + acciones.
- Gestiona alta/edición de choferes y entregas.
- Coordina actualizaciones de estado de pedidos.
- Maneja el logout y la navegación interna del dashboard.

### `useEditProfile`

- Carga perfil.
- Maneja selección de imagen.
- Valida campos y guarda cambios.
- Soporta fecha de nacimiento para choferes.

### `useMapPanel`

- Filtra pedidos visibles por rol y chofer seleccionado.
- Calcula coordenadas del mapa.
- Pide ruta a OSRM.
- Maneja selección de chofer y pedido.

### `useDeliveryActions`

- Crear entrega.
- Editar entrega.
- Asignar chofer.
- Toggle/cancel de formularios.

### `useOrderStatusActions`

- Aceptar pedido.
- Pasar a “en camino”.
- Marcar entregado.
- Cancelar.
- Generar notificación de estado.

### `useDriverActions`

- Crear chofer.
- Eliminar chofer.
- Actualizar estado local del workspace.

## 12. Validaciones que ya existen

Archivo base: `src/utils/validation.ts`

- Email: formato estándar.
- DNI: exactamente 8 dígitos.
- CUIT: exactamente 11 dígitos.
- Teléfono: entre 8 y 15 dígitos.
- Fecha: debe ser pasada.

Validaciones de formularios:

- `validateDriverForm`
- `validateDeliveryForm`
- `validateEditProfileForm`

## 13. Sistema visual

### Theme

- `src/styles/theme.ts` centraliza theme, spacing, radios y dimensiones.
- `src/constants/colors.ts` centraliza colores base, avatar random y colores de estado.
- `AppProviders` resuelve el theme según el modo guardado.

### Reglas prácticas

- Usar `theme.colors.*` en componentes visuales.
- Usar `constants/colors.ts` para colores de dominio o listas determinísticas.
- Evitar colores inline salvo casos muy puntuales.
- Mantener los componentes compartidos en Atomic Design.

## 14. Persistencia local

Claves importantes:

- `zonescore:auth-token` -> token de sesión.
- `zonescore:tema` -> modo de tema.
- `zonescore:cancelled_orders` -> pedidos cancelados localmente.

También hay persistencia local para la foto de perfil mediante `src/services/profileImage.ts`.

## 15. Dónde tocar cada cambio

### Cambiar autenticación

- `src/services/api/auth.ts`
- `src/services/api/client.ts`
- `src/app/index.tsx`
- `src/store/AppProviders.tsx`

### Cambiar el home del administrador o chofer

- `src/hooks/dashboard/useHomeDashboard.ts`
- `src/utils/dashboard/homeDashboard.ts`
- `src/components/organisms/home/*`
- `src/components/templates/HomeTemplate.tsx`

### Cambiar entregas

- `src/services/api/adminDeliveries.ts`
- `src/services/api/driverDeliveries.ts`
- `src/hooks/deliveries/*`
- `src/utils/orders/*`
- `src/components/organisms/DeliveriesPanel.tsx`
- `src/components/organisms/DeliveryDetailPanel.tsx`
- `src/components/organisms/DeliveryEditPanel.tsx`

### Cambiar choferes

- `src/services/api/drivers.ts`
- `src/hooks/drivers/useDriverActions.ts`
- `src/components/organisms/DriversPanel.tsx`
- `src/components/organisms/DriverDetailPanel.tsx`

### Cambiar mapa

- `src/hooks/map/useMapPanel.ts`
- `src/utils/map/mapPanel.ts`
- `src/services/osrm.ts`
- `src/components/organisms/MapPanel.tsx`

### Cambiar perfil

- `src/hooks/profile/useEditProfile.ts`
- `src/utils/profile/editProfile.ts`
- `src/components/templates/EditarPerfilTemplate.tsx`
- `src/screens/EditarPerfilScreen.tsx`

### Cambiar tema o tokens visuales

- `src/styles/theme.ts`
- `src/constants/colors.ts`
- `src/store/slices/temaSlice.ts`

## 16. Comandos útiles

```bash
npm start
npm run android
npm run ios
npm run web
npx tsc --noEmit
npx expo start --clear
```

## 17. Problemas típicos

- Si cambia `.env`, reiniciá Expo.
- En Android emulador la API local usa `10.0.2.2`.
- En iOS simulador y web, `127.0.0.1`.
- En dispositivo físico, usá la IP LAN de la máquina.
- Si el token falla, la app limpia la sesión y vuelve a onboarding/login.
- OSRM es un servicio externo; si cae o responde lento, el mapa debe seguir funcionando con fallback de coordenadas locales.

## 18. Prioridades de mantenimiento

Si vas a seguir ordenando el proyecto, el orden razonable es:

1. Mantener `theme.colors` para UI visual.
2. Mantener `constants/colors.ts` para colores de dominio y listas determinísticas.
3. Mantener lógica de negocio en hooks y utils, no en screens.
4. Mantener los services como única capa que habla con backend.
5. Evitar mezclar navegación, estado y render en un mismo archivo si crece demasiado.

## 19. Lectura recomendada para empezar hoy

1. `src/app/index.tsx`
2. `src/store/AppProviders.tsx`
3. `src/styles/theme.ts`
4. `src/types/workspace.ts`
5. `src/services/api/client.ts`
6. `src/utils/dashboard/homeDashboard.ts`
7. `src/hooks/dashboard/useHomeDashboard.ts`
8. `src/components/templates/HomeTemplate.tsx`

Ese orden te da el mapa mental completo del proyecto sin perderte en detalles prematuros.
