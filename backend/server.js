// ==============================================================================
// ⚙️ BACKEND HÍBRIDO: Soporta Base de Datos en la Nube (PostgreSQL) o Local (SQLite)
// ==============================================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg"); // Cliente para PostgreSQL en la nube
const { DatabaseSync } = require("node:sqlite"); // Cliente para SQLite local

const app = express();
const PUERTO = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ==============================================================================
// 💾 CONFIGURACIÓN DE LA BASE DE DATOS
// ==============================================================================
// Si configuramos la variable de entorno DATABASE_URL, usamos PostgreSQL en la nube.
// Si no está configurada, usamos la base de datos SQLite local en tu computadora.
let poolPostgres = null;
let dbSqlite = null;

if (process.env.DATABASE_URL) {
  console.log("☁️  Modo NUBE detectado: Conectando a PostgreSQL remoto...");
  poolPostgres = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Permite conexiones seguras SSL con proveedores cloud (Supabase, Neon, etc.)
    }
  });

  // Creamos la tabla 'mensajes' en PostgreSQL si no existe
  poolPostgres.query(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      autor TEXT NOT NULL,
      contenido TEXT NOT NULL,
      fecha TEXT NOT NULL
    );
  `).then(() => {
    console.log("✅ Tabla 'mensajes' verificada en PostgreSQL.");
  }).catch((err) => {
    console.error("❌ Error al inicializar PostgreSQL:", err);
  });

} else {
  console.log("🖥️  Modo LOCAL detectado: Usando SQLite en mensajes.db...");
  const rutaBaseDatos = path.join(__dirname, "mensajes.db");
  dbSqlite = new DatabaseSync(rutaBaseDatos);

  dbSqlite.exec(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      autor TEXT NOT NULL,
      contenido TEXT NOT NULL,
      fecha TEXT NOT NULL
    );
  `);
  console.log(`✅ Base de datos SQLite conectada en: ${rutaBaseDatos}`);
}

// ==============================================================================
// 📡 RUTAS DE LA API (Endpoints)
// ==============================================================================

// RUTA 1: Obtener todos los mensajes (GET)
app.get("/api/mensajes", async (req, res) => {
  try {
    if (poolPostgres) {
      // Consulta en PostgreSQL (Nube)
      const resultado = await poolPostgres.query("SELECT * FROM mensajes ORDER BY id ASC");
      return res.json(resultado.rows);
    } else {
      // Consulta en SQLite (Local)
      const consulta = dbSqlite.prepare("SELECT * FROM mensajes ORDER BY id ASC");
      return res.json(consulta.all());
    }
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
});

// RUTA 2: Guardar un nuevo mensaje (POST)
app.post("/api/mensajes", async (req, res) => {
  try {
    const { autor, contenido } = req.body;

    if (!autor || !contenido) {
      return res.status(400).json({ error: "El autor y el contenido son obligatorios." });
    }

    const fechaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (poolPostgres) {
      // Inserción en PostgreSQL usando marcadores $1, $2, $3 y RETURNING *
      const resultado = await poolPostgres.query(
        "INSERT INTO mensajes (autor, contenido, fecha) VALUES ($1, $2, $3) RETURNING *",
        [autor.trim(), contenido.trim(), fechaActual]
      );
      console.log(`☁️  Guardado en PostgreSQL con ID #${resultado.rows[0].id}`);
      return res.status(201).json(resultado.rows[0]);

    } else {
      // Inserción en SQLite usando marcadores ?, ?, ?
      const sentencia = dbSqlite.prepare(
        "INSERT INTO mensajes (autor, contenido, fecha) VALUES (?, ?, ?)"
      );
      const resultado = sentencia.run(autor.trim(), contenido.trim(), fechaActual);
      const nuevoMensaje = {
        id: Number(resultado.lastInsertRowid),
        autor: autor.trim(),
        contenido: contenido.trim(),
        fecha: fechaActual
      };
      console.log(`🖥️  Guardado en SQLite local con ID #${nuevoMensaje.id}`);
      return res.status(201).json(nuevoMensaje);
    }

  } catch (error) {
    console.error("Error al guardar el mensaje:", error);
    res.status(500).json({ error: "Error al guardar en la base de datos" });
  }
});

// ==============================================================================
// 🚀 INICIAR EL SERVIDOR
// ==============================================================================
app.listen(PUERTO, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Servidor backend escuchando en: http://localhost:${PUERTO}`);
  console.log(`💾 Base de datos activa: ${poolPostgres ? 'PostgreSQL (Nube)' : 'SQLite (Local)'}`);
  console.log(`==================================================\n`);
});
