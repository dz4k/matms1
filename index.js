const express = require("express")


const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  // we're connected!
})
const msgSchema =  new mongoose.Schema({
  yazan: String, 
  icerik: String, 
  cevaplar: [{yazan: String, icerik: String}] 
}, {
  timestamps: true
} )
const Msg = mongoose.model('Msg', msgSchema)


console.log("[]Starting")
const app = express()
const server = app.listen(3000)

app.use(express.static('wwwroot'))
app.set('views', './views')
app.set('view engine', 'pug')

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