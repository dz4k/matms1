const express = require("express")
const mathjax = require("mathjax-node-svg2png")

console.log("[]Starting")
const app = express()
const server = app.listen(3000)

app.use(express.static("home"))

function toImg(a) {
  return "<img src=\""+data.png+"\">"

}
mathjax.typeset({
  math: "a/b^4",
  format: "AsciiMath",
  png: true
}).then(data => console.log(data))

app.get("/render/", (req, res) => {
  mathjax.typeset({
    math: req.query.math,
    format: "AsciiMath",
    png: true
  }).then(data => {
    res.send(toImg(data.png))
  })
})