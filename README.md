# 🌍 Muro de Mensajes Global (Full-Stack)

Una aplicación web completa desarrollada desde cero para entender todo el ciclo de desarrollo de software: Frontend, Backend con API REST, persistencia con Base de Datos SQL y despliegue en la nube.

---

## 🏗️ Arquitectura del Proyecto

- **Frontend (`/frontend`):**
  - HTML5 semántico.
  - CSS3 responsivo y moderno con tema oscuro.
  - JavaScript Vanilla interactivo con `fetch()` asíncrono (`async` / `await`).

- **Backend (`/backend`):**
  - Node.js y framework Express.
  - Endpoints REST:
    - `GET /api/mensajes`: Obtiene todos los mensajes.
    - `POST /api/mensajes`: Guarda un nuevo mensaje.
  - Base de Datos relacional integrada con SQLite (`mensajes.db`).
  - Habilitación de CORS para comunicación segura entre clientes y la API.

---

## 🚀 Cómo ejecutarlo en tu computadora local

1. **Iniciar el Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   El servidor estará escuchando en `http://localhost:3000`.

2. **Abrir el Frontend:**
   - Abre el archivo `frontend/index.html` en cualquier navegador web.
