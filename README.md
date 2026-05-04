# EcoDelivery Hub — Simulacro de Examen Angular 21

## Contexto
Has sido contratado para rescatar el panel de control de "EcoDelivery", una startup de logística sostenible. El equipo anterior configuró el cascarón del proyecto en Angular 21 usando Standalone Components, pero dejaron la arquitectura acoplada, la seguridad a medias y no aprovecharon las nuevas APIs reactivas (Signals, ```rxResource```, functional guards, etc.).

**Tu misión:** Leer los requerimientos de cada ejercicio, razonar la solución óptima y refactorizar/implementar el código aplicando las mejores prácticas actuales de Angular.

**Credenciales de prueba:**

* **Admin (Gestor):** ```admin@ecodelivery.com``` / ```ADMIN2024```

* **Repartidor:** ```driver@ecodelivery.com``` / ```DRV1234```

---

## Ejercicio 1 — Routing Avanzado y Layouts
Actualmente, el componente de Login y el Dashboard de envíos colisionan en la pantalla porque no hay jerarquía visual.

### 1a — Jerarquía de Layouts
Reestructura el ```app.routes.ts```. Crea dos layouts principales: ```PublicLayoutComponent``` (para el login) y ```PrivateLayoutComponent``` (para el panel de gestión que incluye un header y sidebar). El componente ```DeliveriesListComponent``` debe renderizarse dentro del layout privado.

### 1b — Menú contextual con Signals
El sidebar tiene los enlaces a fuego. Modifícalo para que consuma un servicio ```AuthService``` que exponga una signal ```currentUser()```. Usa la nueva sintaxis de control flow (```@if```, ```@for```) en el template para mostrar el enlace "Gestión de Flota" solo si el usuario tiene el rol ```ADMIN```.

### 1c — Resolvers Funcionales y Redirección
Al acceder a ```/deliveries/detail/:trackingNumber```, la vista parpadea vacía hasta que carga.

Crea un **Functional Resolver** (```deliveryResolver```) que obtenga los datos del envío antes de renderizar la vista. Si el backend devuelve un 404 (el envío no existe), el resolver debe redirigir automáticamente a ```/deliveries``` usando ```Router```.

## Ejercicio 2 — Autenticación e Interceptors Funcionales
La aplicación hace peticiones en texto plano y los usuarios pueden saltarse el login escribiendo la URL.

### 2a — Functional Guards
Implementa un ```authGuard``` y un ```roleGuard``` (basados en funciones, no en clases).

* Protege todas las rutas hijas de /deliveries con el authGuard. Si falla, redirige a /login.

* Protege la ruta ```/fleet``` con el ```roleGuard``` comprobando que sea ADMIN. Si es un repartidor, redirige a ```/deliveries``` (su home).

### 2b — Token Interceptor (Funcional)
Crea un interceptor funcional ```authInterceptor```. Debe interceptar todas las peticiones a la API (rutas que empiecen por ```/api/```) y adjuntar el header ```Authorization: Bearer <token>``` obteniéndolo del ```AuthService```.

### 2c — Global Error Handling
Crea otro interceptor funcional ```errorInterceptor```:

* **401 Unauthorized:** Llama a ```authService.logout()```.

* **403 Forbidden:** Muestra un toast/alerta de "Permisos insuficientes".

* **500 Internal Error:** Registra el error en un servicio de logs.

* Asegúrate de propagar el error (```throwError```) para que los signals o observables que hicieron la petición puedan capturarlo.

## Ejercicio 3 — Arquitectura: Smart/Dumb y Facades
El componente ```features/deliveries/delivery-list.component.ts``` hace peticiones HTTP, filtra arrays mutables y renderiza las tarjetas de envío directamente en su HTML.

### 3a — DeliveryFacade (State Management)
Crea ```core/services/delivery.facade.ts```. Mueve aquí la lógica de negocio:

* Un método para cargar envíos: ```loadDeliveries(status?: string)```.

* Expón una Signal con la lista de envíos: ```deliveries = signal<Delivery[]>([])```.

* Expón dos Signals computadas (```computed```): ```pendingDeliveriesCount``` y ```completedDeliveriesCount```.

### 3b — DeliveryCardComponent (Dumb Component)
Crea el componente ```delivery-card```.

* Debe recibir la información usando la nueva API: ```delivery = input.required<Delivery>()```.

* Debe emitir eventos de clic usando la nueva API: ```statusChanged = output<string>()```.

* Prohibido inyectar servicios o el Router en este componente.

### 3c — Limpieza del Smart Component
Refactoriza el ```delivery-list.component.ts``` para que solo inyecte el Facade. Usa un ```@for``` en el template iterando sobre la signal del Facade e instanciando el ```<app-delivery-card>```.

## Ejercicio 4 — Reactividad Moderna (RxJS + Signals)
Queremos aprovechar al máximo la interoperabilidad en la vista de Alertas Meteorológicas.

### 4a — Uso de ```rxResource``` (o ```resource```)
En el componente de Alertas, en lugar de usar ```ngOnInit``` para hacer el ```subscribe``` al HTTP, implementa la carga de datos usando ```rxResource``` (introducido recientemente para manejar peticiones asíncronas de forma nativa con Signals).
El recurso debe recargarse automáticamente si cambia una signal de filtrado local (```selectedRegion```).

### 4b — Flujo sin Subscriptions
Busca en la aplicación un componente (crea uno de búsqueda en tiempo real, por ejemplo ```DeliverySearchComponent```) donde el usuario teclee un ID. Usa un ```FormControl```, extrae sus ```valueChanges```, aplica ```debounceTime(300)```, ```distncitUntilChanged()``` y ```switchMap``` a la API. Finalmente, usa ```toSignal()``` para consumirlo en el template sin usar el pipe ```async``` ni suscripciones manuales.

## Ejercicio 5 — Formularios Reactivos Avanzados
El formulario de "Asignación de Vehículo" (```assign-vehicle.component.ts```) es un ```FormGroup``` sin validaciones.

### 5a — Validadores Estándar y Estado
Añade ```Validators.required``` y Vali```dators.min(10)``` (para peso). Usa una Signal para exponer el estado de validez general del formulario sin tener que llamar a ```form.valid``` en el template constantemente (ej: usando ```toSignal(form.statusChanges)```).

### 5b — Custom Sync Validator (Validación Cruzada)
Crea una función validadora ```capacityValidator```. Debe aplicarse a nivel de ```FormGroup```. Comprueba que el valor del campo estimatedWeight no supere el valor del campo ```vehicleMaxCapacity```. Si lo supera, devuelve el error ```{ overCapacity: true }```.

### 5c — Async Validator
Crea un validador asíncrono ```vehicleExistsValidator(fleetService)```. Al escribir la matrícula en el campo ```plateNumber```, debe consultar a la API si el vehículo está registrado.

Añade un debounce nativo al control o en el validador para evitar spam a la API.

Si la API da error 404, el validador devuelve ```{ vehicleNotFound: true }```.

## EXTRA (Bonus) — Directivas y Pipes
**Extra A:** Crea un pipe standalone ```DistancePipe``` que reciba un número (en metros) y lo transforme a kilómetros formateados (ej: ```1500``` -> ```1.5 km```). Aplícalo en la vista de detalle.

**Extra B:** Crea una directiva ```appStatusColor``` que reciba por ```input()``` el estado del envío ('PENDING', 'IN_TRANSIT', 'DELIVERED') y modifique el ```HostBinding``` de la clase o el estilo para poner un borde o fondo de color distinto automáticamente.
