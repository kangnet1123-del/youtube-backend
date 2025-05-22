const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/download/:videoId", (req, res) => {
  const videoId = req.params.videoId;
  const quality = req.query.quality || "360p";
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const filename = `${videoId}_${quality}.mp4`;
  const output = path.resolve("/tmp", filename); // Render의 쓰기 가능한 경로

  const resolution = quality.replace('p', '');
  const cmd = `yt-dlp -f "bestvideo[height<=${resolution}]+bestaudio/best" -o - "${url}" | ffmpeg -i - -vcodec libx264 -preset ultrafast "${output}"`;

  exec(cmd, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("처리 실패");
    }

    res.download(output, filename, () => {
      fs.unlinkSync(output); // 다운로드 후 파일 삭제
    });
  });
});

app.get("/", (req, res) => {
  res.send("YouTube 다운로드 백엔드 실행 중 🎬");
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
