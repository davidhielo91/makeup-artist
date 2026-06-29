# CLAUDE.md — Sitio web de Renata Belmonte · Makeup Artist

Archivo de contexto del proyecto. Contiene los datos del negocio, el stack
técnico y las reglas que se deben seguir al desarrollar. Léelo antes de generar
o modificar código.

---

## 1. Datos de la maquillista

| Campo | Valor |
|---|---|
| Nombre profesional | Renata Belmonte Cárdenas |
| Nombre comercial | Renata Belmonte · Makeup Artist |
| Teléfono / WhatsApp | +52 656 218 4490 |
| Correo | hola@renatabelmonte.mx |
| Sitio web | www.renatabelmonte.mx |
| Instagram | @renata.mua |

**Bio (alimenta la página "Sobre mí"):**

> Soy Renata, maquillista profesional certificada con más de 8 años
> transformando rostros para los días más importantes. Mi especialidad es el
> maquillaje de novia y de evento: ese acabado natural y luminoso que aguanta
> de la mañana a la madrugada sin retoques constantes.
>
> Me formé en el Colegio de Imagen y Estética de Guadalajara y me he certificado
> en técnicas de aerografía y en maquillaje para alta definición (HD), porque hoy
> todo queda registrado en foto y video. Trabajo con productos profesionales de
> larga duración y libres de crueldad animal, y cuido cada piel como si fuera la mía.
>
> Creo que maquillarse no es taparse, es sentirse uno mismo en su mejor versión.
> Por eso cada cita empieza con una breve plática para entender qué buscas, tu
> estilo y la ocasión. No me gusta el maquillaje genérico: me gusta el tuyo.

**Datos rápidos (badges para "Sobre mí"):**
- +8 años de experiencia
- +500 novias maquilladas
- Certificada en HD y aerografía
- Productos cruelty-free y de larga duración
- Atención en estudio y a domicilio

---

## 2. Información del negocio

| Campo | Valor |
|---|---|
| Ubicación | Estudio en Av. de las Torres 1450, Col. Campestre, Ciudad Juárez, Chih. |
| Servicio a domicilio | Sí, dentro de la ciudad (+$300; fuera se cotiza) |
| Horario | Mar–Sáb 9:00–19:00 · Dom solo eventos con reserva previa · Lun cerrado |
| Moneda | Peso mexicano (MXN) |
| Pago | Efectivo o transferencia el día del servicio (NO hay pago en línea) |

### Servicios (seed de la tabla `services`)

| Servicio | Descripción | Duración (min) | Precio (MXN) |
|---|---|---|---|
| Maquillaje Social / Evento | Fiestas, graduaciones, sesiones de foto. Natural o glam. | 60 | 750 |
| Maquillaje de Novia | Incluye prueba previa, día del evento, pestañas y retoque de labios. | 120 | 3500 |
| Prueba de Novia (suelta) | Ensayo de look. Se descuenta si contrata el paquete completo. | 90 | 900 |
| Maquillaje de Dama / Cortejo | Mamá de la novia, madrinas, damas de honor. | 60 | 850 |
| Maquillaje de Quinceañera | Look fresco y juvenil, apropiado para la edad. | 75 | 1200 |
| Maquillaje Express | Versión rápida para sesión corta o último minuto. | 40 | 550 |
| Peinado (add-on) | Se agrega a cualquier servicio de maquillaje. | 45 | 600 |
| Curso / Clase personalizada | Sesión 1 a 1 con materiales. | 150 | 1500 |

**Notas de precios (mostrar en la web):**
- Servicio a domicilio: +$300 dentro de la ciudad (fuera, se cotiza).
- Grupos de 4+ personas para un mismo evento: cotización directa.
- El monto final se confirma al reservar según complejidad del look.

### Políticas de cancelación y reservas

**Reservas**
- Toda cita se confirma por correo y WhatsApp una vez aprobada.
- Maquillaje de novia requiere prueba previa antes de apartar la fecha del evento.

**Anticipo y pago**
- Pago en efectivo o transferencia el día del servicio (no hay pago en línea).
- Bodas y eventos grandes: anticipo del 30% por transferencia para apartar fecha;
  el resto se liquida el día del evento.

**Cancelaciones**
- Más de 72 h de anticipación: sin costo (anticipo reembolsable o se reagenda).
- Entre 72 y 24 h: anticipo no reembolsable, usable para reagendar una vez.
- Menos de 24 h o no-show: se pierde el anticipo completo.

**Reagendar**
- Sin costo una vez, avisando con al menos 48 h. Cambios posteriores sujetos a
  disponibilidad.

**Puntualidad**
- Tolerancia de 15 min. Después, el servicio puede acortarse o reagendarse
  conservando el costo, para no afectar a la siguiente clienta.

**Higiene y salud**
- Material desinfectado entre clientas. La clienta debe avisar alergias,
  condiciones de piel o infección ocular activa antes de la cita.

---

## 3. Información general del proyecto

**Qué es:** sitio web profesional para una maquillista independiente, con
catálogo de servicios, portafolio visual y sistema de reservas por internet
**sin pago en línea** (el pago se hace en el sitio/día del servicio).

**Objetivo:** pieza de portafolio full-stack. Debe verse pulida y estar bien
terminada; la calidad del flujo de reserva y la UI es lo que evalúa un reclutador.

**Modelo de negocio:** una sola maquillista (no es un salón). Sin embargo, la
base de datos se modela pensando en escalar a varias: la profesional es una fila
en una tabla, NO una constante hardcodeada. Así "escalar a salón" = agregar tabla
`staff` + foreign key, sin reescribir la arquitectura.

**Problemas que resuelve (sección clave del README):**
- Reservas con slots reales → eliminan el ir y venir por DM y el doble-booking.
- Catálogo con precios y duración → eliminan las preguntas repetidas.
- Correos de confirmación y recordatorio → reducen el no-show.
- Portafolio propio bien presentado → resuelve la imagen "amateur" de solo Instagram.
- Campos en el formulario (tipo de evento, alergias, referencias) → la maquillista
  llega preparada.
- Disponible 24/7 → la clienta reserva cuando quiera.

**Tipo de reserva:** slots en tiempo real. El cliente solo ve horarios realmente
disponibles, calculados a partir del horario de trabajo menos las citas tomadas y
la duración del servicio. La hora de fin se calcula con la duración, no la elige
el cliente.

### Modelo de datos (orientación)

- `services` — id, nombre, descripción, duración (min), precio, categoría, imagen, activo
- `bookings` — id, service_id, nombre, email, teléfono, starts_at, ends_at,
  estado (`pending`/`confirmed`/`cancelled`/`completed`), notas, tipo de evento,
  alergias, referencias
- `availability` — horario semanal (día, hora apertura, hora cierre)
- `blocked_dates` — vacaciones o días bloqueados manualmente
- (futuro) `staff` — para escalar a salón

**Panel de administración:** la maquillista (autenticada con Supabase Auth) debe
poder ver, confirmar y cancelar citas, bloquear fechas y editar el catálogo. Es la
mitad del trabajo real; no omitirlo.

---

## 4. Stack y reglas a seguir

### Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Estilos | Tailwind CSS |
| Componentes UI | shadcn/ui |
| Base de datos, Auth y Storage | Supabase (Postgres) |
| Almacenamiento de imágenes | Supabase Storage (portafolio de looks + imágenes de servicios) |
| Correos transaccionales | Resend |
| Hosting / Deploy | Vercel |
| Calendario / fechas | react-day-picker (incluido con shadcn/ui) |

### Reglas de desarrollo

**Arquitectura**
1. App Router de Next.js. Catálogo y portafolio deben renderizarse del lado
   servidor (SSR/SSG) por SEO.
2. La maquillista NO se hardcodea: vive como fila en BD para permitir escalar.
3. Separar zona pública (catálogo, portafolio, reserva) de zona admin (protegida
   por auth).

**Reservas y disponibilidad**
4. La hora de fin de una cita se calcula con la duración del servicio, nunca la
   elige el cliente.
5. **Evitar doble reserva a nivel de base de datos** con exclusion constraint
   (no solo validación en el cliente):
   ```sql
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   ALTER TABLE bookings ADD CONSTRAINT no_overlap
   EXCLUDE USING gist ( tsrange(starts_at, ends_at) WITH && )
   WHERE (status IN ('pending', 'confirmed'));
   ```

**Seguridad (Row Level Security) — configurar desde el inicio, no al final**
6. Cualquiera puede leer `services` activos.
7. Cualquiera puede INSERTAR en `bookings`, pero NO leer las reservas de otros.
8. Solo la maquillista autenticada puede leer todas las reservas, gestionarlas y
   editar servicios.
9. Sin RLS, la anon key expondría los datos de todos los clientes. No dejarlo pasar.

**Pagos**
10. NO hay pago en línea. El pago es en sitio (efectivo/transferencia).
11. Defensa contra no-show: anticipo del 30% por transferencia para bodas/eventos
    grandes + recordatorios por correo. Reflejarlo en políticas y correos.

**Correos (Resend)** — mínimo tres:
12. Confirmación al cliente.
13. Aviso de nueva reserva a la maquillista.
14. Recordatorio antes de la cita.

**Mercado local (Juárez / México)**
15. Incluir botón / enlace de WhatsApp (`wa.me`) para confirmar o resumir la cita.
    Muchos negocios pequeños operan por WhatsApp; suma realismo al proyecto.

**Deploy (Vercel)**
16. Variables de entorno (Supabase URL/keys, Resend API key) en el dashboard de
    Vercel, nunca commiteadas.
17. La `SUPABASE_SERVICE_ROLE_KEY` solo se usa del lado servidor (Server Actions /
    Route Handlers), jamás expuesta al cliente.
18. Usar la integración oficial Vercel ↔ Supabase para sincronizar entornos.

**Contenido**
19. Todos los textos visibles en español (mercado mexicano). Precios en MXN.
20. Storage guarda portafolio de looks/trabajos e imágenes de cada servicio
    (no "tatuajes" — eso era de otro proyecto).

---

## 5. Sistema de diseño (dirección visual)

Estilo objetivo: **editorial elegante** tipo revista de belleza (no salón
comercial). Lo que da la sensación "cara" es el espacio en blanco, la tipografía
serif de alto contraste y un único color de acento usado con mucha mesura sobre
fondo crema. Inspirado en un template de referencia, NO copiarlo: ver reglas de
diferenciación abajo.

### Principios

- Mucho aire entre secciones; layout aireado y ligeramente asimétrico.
- La tipografía manda: titulares serif grandes y finos + cuerpo sans neutro.
- Un solo color de acento saturado, usado con disciplina (CTA, precios, detalles).
- Fondo crema cálido constante; nunca blanco puro. Footer casi negro para cerrar.
- La fotografía editorial de belleza es parte del diseño: cálida, primeros planos.

### Paleta de color

El acento NO es el vermellón del template (para no clonarlo). Acento propio de
Renata: **terracota / rosa-arcilla**. Mismo principio: un solo acento sobre crema.

| Token | Hex | Uso |
|---|---|---|
| `cream` (fondo) | `#F4F0E9` | Fondo principal, cálido. Nunca blanco puro. |
| `accent` | `#C2603F` | Terracota. CTA, precios, detalles, ✦, barras. Con mesura. |
| `accent-hover` | `#A84F32` | Estado hover del acento. |
| `ink` (texto) | `#1A1A1A` | Texto principal carbón. |
| `footer` | `#0E0E0E` | Fondo del footer, casi negro. |
| `muted` | `#6B6B6B` | Texto secundario / descripciones. |
| `line` | `#E0DAD0` | Bordes finos, líneas guía, divisores. |

Ambiente: manchas degradadas suaves y difuminadas (durazno, coral, amarillo
pálido) regadas por el fondo como acuarela fuera de foco. Quitan frialdad sin
meter más colores fuertes. Usar con baja opacidad y `blur` alto.

### Tipografía

- **Titulares:** serif de alto contraste tipo Didone (p. ej. Playfair Display).
  Grandes, finos, generosos.
- **Cuerpo:** sans-serif neutro (p. ej. Inter o similar).
- **Detalle de marca:** firma manuscrita en script, color acento, para el nombre
  de Renata (toque humano, usar una sola vez).

### Botones (respetar jerarquía)

- **Primario (CTA):** relleno sólido `accent`, texto crema/blanco, radio pequeño
  y consistente (`rounded-md`, NO pill). Ej.: "Reservar", "Agendar cita".
- **Secundario:** outline — borde fino `accent`, fondo transparente, texto
  `accent` o `ink`. Ej.: "Ver portafolio", "Contactar".
- Unificar TODO a un mismo radio pequeño (más intencional que el original, que
  mezclaba rectos y pill).

### Tokens para Tailwind (`tailwind.config` / theme)

```js
// theme.extend
colors: {
  cream:       '#F4F0E9',
  accent:      '#C2603F',
  'accent-hover':'#A84F32',
  ink:         '#1A1A1A',
  footer:      '#0E0E0E',
  muted:       '#6B6B6B',
  line:        '#E0DAD0',
},
fontFamily: {
  serif: ['var(--font-playfair)', 'Georgia', 'serif'],
  sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
},
borderRadius: {
  DEFAULT: '6px',   // radio base consistente para botones/cards
},
```

- Radio base: **6px** (`rounded-md`) en botones y tarjetas. Nada de pills.
- Espaciado: generoso. Secciones con padding vertical amplio (`py-20`+ en
  desktop). El aire es parte del estilo.

### Elementos visuales recurrentes (firma del estilo)

- **Asterisco/destello (✦)** en `accent` como marcador de inicio de sección.
- Contadores de stats grandes en serif (+8 años, +500 novias…).
- Barras de habilidad con relleno `accent`.
- Acordeón de FAQ: ítem activo en `accent` sólido con texto crema; resto con
  borde fino `line`.
- Lista de precios con líneas guía y "desde $XX" en `accent`.
- Tira de Instagram antes del footer, con el @ como título.

### Reglas de diferenciación (NO clonar el template)

21. Acento terracota propio, NO el vermellón del template.
22. SIN sección de equipo / varias artistas: Renata es individual. Ese bloque se
    reemplaza por su bio y certificaciones.
23. Todo en español, precios en MXN, botón de WhatsApp, y flujo de reserva real
    (no el formulario de contacto genérico del template).
24. Radio de botones unificado y pequeño en todo el sitio.
