# Escapada · Vacaciones del 5 al 8 de marzo de 2026

Frontend estático, sin instalación ni compilación. HTML, CSS y JavaScript.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio: index.html debe quedar en la raíz.
3. En Settings → Pages → Build and deployment, elige Deploy from a branch.
4. Selecciona main y / (root), guarda y espera a que termine el despliegue.
5. Abre el enlace que muestra GitHub Pages.

No necesitas npm, servidor propio ni claves de GitHub. También puedes usar cualquier hosting estático. Para probar localmente, sirve esta carpeta con un servidor HTTP (por ejemplo `npx serve .`).

## Editar entre amigos (Firebase)

GitHub Pages sirve los archivos, pero no almacena los cambios compartidos. Para eso esta aplicación incluye una conexión a Firebase Realtime Database.

1. Crea un proyecto en https://console.firebase.google.com/ y registra una aplicación web.
2. En Authentication → Sign-in method habilita Anonymous (anónimo).
3. Crea una Realtime Database. Copia su URL exacta, incluida la región si corresponde.
4. En la pestaña Rules de la base de datos, pega el contenido de database.rules.json y publícalo. No dejes reglas abiertas de modo de prueba.
5. En config.js reemplaza null por el objeto de configuración web que te da Firebase. Incluye apiKey, authDomain, databaseURL y projectId. Es configuración pública del cliente: nunca pegues una cuenta de servicio ni una clave privada.
6. Sube el config.js actualizado a GitHub y espera el despliegue.
7. En la página, pulsa Conectar grupo → Crear grupo compartido y luego Compartir. Todos deben abrir **el mismo enlace completo**, incluido #grupo=...

Cualquiera que posea el enlace del grupo puede leer, agregar, modificar y eliminar actividades. El identificador aleatorio del enlace funciona como invitación; no compartas ese enlace públicamente. No hay roles ni expulsión de miembros en esta versión. Las reglas impiden listar todos los grupos desde la raíz. Para usar listas de invitados individuales se necesitaría ampliar el sistema de acceso.

El modo local solo guarda datos en ese navegador. Los grupos comienzan vacíos; exporta los planes locales e impórtalos desde el grupo para transferirlos. Cada actividad se guarda por separado para no sobrescribir cambios de otras actividades. Si dos personas editan la misma actividad, prevalece el último guardado. El número de viajeros se comparte con el grupo. Los costos se introducen como costo TOTAL de la actividad, en soles, y se dividen equitativamente entre los viajeros.

## Funciones

- Crear, editar y eliminar actividades con horario, costo, categoría, lugar, participantes y notas.
- Cuatro días fijos: jueves 5 a domingo 8 de marzo de 2026.
- Arrastrar bloques entre días en escritorio; en celular usa el selector de día al editar.
- Duración, avisos de superposición, actividades completadas.
- Calendario y lista, búsqueda y filtros.
- Totales y costo por persona automáticos (sobre todos los planes, independientemente del filtro).
- Exportación JSON e importación que agrega actividades sin borrar las existentes.
- Diseño adaptable, navegación con teclado y animaciones que respetan movimiento reducido.

No se incluyen actividades de ejemplo ni costos inventados: arma tu propia agenda.

## Archivos

- index.html: interfaz.
- style.css: diseño y estilos adaptables.
- app.js: calendario, almacenamiento e integración opcional.
- config.js: configuración pública de Firebase.
- database.rules.json: reglas que debes publicar en Firebase, no se aplican por subirlas a GitHub.
- .nojekyll: permite servir el frontend directamente en GitHub Pages.

La sincronización necesita conexión a Internet y Firebase configurado. Las fuentes de Google son opcionales; si no cargan, se usan fuentes del sistema. Verifica cuotas y uso de tu proyecto Firebase en su consola.

Documentación oficial: https://firebase.google.com/docs/database/web/start y https://firebase.google.com/docs/database/security
