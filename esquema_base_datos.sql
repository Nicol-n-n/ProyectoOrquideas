-- =====================================================
-- ESQUEMA BASE DE DATOS - ProyectoOrquideas (Supabase)
-- =====================================================

-- Tabla de usuarios
CREATE TABLE usuarios (
  id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de dispositivos sensores
CREATE TABLE dispositivos_sensores (
  id_sensor SERIAL PRIMARY KEY,
  tipo_sensor VARCHAR(50) NOT NULL,
  mac_address VARCHAR(17) NOT NULL UNIQUE,
  estado_conexion BOOLEAN DEFAULT FALSE,
  fecha_vinculacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de registros ambientales
CREATE TABLE registros_ambientales (
  id_registro SERIAL PRIMARY KEY,
  id_sensor INTEGER NOT NULL REFERENCES dispositivos_sensores(id_sensor) ON DELETE CASCADE,
  humedad_relativa DECIMAL(5,2) NOT NULL,
  temperatura_celsius DECIMAL(5,2) NOT NULL,
  fecha_hora_lectura TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de calendario de riego
CREATE TABLE calendario_riego (
  id_evento_riego SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  fecha_hora_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  estado_notificacion VARCHAR(50) DEFAULT 'pendiente',
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DATOS DE PRUEBA INICIALES
-- =====================================================

-- Usuario de prueba
INSERT INTO usuarios (nombre, correo, contrasena) VALUES
  ('Nicol Neira', 'nicol.neira55@gmail.com', 'contraseña_segura_123');

-- Sensores de prueba
INSERT INTO dispositivos_sensores (tipo_sensor, mac_address, estado_conexion, fecha_vinculacion) VALUES
  ('DHT22', '00:1B:44:11:3A:B7', TRUE, NOW()),
  ('DHT22', '00:1B:44:11:3A:C8', TRUE, NOW());

-- Registros ambientales de prueba
INSERT INTO registros_ambientales (id_sensor, humedad_relativa, temperatura_celsius, fecha_hora_lectura) VALUES
  (1, 65.40, 24.10, NOW() - INTERVAL '1 hour'),
  (1, 68.20, 23.80, NOW() - INTERVAL '2 hours'),
  (2, 61.70, 25.30, NOW() - INTERVAL '3 hours'),
  (2, 64.10, 24.90, NOW() - INTERVAL '4 hours');

-- Eventos de riego de prueba
INSERT INTO calendario_riego (id_usuario, fecha_hora_programada, estado_notificacion, notas) VALUES
  ((SELECT id_usuario FROM usuarios WHERE correo = 'nicol.neira55@gmail.com'),
   NOW() + INTERVAL '1 day',
   'pendiente',
   'Riego matutino de invernadero 01'),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'nicol.neira55@gmail.com'),
   NOW() + INTERVAL '2 days',
   'enviado',
   'Riego vespertino de invernadero 02');

-- =====================================================
-- ÍNDICES RECOMENDADOS
-- =====================================================

CREATE INDEX idx_registros_ambientales_sensor_fecha
  ON registros_ambientales(id_sensor, fecha_hora_lectura DESC);

CREATE INDEX idx_calendario_riego_usuario_fecha
  ON calendario_riego(id_usuario, fecha_hora_programada);
