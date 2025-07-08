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
    const categories = response.data.available_channels || [];
    console.log(`📺 Se encontraron ${channels.length} canales`);

    const html = `
      <html>
      <head>
        <title>Aura IPTV</title>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <style>
          body {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
            margin: 0;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
          }
          .search-box {
            text-align: center;
            margin-bottom: 20px;
          }
          .search-box input {
            padding: 10px;
            border-radius: 5px;
            border: none;
            width: 300px;
          }
          .channel-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .channel {
            background: #1e1e1e;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: background 0.3s;
          }
          .channel:hover {
            background: #333;
          }
          .channel img {
            width: 100%;
            height: 120px;
            object-fit: contain;
            margin-bottom: 10px;
          }
          video {
            display: block;
            width: 100%;
            max-width: 960px;
            margin: 0 auto;
            border: 3px solid #fff;
            border-radius: 10px;
            background: black;
          }
        </style>
      </head>
      <body>
        <h1>Canales de ${username}</h1>
        <div class="search-box">
          <input type="text" id="search" placeholder="Buscar canal...">
        </div>
        <div class="channel-list" id="channels">
          ${channels.slice(0, 100).map((c, i) => `
            <div class='channel' onclick="playChannel('${host}/live/${username}/${password}/${c.stream_id}.m3u8')">
              <img src='${c.stream_icon || 'https://via.placeholder.com/150?text=Sin+logo'}' alt='${c.name}' />
              ${i + 1}. ${c.name}
            </div>`).join('')}
        </div>
        <video id="player" controls autoplay></video>

        <script>
          function playChannel(url) {
            const video = document.getElementById('player');
            if (Hls.isSupported()) {
              if (window.hls) {
                window.hls.destroy();
              }
              const hls = new Hls();
              window.hls = hls;
              hls.loadSource(url);
              hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = url;
            } else {
              alert('Tu navegador no soporta streaming HLS');
            }
          }

          document.getElementById('search').addEventListener('input', function() {
            const term = this.value.toLowerCase();
            document.querySelectorAll('.channel').forEach(ch => {
              const name = ch.textContent.toLowerCase();
              ch.style.display = name.includes(term) ? 'block' : 'none';
            });
          });
        </script>
      </body>
      </html>
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
