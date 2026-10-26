# Viaje Ica · 5 al 8 de marzo de 2027

Frontend estático para GitHub Pages. Sube estos archivos a la raíz del repositorio y configura Pages con main / (root). No necesita compilación.

## Configurar el acceso privado por correo

1. Conserva tu configuración web de Firebase en config.js, incluyendo databaseURL.
2. Firebase → Authentication → Método de acceso: habilita Correo electrónico/contraseña. No hace falta habilitar enlace sin contraseña. Desactiva Anónimo si lo habías activado.
3. Reemplaza las reglas en Realtime Database → Reglas por database.rules.json y pulsa Publicar. Las reglas antiguas permiten acceso anónimo: es necesario reemplazarlas para activar la protección nueva.
4. Sube los cambios del proyecto a GitHub y espera el despliegue.
5. En la página, cada viajero pulsa Ingresar con correo → Crear cuenta. Cada uno usa su propia contraseña y verifica el correo recibido. Luego pulsa Ya verifiqué / Reintentar. No compartan contraseñas.
6. El organizador abre Firebase → Authentication → Usuarios. Copia el UID de cada cuenta aprobada, incluida la suya.
7. En Realtime Database → Datos, añade un nodo en la raíz llamado allowedUsers. Dentro agrega cada UID como clave, y el valor booleano true (sin comillas). Ejemplo:

    {"allowedUsers":{"UID_DEL_ORGANIZADOR":true,"UID_DEL_AMIGO":true}}

   Añade el nodo desde el botón +. No importes ese ejemplo sobre la raíz: podría reemplazar planes existentes. Ningún cliente web puede modificar allowedUsers; solo el administrador desde la consola.
8. Cada usuario autorizado puede pulsar Ya verifiqué / Reintentar. El organizador crea un grupo desde Conectar grupo y comparte el enlace completo con #grupo=... Los demás abren ese mismo enlace e inician sesión.

Tener el enlace ya no basta: Firebase exige identidad autenticada, correo verificado y UID aprobado. La lista de cuentas aprobadas aplica a todos los grupos de este proyecto; esta aplicación está pensada para un solo grupo de viajeros. Para quitar acceso, elimina su UID de allowedUsers; los cambios pendientes que ya fueron leídos o exportados no se pueden recuperar.

Registrar una cuenta no la autoriza automáticamente. Si aparece permiso denegado, revisa que el correo esté verificado, que el UID tenga true y que las reglas nuevas estén publicadas. No uses reglas públicas de prueba.

## Uso

Crear, editar, eliminar, completar y mover actividades entre los cuatro días. Incluye costos totales en soles, reparto equitativo entre viajeros, notas, lugar, participantes, búsqueda, filtros y vista de lista. Las superposiciones se advierten pero se permiten. En celular cambia el día desde el formulario; en escritorio también puedes arrastrar.

Los planes sin grupo se guardan solo en el navegador. Para transferirlos, exporta e importa desde el grupo. La importación agrega actividades. Dos personas editando la misma actividad: prevalece el último guardado. Los totales incluyen todos los planes, aunque haya filtros activos.

Los datos locales de la antigua agenda de 2026 no se trasladan automáticamente a 2027. Los planes antiguos de grupos también requieren exportación y cambio explícito de fechas antes de importar; no se modifica silenciosamente su información en Firebase.

Las contraseñas las gestiona Firebase Authentication; no se guardan en los archivos del proyecto. config.js contiene configuración pública web, nunca cuentas de servicio. No publiques enlaces de grupos ni exportaciones personales en el repositorio.

Documentación: https://firebase.google.com/docs/auth/web/password-auth y https://firebase.google.com/docs/database/security
