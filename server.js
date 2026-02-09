// server.js - Servidor para servir el build de Angular

const express = require('express');
const path = require('path');

const app = express();

// Puerto: usa el de Azure (process.env.PORT) o 8080 en local
const PORT = process.env.PORT || 8080;

// 📁 Carpeta donde Angular deja los archivos estáticos
// dist/inventario-web/browser
const distFolder = path.join(__dirname, 'dist', 'inventario-web', 'browser');

// Servir archivos estáticos (JS, CSS, imágenes, etc.)
app.use(express.static(distFolder));

// Cualquier ruta (/, /productos, /reportes, etc.) devuelve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Frontend escuchando en el puerto ${PORT}`);
});
