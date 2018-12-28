import * as express from "express"
import * as admin from 'firebase-admin'
import { QuerySnapshot, DocumentData, DocumentSnapshot } from "@google-cloud/firestore"
import * as bodyParser from "body-parser"
import * as mjpage from "mathjax-node-page"
import * as pug from "pug"
import * as path from "path"
import compression from "compression"


let serviceAccount = process.env.SERVICEACCOUNT[0] == "{" ?
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

async function belgeUyarla(belge: DocumentSnapshot) {
  return {
    ...belge.data(),
    id: belge.ref.id,
    yanitlar: await belge.ref.collection("Yanıtlar")
      .orderBy("Zaman", "desc")
      .get()
      .then(yanitlarOku)
  }

  function yanitlarOku(snapshot: QuerySnapshot): DocumentData[] {
    return snapshot.docs.map(doc => doc.data())
  }
}

let sorular: Object[]
db.collection("Sorular").orderBy("Zaman", "desc").onSnapshot(
  async (snapshot) => {
    sorular = await Promise.all(snapshot.docs.map(belgeUyarla))
  })



const app: express.Express = express()
const sunucu = app.listen(process.env.PORT)

app.use(express.static('wwwroot'))
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', './views')
app.set('view engine', 'pug')

let s = path.sep

let indexTemplate = pug.compileFile(__dirname + `${s}views${s}index.pug`, { cache: true })
let sorularTemplate = pug.compileFile(__dirname + `${s}views${s}sorular.pug`)
let soruTemplate = pug.compileFile(__dirname + `${s}views${s}soru.pug`)

app.get("/", (req, res) => {
  let compiled = indexTemplate({})
  mjpage.mjpage(compiled,
    { format: ["AsciiMath"], output: "html" },
    {}, mjrendered => {
      res.send(mjrendered)
    })
})

app.get("/sorular", (req, res) => {
  if (!sorular) return res.send("")
  let compiled = sorularTemplate({ sorular: sorular })
  mjpage.mjpage(compiled,
    { format: ["AsciiMath"], output: "html", cssInline: false },
    { linebreaks: true },
    mjrendered => {
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