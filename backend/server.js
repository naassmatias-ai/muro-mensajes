// ==============================================================================
// ⚙️ BACKEND CON BASE DE DATOS SQL (SQLite en Node.js)
// ==============================================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
// Usamos el motor nativo de SQLite integrado en Node.js
const { DatabaseSync } = require("node:sqlite");

const app = express();
// En la nube (Render/Railway), el puerto lo asigna el proveedor mediante la variable de entorno PORT
const PUERTO = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json());
// Servimos los archivos visuales del frontend (HTML, CSS, JS) directamente desde el servidor
app.use(express.static(path.join(__dirname, "../frontend")));

// ==============================================================================
// 💾 CONFIGURACIÓN DE LA BASE DE DATOS
// ==============================================================================
// Guardamos la base de datos en un archivo físico llamado 'mensajes.db'
const rutaBaseDatos = path.join(__dirname, "mensajes.db");
const db = new DatabaseSync(rutaBaseDatos);

console.log(`📦 Base de datos conectada en: ${rutaBaseDatos}`);

// Creamos la tabla 'mensajes' si aún no existe
// Definimos las columnas: id (único), autor, contenido y fecha
db.exec(`
  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    autor TEXT NOT NULL,
    contenido TEXT NOT NULL,
    fecha TEXT NOT NULL
  );
`);

// Si la base de datos está totalmente vacía, insertamos un mensaje inicial de bienvenida
const conteo = db.prepare("SELECT COUNT(*) as total FROM mensajes").get();
if (conteo.total === 0) {
  const fechaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const insertarInicial = db.prepare(
    "INSERT INTO mensajes (autor, contenido, fecha) VALUES (?, ?, ?)"
  );
  insertarInicial.run(
    "Base de Datos SQLite",
    "¡Hola! Este mensaje está guardado físicamente en la base de datos mensajes.db.",
    fechaActual
  );
}

// ==============================================================================
// 📡 RUTAS DE LA API (Endpoints conectados a SQL)
// ==============================================================================

// RUTA 1: Obtener todos los mensajes (SELECT de SQL)
app.get("/api/mensajes", (req, res) => {
  try {
    // Pedimos todos los mensajes ordenados del más antiguo al más nuevo
    const consulta = db.prepare("SELECT * FROM mensajes ORDER BY id ASC");
    const todosLosMensajes = consulta.all();
    
    console.log(`📥 GET /api/mensajes -> Enviando ${todosLosMensajes.length} mensajes desde la BD.`);
    res.json(todosLosMensajes);
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).json({ error: "Error interno al leer la base de datos" });
  }
});

// RUTA 2: Guardar un nuevo mensaje (INSERT de SQL)
app.post("/api/mensajes", (req, res) => {
  try {
    const { autor, contenido } = req.body;

    if (!autor || !contenido) {
      return res.status(400).json({ error: "El autor y el contenido son obligatorios." });
    }

    const fechaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Consulta SQL preparada con signos de pregunta '?' para prevenir inyecciones SQL
    const sentencia = db.prepare(
      "INSERT INTO mensajes (autor, contenido, fecha) VALUES (?, ?, ?)"
    );

    // Ejecutamos la inserción en la base de datos física
    const resultado = sentencia.run(autor.trim(), contenido.trim(), fechaActual);

    // Creamos el objeto del mensaje guardado con el ID autogenerado
    const nuevoMensaje = {
      id: Number(resultado.lastInsertRowid),
      autor: autor.trim(),
      contenido: contenido.trim(),
      fecha: fechaActual
    };

    console.log(`💾 POST /api/mensajes -> Guardado con ID #${nuevoMensaje.id} en la BD.`);
    res.status(201).json(nuevoMensaje);

  } catch (error) {
    console.error("Error al insertar en la base de datos:", error);
    res.status(500).json({ error: "Error interno al guardar en la base de datos" });
  }
});

// ==============================================================================
// 🚀 INICIAR EL SERVIDOR
// ==============================================================================
app.listen(PUERTO, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Servidor backend con SQL listo en: http://localhost:${PUERTO}`);
  console.log(`💾 Archivo físico de la BD: backend/mensajes.db`);
  console.log(`==================================================\n`);
});
