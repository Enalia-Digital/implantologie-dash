// Changelog del sistema. El más reciente va primero.
// Añadir nuevas releases al inicio de este array: un id único distinto activa
// el badge "1" y la animación de caída para todos los usuarios que aún no la vean.
export const changelog = [
  {
    id: '2026-10-v2',
    fecha: 'Octubre 2026',
    titulo: 'v2 — Medición por intento de llamada',
    tag: 'Nuevo',
    sections: [
      {
        items: [
          'Ahora sabemos en qué llamada exacta se agenda cada paciente: medimos el intento justo en el que convierte, para ver cuántas llamadas hacen falta de media y afinar el seguimiento.',
          'Mensaje de cierre en el último intento de llamada: una última oportunidad para que el lead nos devuelva la llamada y recuperarlo antes de darlo por perdido.',
          'Llamadas en fin de semana: medimos cuántos leads aceptan que les llamemos en finde y cuántos de esos cierran cita en esa primera llamada, para saber si merece la pena.',
          'Panel de alertas mejorado: ahora puedes confirmar la asistencia y reagendar la cita directamente desde el panel.',
          'Nuevas plantillas de mensaje para las campañas de reactivación.',
        ],
      },
    ],
  },
  {
    id: '2026-09-v1',
    fecha: 'Septiembre 2026',
    titulo: 'v1 — Implementación del sistema',
    tag: 'Nuevo',
    sections: [
      {
        semana: 'Semana 1',
        items: [
          'Corrección del guión de llamadas',
          'Ampliación del horario de llamadas automatizadas',
          'Mejor conexión del calendario interno con las clínicas',
          'Reproductor de llamadas integrado directamente en el panel',
          'Objeciones desplegables con texto real y grabación de audio',
          'Corrección de pequeños detalles en la campaña de llamadas en frío',
        ],
      },
    ],
  },
];
