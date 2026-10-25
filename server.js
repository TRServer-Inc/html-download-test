const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Statik dosyaları dışarı sun (index.html ve manifest.plist doğrudan okunur)
app.use(express.static(path.join(__dirname)));

// Ana sayfa için index.html gönder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Web servis ${PORT} portunda tıkır tıkır çalışıyor!`);
});
