import express, { Application, Request, Response } from 'express';
const fs = require("fs");
const cors = require("cors");
const busboy = require('connect-busboy');

const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000","http://20.24.147.227:3000","https://melodistic.me"],
  })
);
app.use(busboy({
    highWaterMark: 2 * 1024 * 1024
}));

app.get("/api/stream", (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date()
  })
})

app.get("/api/storage/user-profile/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename;
  res.sendFile(`./uploads/user/${filename}`, { root: __dirname });
})

app.get("/api/storage/track/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename;
  res.sendFile(`./uploads/track/${filename}`, { root: __dirname });
})

app.get("/api/stream/:filename", (req: Request, res: Response) => {
  var filename = req.params.filename;

  var music = "combine-result/" + filename + ".wav";

  var stat = fs.statSync(music);
  var range = req.headers.range;
  var readStream;

  if (range !== undefined) {
    var parts = range.replace(/bytes=/, "").split("-");

    var partial_start = parts[0];
    var partial_end = parts[1];

    if (
      (isNaN(parseInt(partial_start)) && partial_start.length > 1) ||
      (isNaN(parseInt(partial_end)) && partial_end.length > 1)
    ) {
      return res.sendStatus(500); 
    }

    var start = parseInt(partial_start, 10);
    var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
    var content_length = end - start + 1;

    res.status(206).header({
      "Content-Type": "audio/mpeg",
      "Content-Length": content_length,
      "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
    });

    readStream = fs.createReadStream(music, { start: start, end: end });
  } else {
    res.header({
      "Content-Type": "audio/mpeg",
      "Content-Length": stat.size,
    });
    readStream = fs.createReadStream(music);
  }
  readStream.pipe(res);
});

app.listen(5050, function () {
  console.log("Application Listening on Port 5050");
});
