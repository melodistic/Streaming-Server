const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const busboy = require('connect-busboy');
const path = require('path');
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);
app.use(busboy({
    highWaterMark: 2 * 1024 * 1024
}));

const uploadPath = path.join(__dirname, 'music/');

app.get("/api/playlist", async (req, res) => {
  let files = await fs.readdirSync("./music");
  res.send({ files });
});

app.get("/api/play/:filename", function (req, res) {
  var filename = req.params.filename;

  var music = "music/" + filename;

  var stat = fs.statSync(music);
  range = req.headers.range;
  var readStream;

  if (range !== undefined) {
    var parts = range.replace(/bytes=/, "").split("-");

    var partial_start = parts[0];
    var partial_end = parts[1];

    if (
      (isNaN(partial_start) && partial_start.length > 1) ||
      (isNaN(partial_end) && partial_end.length > 1)
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

app.post('/upload',(req, res, next) => {
 
    req.pipe(req.busboy); // Pipe it trough busboy
 
    req.busboy.on('file', (fieldname, file, filename) => {
        filename = filename["filename"]
        console.log(`Upload of '${filename}' started`);
 
        // Create a write stream of the new file
        const fstream = fs.createWriteStream(path.join(uploadPath, filename));
        // Pipe it trough
        file.pipe(fstream);
 
        // On finish of the upload
        fstream.on('close', () => {
            console.log(`Upload of '${filename}' finished`);
            res.redirect('back');
        });
    });
});

app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="upload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="fileToUpload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});

app.listen(5050, function () {
  console.log("[NodeJS] Application Listening on Port 5050");
});
