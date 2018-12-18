//@ts-check
const express = require("express"),
  admin = require('firebase-admin'),
  // @ts-ignore
  serviceAccount = require("../serviceAccount.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mat-ms.firebaseio.com"
})

const db = admin.firestore()
db.settings({ timestampsInSnapshots: true })
// Sunucu

function adaptDoc(doc) {return {...doc.data(), id: doc.ref.id}}

const app = express()
const server = app.listen(3000)

app.use(express.static('wwwroot'))
app.set('views', './views')
app.set('view engine', 'pug')

app.get("/", (req, res) => {
  db.collection("Sorular").get().then(
    (snapshot) => {
      let docs = snapshot.docs
      res.render(
        __dirname + "/views/index.pug", {
          sorular: docs.map(adaptDoc)
        }
      )
    }
  )

}
)

app.get("/soru/", (req, res) => {
  db.collection("Sorular").doc(req.query.id).get().then((snapshot) => {
    if (!snapshot.data) { res.status(404); return }
    res.render(__dirname + "/views/soru.pug", { soru: adaptDoc(snapshot)})
  }

  )
}

)

app.get("/sor", (req, res) => { })

app.post("soru", (req, res) => {

})
