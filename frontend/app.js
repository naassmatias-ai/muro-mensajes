// ==============================================================================
// 🌐 FRONTEND JAVASCRIPT: Conectado a la API REST (Backend)
// ==============================================================================

// URL de nuestro servidor backend local
const API_URL = "http://localhost:3000/api/mensajes";

// Elementos de la interfaz gráfica
const formulario = document.getElementById("formulario-mensaje");
const autorInput = document.getElementById("autor");
const contenidoInput = document.getElementById("contenido");
const botonEnviar = document.getElementById("boton-enviar");
const contenedorMensajes = document.getElementById("contenedor-mensajes");

// ==============================================================================
// 1. CARGAR MENSAJES DESDE EL BACKEND (GET)
// ==============================================================================
// Usamos "async" porque pedir datos por internet toma tiempo y no queremos
// congelar la pantalla mientras esperamos la respuesta del servidor.
async function cargarMensajes() {
  contenedorMensajes.innerHTML = '<p class="mensaje-vacio">Cargando mensajes del servidor...</p>';

  try {
    // Hacemos la petición HTTP GET al servidor
    const respuesta = await fetch(API_URL);

    // Si el servidor responde con un error (ej: 404, 500)
    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }

    // Convertimos la respuesta cruda a objetos JavaScript (JSON)
    const mensajes = await respuesta.json();

    // Dibujamos los mensajes en pantalla
    renderizarMensajes(mensajes);

  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    contenedorMensajes.innerHTML = `
      <p class="mensaje-vacio" style="color: #f87171;">
        ⚠️ No se pudo conectar con el servidor backend.<br>
        Asegúrate de que 'server.js' esté corriendo en http://localhost:3000
      </p>
    `;
  }
}

// ==============================================================================
// 2. ENVIAR UN NUEVO MENSAJE AL BACKEND (POST)
// ==============================================================================
formulario.addEventListener("submit", async (evento) => {
  // Evitamos que el formulario recargue la página por defecto
  evento.preventDefault();

  const autor = autorInput.value.trim();
  const contenido = contenidoInput.value.trim();

  if (!autor || !contenido) return;

  // Feedback visual: deshabilitamos el botón para evitar doble clic
  const textoBotonOriginal = botonEnviar.innerText;
  botonEnviar.disabled = true;
  botonEnviar.innerText = "Enviando al servidor...";

  try {
    // Enviamos la petición HTTP POST con los datos en formato JSON
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // Le avisamos al servidor que enviamos JSON
      },
      body: JSON.stringify({ autor, contenido }) // Convertimos el objeto JS a texto JSON
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo guardar el mensaje.");
    }

    // Limpiamos los campos del formulario
    contenidoInput.value = "";
    contenidoInput.focus();

    // Volvemos a pedir la lista actualizada al backend
    await cargarMensajes();

  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    alert("Hubo un error al enviar tu mensaje al servidor. Revisa la consola.");
  } finally {
    // Restauramos el botón a su estado normal
    botonEnviar.disabled = false;
    botonEnviar.innerText = textoBotonOriginal;
  }
});

// ==============================================================================
// 3. RENDERIZAR MENSAJES EN LA PANTALLA (Manipulación del DOM)
// ==============================================================================
function renderizarMensajes(listaMensajes) {
  contenedorMensajes.innerHTML = "";

  if (listaMensajes.length === 0) {
    contenedorMensajes.innerHTML = '<p class="mensaje-vacio">Aún no hay mensajes. ¡Sé el primero en escribir!</p>';
    return;
  }

  // Iteramos sobre la lista que nos devolvió el servidor
  listaMensajes.forEach((msg) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "mensaje-item";

    tarjeta.innerHTML = `
      <div class="mensaje-cabecera">
        <span class="mensaje-autor">${escaparHTML(msg.autor)}</span>
        <span class="mensaje-fecha">${msg.fecha}</span>
      </div>
      <p class="mensaje-cuerpo">${escaparHTML(msg.contenido)}</p>
    `;

    // Usamos prepend para mostrar los más recientes arriba
    contenedorMensajes.prepend(tarjeta);
  });
}

// Función auxiliar de seguridad básica para prevenir inyección HTML (XSS)
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.innerText = texto;
  return div.innerHTML;
}

// ==============================================================================
// 🚀 INICIO: Cuando carga el navegador, pedimos los mensajes al servidor
// ==============================================================================
cargarMensajes();
