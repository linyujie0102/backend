var express = require('express');
const app = express();
var admin = require('firebase-admin');
var serviceAccount = require('./blog-linyujie-me-firebase-adminsdk-dfwby-773b5fe9ff.json');
var cors = require('cors');
var path = require('path')
var crypto = require('crypto')
var bodyParser = require('body-parser')
var busboy = require('connect-busboy');
var busboyBodyParser = require('busboy-body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '10mb'}))
var fs = require('fs');
var multer  = require('multer')
var storage = multer.diskStorage({
  destination: './public/images',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})
var upload = multer({ storage: storage })
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://blog-linyujie-me.firebaseio.com'
})

var db = admin.database();
var blogRef = db.ref("blog");
var newBlogRef = blogRef.push();

const myCredential = {
  username: "sheldonlinyujie@gmail.com",
  password: "Abstinence"
}

// newBlogRef.set({
//   type: "blog",
//   title: "first blog",
//   content: "hello",
//   date: admin.database.ServerValue.TIMESTAMP
// })

// blog.on("value", (snapshot) => {
//   console.log(snapshot.val());
// }, (errorObject) => {
//   console.log(errorObject.code);
// })


app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World');
})

var server = app.listen(8081, () => {
  console.log('server is up and running');
})

app.post('/login', upload.none(), (req, res, next) => {
  const {username, password} = req.body;
  if (username === myCredential.username && password === myCredential.password) {
    res.send({success: true})
  } else {
    res.send({success: false})
  }
})

var imageBaseUrl = 'http://blog.linyujie.me:8081/static/images/';
app.post('/image', upload.single('image'), (req, res, next) => {
  const title = JSON.parse(req.body.title);
  const body = JSON.parse(req.body.body);
  const location = JSON.parse(req.body.location);
  const image_url = imageBaseUrl + req.file.filename;
  var blogRef = db.ref("blog");
  var newBlogRef = blogRef.push();
  newBlogRef.set({
    type: "image",
    title,
    body,
    location,
    image_url,
    date: admin.database.ServerValue.TIMESTAMP
  }, (error) => {
    if(error) {
      res.send({success: false})
    } else {
      res.send({success: true})
    }
  })
})

app.post('/blog', upload.none(), (req, res, next) => {
  const {title, body, location} = req.body;
  var blogRef = db.ref("blog");
  var newBlogRef = blogRef.push();
  newBlogRef.set({
    type: "blog",
    title,
    body,
    location,
    date: admin.database.ServerValue.TIMESTAMP
  }, (error) => {
    if(error) {
      console.log(error);
      res.send({success: false})
    } else {
      res.send({success: true})
    }
  })
})

app.post('/vlog', upload.none(), (req, res, next) => {
  const {title, body, location, video_url} = req.body;
  var blogRef = db.ref("blog");
  var newBlogRef = blogRef.push();
  newBlogRef.set({
    type: "vlog",
    title,
    body,
    location,
    video_url,
    date: admin.database.ServerValue.TIMESTAMP
  }, (error) => {
    if(error) {
      console.log(error);
      res.send({success: false})
    } else {
      res.send({success: true})
    }
  })
})

app.get('/images', upload.none(), (req, res, next) => {
  let images = [];
  blogRef.orderByChild('type').equalTo("image").once("value", (snapshot) => {
    snapshot.forEach((data) => {
      images.push(data.val());
    })
    images.reverse();
    res.send({
      success: true,
      images
    })
  })
})

app.get('/blogs', upload.none(), (req, res, next) => {
  let blogs = [];
  blogRef.orderByChild('type').equalTo("blog").once("value", (snapshot) => {
    snapshot.forEach((data) => {
      blogs.push(data.val());
    })
    blogs.reverse();
    res.send({
      success: true,
      blogs
    })
  })
})

app.get('/vlogs', upload.none(), (req, res, next) => {
  let vlogs = [];
  blogRef.orderByChild('type').equalTo("vlog").once("value", (snapshot) => {
    snapshot.forEach((data) => {
      vlogs.push(data.val());
    })
    vlogs.reverse();
    res.send({
      success: true,
      vlogs
    })
  })
})

app.get('/posts', upload.none(), (req, res, next) => {
  let posts = [];
  blogRef.once("value", (snapshot) => {
    snapshot.forEach((data) => {
      posts.push(data.val());
    })
    posts.reverse();
    res.send({
      success: true,
      posts
    })
  })
})
