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
// let Client = require('ssh2-sftp-client');
// let sftp = new Client();

// sftp.connect({
//   host : 'preview.awardspace.net',
//   port : 21,
//   username : "4309606_eventmaster",
//   password: "andrew62"
// }).then(()=>{
//   return sftp.list('/pathname');
// }).then(data=>{
//   console.log(data, 'the data info');
// }).catch(err=>{
//   console.log(err);
// })

const imageStorage = multer.diskStorage({
  destination: "uploads/images/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

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
  const readStream = fs.createReadStream(`uploads/videos/${filename}`);
  readStream.pipe(res);
});

app.post("/image", imageUpload.single("image"), (req, res) => {
  const { filename } = req.file.filename;
  res.json(filename);
});

app.post("/images", imageUpload.array("image", 10), (req, res) => {
  const filenames = [];
  req.files.map((file) => filenames.push(file.filename));
  res.json(filenames);
});

app.post("/video", videoUpload.single("video"), (req, res) => {
  console.log("video");
  res.send(req.file);
});

// Lancement du serveur Node.js
app.listen(port, () => {
  console.log(`Serveur Node.js écoutant sur le port ${port}`);
});
