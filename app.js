var express = require('express')
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient
var app = express()

const DATABASE_URL = "mongodb://exampleuser:exampleuser@ds139082.mlab.com:39082/blog-posts"

var db
var ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

MongoClient.connect(DATABASE_URL, (err, database) => {
  if (err)
    return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/api/getposts', (req, res) => {
  db.collection('posts').find().sort({timestamp: -1}).toArray((err, results) => {
    var response = {
      'response': results
    }
    res.send(JSON.stringify(response))
  })
})

app.post('/api/newpost', (req, res) => {
  db.collection('posts').save(req.body, (err, result) => {
    if (err)
      return console.log(err)
    res.send()
  })
})

app.put('/api/newcomment', (req, res) => {
  db.collection('posts').findAndModify(
    {
      "_id":  ObjectId(req.body._id)
    },
    [],
    {
      "$push": {
        "comments": {"text": req.body.comment, "userId": req.body.userId}
      }},
      {upsert: true}

  , (err, object) => {
    if (err)
      return console.log(err)
  })
  res.send()
})

app.get('/api/getpostsby', (req, res) => {
  db.collection('posts').find(req.query).toArray((err, results) => {
    var response = {
      'response': results
    }
    res.send(response)
  })
})
