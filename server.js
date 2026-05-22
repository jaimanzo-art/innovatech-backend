require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "innovatech",
  port: Number(process.env.DB_PORT) || 3306
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend Innovatech Chile funcionando correctamente",
    estado: "OK"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    servicio: "innovatech-backend",
    estado: "activo",
    fecha: new Date().toISOString()
  });
});

app.get("/api/productos", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NOT NULL
      )
    `);

    const [rows] = await connection.execute("SELECT * FROM productos");

    if (rows.length === 0) {
      await connection.execute(`
        INSERT INTO productos (nombre, descripcion) VALUES
        ('Servicio Cloud', 'Migración Lift & Shift en AWS'),
        ('Contenedorización', 'Aplicaciones desplegadas con Docker'),
        ('CI/CD', 'Automatización con GitHub Actions')
      `);

      const [productos] = await connection.execute("SELECT * FROM productos");
      return res.json(productos);
    }

    res.json(rows);
  } catch (error) {
    console.error("Error en /api/productos:", error.message);

    res.status(500).json({
      error: "Error al conectar con la base de datos",
      detalle: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log("Backend Innovatech Chile iniciado");
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`URL local: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log("======================================");
});