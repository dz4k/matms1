const express = require("express"),
      mongoose = require('mongoose')

// Veritabanı

function veritabani(mongoose) {
mongoose.connect('mongodb://localhost/test')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  // bağlantı sağlandı!
})
return db
}

const msgSchema =  new mongoose.Schema({
  yazan: String, 
  icerik: String, 
  cevaplar: [{yazan: String, icerik: String}] 
}, {
  timestamps: true
} )
const Msg = mongoose.model('Msg', msgSchema)

// Sunucu

function sunucu(db, views) {
const app = express()
const server = app.listen(3000)

app.use(express.static('wwwroot'))
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.bodyParser())
app.use(express.session({}))

app.get("/", (req, res) => 
  res.render(
    __dirname+"/views/index.pug"
  )
)

app.get("/soru/", (req, res) => 
  res.render(
    __dirname+"/views/soru.pug",
    {
      soru: req.query.id,
    }
  )
)
app.post("soru", (req, res) => {
  
} )
return app
}

const db = veritabani(mongoose)
const app = sunucu(db, [/* TODO: parameterize */])
