const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const fs = require("fs");

const cors = require("cors");
const port = 8000;

const multer = require("multer");
const FTPStorage = require("multer-ftp");
const FTP = require('ftp');

const imageStorage = multer.diskStorage({
  destination: "uploads/images/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

// const imageStorage = new FTPStorage({
//   basepath: "",
//   destination: function (req, file, options, callback) {
//     callback(null, path.join(options.basepath, file.fieldname + "_" + Date.now() + path.extname(file.originalname)));
//   },
//   ftp: {
//     host: "f28-preview.awardspace.net",
//     secure: false,
//     user: "4309606_eventmaster",
//     password: "andrew62",
//   },
// });

const videoStorage = multer.diskStorage({
  destination: "uploads/videos/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|webp|svg|jpeg|avif)$/)) {
      return cb(
        new Error("please upload a image (png|jpg|webp|svg|jpeg|avif)")
      );
    }
    cb(undefined, true);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100000000, // 100000000 Bytes = 100 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      return cb(new Error("Please upload a video (mp4|MPEG-4|mkv)"));
    }
    cb(undefined, true);
  },
});

// Middleware pour gérer les requêtes JSON
app.use(bodyParser.json());

// Middleware pour éviter les problèmes de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/image/:filename", (req, res) => {
  const { filename } = req.params;

  const readStream = fs.createReadStream(`uploads/images/${filename}`);
  readStream.pipe(res);
});

app.get("/video/:filename", (req, res) => {
  const { filename } = req.params;
  const range = req.headers.range;
  if(!range){
    res.status(400).send('Requires range header');
  }
  const videoPath = `uploads/videos/${filename}`;
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  }

  res.writeHead(206, headers);
  const readStream = fs.createReadStream(videoPath, {start, end});
  readStream.pipe(res);
});

app.post("/image", imageUpload.single("image"), (req, res) => {
  const { filename } = req.file.filename;
  res.send(req.file);
});

app.post("/images", imageUpload.array("image", 10), (req, res) => {
  const filenames = [];
  req.files.map((file) => filenames.push(file.filename));
  res.send(req.file);
});

app.post("/video", videoUpload.single("video"), (req, res) => {
  console.log("video");
  res.send(req.file);
});

// Lancement du serveur Node.js
app.listen(port, () => {
  console.log(`Serveur Node.js écoutant sur le port ${port}`);
});
