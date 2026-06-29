-- =====================================================================
-- Renata Belmonte · Makeup Artist — Datos semilla
-- Ejecutar DESPUÉS de 01_schema.sql
-- =====================================================================

-- -------------------------------------------------
-- Servicios (precios en MXN, duración en minutos)
-- -------------------------------------------------
insert into services (slug, name, description, duration_minutes, price_mxn, category, sort_order) values
  ('social-evento', 'Maquillaje Social / Evento',
   'Para fiestas, graduaciones y sesiones de foto. Acabado natural o glam según prefieras.',
   60, 750, 'social', 1),

  ('novia', 'Maquillaje de Novia',
   'Incluye prueba previa, maquillaje del día del evento, pestañas y retoque de labios para llevar.',
   120, 3500, 'novia', 2),

  ('prueba-novia', 'Prueba de Novia',
   'Ensayo del look antes del gran día. Se descuenta si contratas el paquete completo de novia.',
   90, 900, 'novia', 3),

  ('dama-cortejo', 'Maquillaje de Dama / Cortejo',
   'Para la mamá de la novia, madrinas y damas de honor.',
   60, 850, 'social', 4),

  ('quinceanera', 'Maquillaje de Quinceañera',
   'Look fresco y juvenil, apropiado para la edad.',
   75, 1200, 'social', 5),

  ('express', 'Maquillaje Express',
   'Versión rápida para una sesión corta o un evento de último minuto.',
   40, 550, 'social', 6),

  ('peinado', 'Peinado',
   'Complemento que se agrega a cualquier servicio de maquillaje.',
   45, 600, 'add-on', 7),

  ('curso', 'Curso / Clase personalizada',
   'Aprende a maquillarte tú misma. Sesión 1 a 1 con materiales incluidos.',
   150, 1500, 'curso', 8);


-- -------------------------------------------------
-- Horario semanal fijo
-- weekday: 0=domingo ... 6=sábado
-- Renata: Martes a Sábado, 09:00–19:00.
-- Lunes cerrado y Domingo (solo eventos con reserva previa) NO se insertan:
-- al no tener fila, quedan como no disponibles para reserva en línea.
-- -------------------------------------------------
insert into availability (weekday, opens_at, closes_at) values
  (2, '09:00', '19:00'),  -- martes
  (3, '09:00', '19:00'),  -- miércoles
  (4, '09:00', '19:00'),  -- jueves
  (5, '09:00', '19:00'),  -- viernes
  (6, '09:00', '19:00');  -- sábado
