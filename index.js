const express = require("express")
const mathjax = require("mathjax-node-svg2png")

console.log("[]Starting")
const app = express()
const server = app.listen(3000)

app.get("/", (req, res) => 
  res.sendFile(
    __dirname+"public/index.html"
  )
)

function typeset(math, callback) {
  mathjax.typeset({
     math: req.query.math,
     format: "AsciiMath",
     png: true
   }).then(data => callback(toImg(data.png)))
}

function toImg(a) {
  return "<img src=\""+a+"\">"

}

app.get("/render/", (req, res) => {
  typeset(req.query.math, res.send)
})