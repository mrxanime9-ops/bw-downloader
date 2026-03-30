const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/download', (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.json({ error: "No URL provided" });
  }

  exec(`yt-dlp -j "${url}"`, (err, stdout) => {
    if (err) {
      return res.json({ error: "Failed to fetch video" });
    }

    try {
      const data = JSON.parse(stdout);

      const formats = data.formats
        .filter(f => f.ext === 'mp4' && f.url)
        .slice(0, 5)
        .map(f => ({
          quality: f.format_note || f.height + "p",
          url: f.url
        }));

      res.json({
        title: data.title,
        thumbnail: data.thumbnail,
        formats: formats
      });

    } catch {
      res.json({ error: "Parsing failed" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
