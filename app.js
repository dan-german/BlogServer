var express = require('express')
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectId;
var https = require('https')

var app = express()

const DATABASE_URL = "mongodb://exampleuser:exampleuser@ds139082.mlab.com:39082/blog-posts"

var db

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

  const access_token = req.body.access_token
  const host = 'graph.facebook.com'
  const path = '/me?access_token=' + access_token

  https.get({
    hostname: host,
    path: path,
    agent: false
  }, (res) => {
    if (res.statusCode == 200) {
      newPost()
    }
  })

  function newPost() {
    db.collection('posts').save(req.body, (err, result) => {
      if (err)
        return console.log(err)
      res.send()
    })
  }
})

app.put('/api/newcomment', (req, res) => {
  db.collection('posts').findAndModify({
    "_id": ObjectId(req.body._id)
  }, [], {
    "$push": {
      "comments": {
        "text": req.body.comment,
        "user_id": req.body.user_id
      }
    }
  }, {
    upsert: true
  }, (err, object) => {
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
