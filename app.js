// aura_iptv_nodejs/app.js

const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

console.log("✅ Servidor inicializado...");

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Página de inicio con formulario
app.get('/', (req, res) => {
  console.log("🟢 GET / llamado");
  res.sendFile(path.resolve('public/index.html'));
});

// Procesar login y mostrar canales
app.post('/login', async (req, res) => {
  console.log("🔵 POST /login llamado");

  const { host, username, password } = req.body;
  console.log("🧾 Datos recibidos:", { host, username, password });

  try {
    const apiUrl = `${host}/player_api.php?username=${username}&password=${password}`;
    console.log("🌐 Consultando API:", apiUrl);

    const response = await axios.get(apiUrl);
    console.log("✅ Respuesta recibida de la API");

    const channels = response.data.live_streams || [];
    console.log(`📺 Se encontraron ${channels.length} canales`);

    const html = `
      <html><head><title>Aura IPTV</title><style>
        body { background: #111; color: white; font-family: sans-serif; padding: 20px; }
        .channel { background: #222; margin: 10px 0; padding: 10px; cursor: pointer; }
        video { width: 100%; max-width: 800px; margin-top: 20px; background: black; }
      </style></head><body>
      <h1>Canales de ${username}</h1>
      <div id="channels">
        ${channels.slice(0, 10).map(c => `<div class='channel' onclick="document.getElementById('player').src='${host}/live/${username}/${password}/${c.stream_id}.m3u8'">${c.name}</div>`).join('')}
      </div>
      <video id="player" controls autoplay></video>
      </body></html>
    `;

    res.send(html);
  } catch (error) {
    console.error("🔥 ERROR en POST /login:", error.message, error.stack);
    res.status(500).send(`
      <p style='color:red'>Error al conectar con el servidor: ${error.message}</p>
      <a href='/'>Volver</a>
    `);
  }
});

module.exports = app;
