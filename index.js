const express = require("express")


// TODO: everything

console.log("[]Starting")
const app = express()
const server = app.listen(3000)

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static("wwwroot"))

app.get("/", (req, res) => 
  res.render(
    __dirname+"/views/index.pug", {}
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
