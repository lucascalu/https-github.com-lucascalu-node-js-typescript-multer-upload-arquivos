const express = require('express');
const multer = require('multer');
const fs = require('file-system');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const myurl = 'mongodb://localhost:27017';

//CREATE EXPRESS APP
const app = express();
app.use(express.json());

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });

MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err);
  db = client.db('test');
  app.listen(3000, () => {
    console.log('Database connected successfully');
    console.log('Server started on port 3000');
  });
});
//ROUTES WILL GO HERE
app.get('/', function (req, res) {
  res.sendFile('index.html');
});

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files;
  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(files);
});

app.post('/uploadphoto', upload.single('myImage'), (req, res) => {
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');
  // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
    contentType: req.file.mimetype,
    image: Buffer.from(encode_image, 'base64'),
  };
  db.collection('myCollection').insertOne(finalImg, (err, result) => {
    console.log(result);
    if (err) return console.log(err);
    console.log('saved to database');
    res.redirect('/');
  });
});

app.get('/photos', (req, res) => {
  db.collection('myCollection')
    .find()
    .toArray((err, result) => {
      const imgArray = result.map((element) => element._id);
      console.log(imgArray);
      if (err) return console.log(err);
      res.send(imgArray);
    });
});

app.get('/photo/:id', (req, res) => {
  var filename = req.params.id;
  db.collection('myCollection').findOne(
    { _id: ObjectId(filename) },
    (err, result) => {
      if (err) return console.log(err);
      res.contentType('image/jpeg');
      res.send(result.image.buffer);
    }
  );
});
