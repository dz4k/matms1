const express = require("express"),
      admin = require('firebase-admin'),
      serviceAccount = require("../serviceAccount.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mat-ms.firebaseio.com"
})

const db = admin.firestore()
// Sunucu

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
