# ProyectoOrquideas

SPA (Single Page Application) en JavaScript vanilla para el monitoreo y gestión de un sistema de riego / invernadero.

## Secciones

- **Dashboard**: métricas generales (humedad, temperatura, alertas).
- **Calendario**: programación de riegos (RF1/RF2).
- **Datos Históricos**: filtros, gráfico de humedad/temperatura (Chart.js) y tabla detallada con exportación a CSV (RF5).
- **Sensores**: listado de dispositivos activos y vinculación de nuevos sensores ESP32 (RF3).
- **Configuración**: perfil de usuario y seguridad (cambio de contraseña, cierre de sesión).

## Tecnologías

- HTML5 + Tailwind CSS (CDN)
- JavaScript Vanilla (SPA con navegación por pestañas)
- Chart.js
- Supabase (integración pendiente / TODOs)

## Uso

1. Abrir `index.html` en el navegador.
2. Navegar por las pestañas superiores.

## Estructura

```
Proyecto_Etapa_III/
├── index.html
└── app.js
```

## Estado

Proyecto en etapa III. Integración con Supabase pendiente (marcada con comentarios `// TODO`).