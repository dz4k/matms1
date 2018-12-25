//@ts-check
const express = require("express"),
  cors = require("cors"),
  admin = require('firebase-admin'),
  bodyParser = require("body-parser"),
  mjpage = require("mathjax-node-page"),
  pug = require("pug")

let serviceAccount = process.env.SERVICEACCOUNT.startsWith("{") ?
  JSON.parse(process.env.SERVICEACCOUNT) :
  process.env.SERVICEACCOUNT
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
 * @type {Map<String, Object[]>}
 */
let yanitlarDepo = new Map()

/**
 * 
 * @param {FirebaseFirestore.DocumentSnapshot} belge 
 * @returns {Promise} arayüz için veri
 */
async function belgeUyarla(belge) {
  return {
    ...belge.data(),
    id: belge.ref.id,
    yanitlar: yanitlarDepo.has(belge.ref.id)
      ? yanitlarDepo.get(belge.ref.id)
      : await belge.ref.collection("Yanıtlar")
        .orderBy("Zaman", "desc")
        .get()
        .then(refler => {
          let rv = refler.docs.map(snapshot => snapshot.data())
          yanitlarDepo.set(belge.ref.id, rv)
          return rv
        })
  }
}

let sorular
db.collection("Sorular").orderBy("Zaman", "desc").onSnapshot(
  async (snapshot) => {
    sorular = await Promise.all(snapshot.docs.map(belgeUyarla))
  })



const app = express()
const sunucu = app.listen(process.env.PORT)

app.use(express.static('wwwroot'))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', './views')
app.set('view engine', 'pug')

let indexTemplate = pug.compileFile(__dirname + "\\views\\index.pug", { cache: true })
let sorularTemplate = pug.compileFile(__dirname + "\\views\\sorular.pug")
let soruTemplate = pug.compileFile(__dirname + "\\views\\soru.pug")

mjpage.init()

app.get("/", (req, res) => {
  res.send(indexTemplate({}))
})

app.get("/sorular", (req, res) => {
  let compiled = sorularTemplate({ sorular: sorular })
  mjpage.mjpage(compiled, { format: ["AsciiMath"], output: "html" }, {}, mjrendered => {
    res.send(mjrendered)
  })
})

app.get("/soru", (req, res) => {
  db.collection("Sorular")
    .doc(req.query.id).get().then(async (snapshot) => {
      if (!snapshot.data) return res.status(404);
      let rendered = soruTemplate({ soru: await belgeUyarla(snapshot) })
      mjpage.mjpage(rendered,
        { format: ["AsciiMath"], output: "html" }, {}, sonuç => res.send(sonuç))
    })
})

app.post("/soru", (req, res) => {
  if (!req.body ||
    typeof req.body["Yazan"] !== "string" ||
    typeof req.body["İçerik"] !== "string"
  ) {
    return res.send(400 /*Bad Request*/)
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