const express = require("express")


// TODO: everything

console.log("[]Starting")
const app = express()
const server = app.listen(3000)

app.get("/", (req, res) => 
  res.sendFile(
    __dirname+"/public/index.html"
  )
)

app.get("/soru/", (req, res) => 
  res.sendFile(
    __dirname+"/public/soru.html"
  )
)
