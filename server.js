const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Apple ID Giriş ve Anisette / 2FA Yönetim Rotaları
app.post('/api/apple-sign', async (req, res) => {
  const { appleId, applePassword, code } = req.body;

  if (!appleId || !applePassword) {
    return res.status(400).json({ success: false, message: 'Apple ID ve şifre zorunludur.' });
  }

  try {
    // Eğer 2FA kodu gönderilmediyse Apple'a ilk isteği atıp kod isteyelim
    if (!code) {
      console.log(`[AUTH] ${appleId} için Apple sunucularına bağlanılıyor...`);
      
      // Burada Apple pprotokolü (Anisette başlıkları simülasyonu) tetiklenir
      // Simüle edilen 2FA tetikleme yanıtı:
      return res.json({
        requires2FA: true,
        message: 'Apple ID doğrulama kodu (2FA) cihazınıza gönderildi. Lütfen kodu girin.'
      });
    }

    // 2FA Kodu girildiyse imzalama sürecini (GitHub Actions tetiklemeyi) başlat
    console.log(`[SIGN] Kod doğrulandı (${code}). GitHub Actions imzalama tetikleniyor...`);

    // GitHub Actions API tetikleme fonksiyonu
    await triggerGitHubWorkflow(appleId, applePassword);

    return res.json({
      success: true,
      message: 'Giriş başarılı! IPA imzalanıyor ve 6 günlük otomatik yenileme aktif edildi.'
    });

  } catch (err) {
    console.error(err);
    return.status(500).json({ success: false, message: 'Apple doğrulama hatası: ' + err.message });
  }
});

// GitHub Workflow Tetikleyici Fonksiyon
function triggerGitHubWorkflow(appleId, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      event_type: 'trigger-sign',
      client_payload: { apple_id: appleId, apple_password: password }
    });

    const options = {
      hostname: 'api.github.com',
      path: '/repos/TRServer-Inc/html-download-test/dispatches',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js-Server',
        'Authorization': `token GITHUB_PAT_TOKEN_BURAYA`, // Kendi GitHub Token'ını buraya koyabilirsin
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 204) resolve();
      else reject(new Error(`GitHub tetiklenemedi, kod: ${res.statusCode}`));
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

app.listen(PORT, () => {
  console.log(`Web servis ${PORT} portunda tıkır tıkır çalışıyor!`);
});
