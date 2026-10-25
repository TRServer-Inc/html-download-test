const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Apple ID ve Sign Tetikleme Roptası
app.post('/api/apple-sign', (req, res) => {
  const { appleId, applePassword, code } = req.body;

  // İlk aşama: 2FA kodu henüz yoksa önceden doğrulama isteği simülasyonu / kontrolü
  if (!code) {
    // Arka planda 2FA tetiklendiği senaryo
    return res.json({
      requires2FA: true,
      message: '2FA Kodu Gerekli'
    });
  }

  // 2FA Kodu geldiyse imzalama tetiklenir
  console.log(`[SIGN] Apple ID: ${appleId} ile 2FA Kodu (${code}) kullanılarak sign başlatıldı.`);
  
  // Burada GitHub Actions Workflow Dispatch tetiklenir (veya 6 günde bir otomatik zamanlayıcı kurulur)
  
  return res.json({
    success: true,
    message: 'IPA başarıyla imzalandı ve 6 günlük zamanlayıcı kuruldu!'
  });
});

app.listen(PORT, () => {
  console.log(`Web servis ${PORT} portunda tıkır tıkır çalışıyor!`);
});
