// Changelog del sistema. El más reciente va primero.
// Añadir nuevas releases al inicio de este array: un id único distinto activa
// el badge "1" y la animación de caída para todos los usuarios que aún no la vean.
export const changelog = [
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
