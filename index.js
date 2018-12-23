//@ts-check
const express = require("express"),
  admin = require('firebase-admin'),
  // @ts-ignore
  //serviceAccount = require("../serviceAccount.json"),
  serviceAccount = JSON.parse(process.env.SERVICEACCOUNT),
  bodyParser = require("body-parser")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mat-ms.firebaseio.com"
})

const db = admin.firestore()
db.settings({
  timestampsInSnapshots: true
})

// Sunucu

/**
 * 
 * @param {FirebaseFirestore.DocumentSnapshot} belge 
 * @returns {Promise} arayüz için veri
 */
async function adaptDoc(belge) {
  return {
    ...belge.data(),
    id: belge.ref.id,
    yanitlar: await belge.ref.collection("Yanıtlar")
      .orderBy("Zaman", "desc")
      .get()
      .then(refler =>
        refler.docs.map(snapshot => snapshot.data()))
  }
}

const app = express()
const sunucu = app.listen(process.env.PORT)

app.use(express.static('wwwroot'))
app.use(bodyParser.urlencoded())
app.set('views', './views')
app.set('view engine', 'pug')

app.get("/", (req, res) => {
  db.collection("Sorular").orderBy("Zaman", "desc").get().then(
    (snapshot) => {
      let belgeler = snapshot.docs.map(adaptDoc)
      Promise.all(belgeler).then(sorular =>
        res.render(__dirname + "/views/index.pug", {
          sorular
        })
      )
    }
  )
})

app.get("/soru", (req, res) => {
    db.collection("Sorular")
    .doc(req.query.id).get().then((snapshot) => {
        if (!snapshot.data) return res.status(404);
        adaptDoc(snapshot).then((soru) => {
          res.render(__dirname + "/views/soru.pug", {soru})
        })
      }
    )
  }
)

app.post("/soru", (req, res) => {
  if (!req.body || 
    typeof req.body["Yazan"] !== "string" || 
    typeof req.body["İçerik"] !== "string"
  ) {
    return res.send(400/*Bad Request*/)
  }
  db.collection("Sorular").add({
    "Yazan": req.body["Yazan"],
    "İçerik": req.body["İçerik"],
    "Zaman": admin.firestore.Timestamp.now()
  })
  res.status(200)
  res.redirect("back")
})

app.post("/yanitla", (req, res) => {
  if (
    !req.query.id ||
    typeof req.body["Yazan"] !== "string" ||
    typeof req.body["İçerik"] !== "string"
  ) {
    return res.status(400)
  }
  db.collection("Sorular")
  .doc(req.query.id)
    .collection("Yanıtlar").add({
      "Yazan": req.body["Yazan"],
      "İçerik": req.body["İçerik"],
      "Zaman": admin.firestore.Timestamp.now()
    })
  res.status(200)
  res.redirect("back")
})
