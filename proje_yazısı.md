# MatMS: Matematik Dersinde Öğrenciler Arasında Yardımlaşma Aracı
## 1. Giriş

Öğrenciler akademik hedeflerine ulaşmak için sıkça sınıf arkadaşları ve çevrimiçi topluluklar ile yardımlaşır. Birbiri ile bilgi paylaşan veya zorlandığı konularda birbirine danışan öğrenciler derslerinde daha hızlı ilerleme kaydedebilir. İnternet üzerindeki yardımlaşma platformlarının yetersizlikleri öğrencilere ders çalışırken zorluk oluşturabilir.

Bu platformlar matematik ve diğer sayısal derslerde vazgeçilmez olan notasyonu desteklememektedir. Çoğu matematiksel sembolü kullanmak mümkün değildir. Bu duruma karşılık öğrenciler elle yazdıkları ifadelerin çekmekte veya düz metin üzerinden okunaksız ve standarda bağlı olmayan bir biçem kullanmaktadır. İletişim zorluğu ve zaman kaybı görülmektedir. Görme engelli öğrenciler için erişilebilir değildir.

Proje kapsamında mevcut öğrenci yardımlaşma platformlarının belirli kusurlarına çözüm sunulmuştur. Bu kusurlar yetersiz notasyon desteği, dikkat dağıtıcı veya kullanışsız arayüz olarak saptanmıştır.

### 1.1. Projenin Amacı

Projede öğrencilerin internet üzerinden yardımlaşırken ve bilgi alışverişi yaparken  iletişim zorluğu yaşamasına ve zaman kaybı veya dikkat dağınıklığı sorunlarına çözüm bulmak amaçlanmıştır. 

### 1.2. NodeJS

Node.js, JavaScript için bir çalıştırma ortamıdır. Durdurmayan G/Ç (İng. _non-blocking I/O_) desteğiyle asenkron programlamada kolaylık sağlar. Node.js, V8 JavaScript motorunu kullanır. Standart kütüphanesinde HTTP desteği bulundurduğundan ek bir sunucu yazılımına (Apache HTTP Sunucusu, Nginx, IIS vb.) gerektirmez. Node.js paket yöneticisi npm, dünyanın en büyük yazılım kayıt defteridir (İng. _registry_).

### 1.3. Express.js

Express.js veya Express, Node.js için özgür açık kaynak kodlu web çatısıdır. 16 Kasım 2010 tarihinde 	TJ Holowaychuk tarafından yayınlanmıştır. Web uygulaması veya API geliştirmek için kullanılabilir. Diğer pek çok çatının altyapısını oluşturur. 

### 1.5. MathJax

MathJax, matematiksel ifadelerin çizimi için bir JavaScript kütüphanesidir. Girdi olarak TeX, MathML ve AsciiMath; çıktı 
olarak HTML-CSS, SVG ve MathML formatlarını destekler. 

### 1.6. Pug

Pug, HTML için bir önişlemcidir (İng. _preprocessor_). Sunucu veya istemci tarafından derlenebilir. Gömülü JavaScript ifadelerini değerlendirebilir. `for` ve `if` direktifleri ile dinamik içerikli sayfalar oluşturmayı kolaylaştırır. Gramer yapısı kısa ve okunaklı olması için tasarlanmıştır. 

## 2. Yöntem

### 2.1 Proje Yapım Basamakları

__a. Veritabanı oluşturulması__

- a.1. Firebase kurulumu
- a.2. Admin SDK kurulumu

__b. Matematik yazımı__

- b.1. MathJax kütüphanesinin kurulumu
- b.2. MathJax'in Türkçeleştirilmesi
- b.3. Matematik yazımı için arayüz kodlanması

__c. Web sitesi__

- c.1. Anasayfa yapılması
- c.2. Soru görüntüleme sayfasının yapılması
- c.3. Arama özelliğinin eklenmesi
- c.4. Dinamik içeriğin küllanıcıya sunumu
- c.5. Soru sormak ve cevap vermek için yol oluşturulması

## 3. Bulgular ve Gerçekleşme

### 3.1 Veritabanı oluşturulması

#### a.1. Firebase kurulumu

#### a.2. Admin SDK kurulumu

### 3.2. Matematik yazımı

#### b.1. MathJax kütüphanesinin kurulumu

#### b.2. MathJax'in Türkçeleştirilmesi

#### b.3. Matematik yazımı için arayüz kodlanması

### 3.3. Web sitesi

#### c.1. Anasayfa yapılması

#### c.2. Soru görüntüleme sayfasının yapılması

#### c.3. Arama özelliğinin eklenmesi

#### c.4. Dinamik içeriğin küllanıcıya sunumu

#### c.5. Soru sormak ve cevap vermek için yol oluşturulması

### 3.4. Proje Kodlarının Açıklanması

#### 3.4.1 index.js

```javascript
const express = require("express"),
  admin = require('firebase-admin'),
  serviceAccount = require("../serviceAccount.json"),
  bodyParser = require("body-parser")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mat-ms.firebaseio.com"
})

const db = admin.firestore()
```
İlk iş olarak kullanılacak kütüphaneler belirtilir. Firebase ile bağlantı kurulur ve veritabanına erişilir. 

```javascript
async function belgeUyarla(belge) {
  return {
    ...belge.data(),
    id: belge.ref.id,
    yanitlar: (await belge.ref.collection("Yanıtlar")
      .listDocuments()
      .then(refler =>
        Promise.all(refler.map(ref => ref.get()))
      )).map(snapshot => snapshot.data())
  }
}
```
`belgeUyarla` fonksiyonunun amacı veritabanındaki belgelerden sayfada gösterilecek bilgileri çıkartmaktır.
Bu fonksiyon ileride kullanılacaktır.
```javascript
const app = express()
const sunucu = app.listen(3000)

app.use(express.static('wwwroot'))
app.use(bodyParser.urlencoded())
app.set('views', './views')
app.set('view engine', 'pug')
```
Express ile sunucu oluşturulur. POST isteklerinden form verilerini okumak için `bodyParser.urlEncoded` kullanılır.
```javascript
app.get("/", (req, res) => {
  db.collection("Sorular").get().then(
    (snapshot) => {
      let belgeler = snapshot.docs.map(belgeUyarla)
      Promise.all(belgeler).then(sorular =>
        res.render(__dirname + "/views/index.pug", {
          sorular
        })
      )
    }
  )
})
```
Anasayfaya erişildiğinde veritabanından sorular alınır. Soruların hepsinin uyarlanması beklenir. Son olarak sayfa oluşturulur ve kullanıcıya gönderilir.
```javascript
app.get("/soru/", (req, res) => {
    db.collection("Sorular")
    .doc(req.query.id).get().then((snapshot) => {
        if (!snapshot.data) return res.status(404);
        belgeUyarla(snapshot).then((soru) => {
          res.render(__dirname + "/views/soru.pug", {soru})
        })
      }
    )
  }
)
```
Kullanıcı belirli bir soruya tıkladığında bu rotaya erişir. İstenen soru mevcut değilse 404 hatası verilir. Aksi takdirde soru verilerini içeren belge uyarlanır ve sayfa oluşturulur.
```javascript
app.post("/soru", (req, res) => {
  if (!req.body || 
    typeof req.body["Yazan"] !== "string" || 
    typeof req.body["İçerik"] !== "string"
  ) {
    return res.send(400/*Bad Request*/)
  }
  db.collection("Sorular").add(req.body)
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
      "İçerik": req.body["İçerik"]
    })
  res.status(200)
  res.redirect("back")
})
```
Kullanıcı soru veya cevap yazıp "Gönder" butonuna bastığı zaman POST isteği yapılır. Sunucu bunun üzerine öncelikle istekte doğru verinin bulunup bulunmadığını kontrol der. Yok ise 400 (Bad Request) hatası ile cevap verir. Aksi takdirde soru veritabanına eklenir ve kullanıcı geri yönlendirilir.

### 3.5. Proje Ekran Görüntüleri

![Anasayfa](ekran_görüntüleri/2.png)

![Soru](ekran_görüntüleri/3.png)

## 4. Sonuçlar ve Tartışma

## 5. Öneriler

Kullanıcıları doğru cevap vermeye motive etmek için puan ve/veya rütbe sistemi eklenebilir. Doğru cevap veren öğrencilere ödül ve 
teşekkür amaçlı puan verilebilir.

Farklı sınıflar için ayrı odalar oluşturulabilir. Böylece kullanıcılar kendi seviyelerinde sorulara bakabilir. Benzer şekilde 
matematiğin farklı alt dalları ve konuları için de odalar yapılabilir.

Yapılan uygulama okullarda kullanılıp öğrencilerin kendi öğretmenleri ve sınıf arkadaşlarından yardım alması sağlanabilir.

Matematik dışında dersler için de özellikler eklenebilir. Örneğin kimya dersi için Lewis elektron nokta yapısı çizme özelliği 
eklenebilir. 

Yeni sorular soruldukça uygulamanın canlı olarak bu soruları göstermesi sağlanabilir.

## Kaynakça

Çalışkan, T., & Çınar, S. (2010). Akran Desteği: Öğrencilerin Sınıf Ortamı Ve Uygulama Alanlarında Birbirleriyle Yardımlaşma 
Durumlarının Değerlendirilmesi. _Maltepe Üniversitesi Hemşirelik Bilim ve Sanatı Dergisi, Sempozyum Özel Sayısı_, 226-233.

Senkpiel, J., (2016). Node v7.2.0 (Current). 16 Aralık 2018 tarihinde erişildi. [https://nodejs.org/en/blog/release/v7.2.0/]

_About npm_. NPM. 16 Aralık 2018 tarihinde erişildi. [https://www.npmjs.com/about].

Vorbach,P., npm-stat: download statistics for NPM packages. npm-stat. 16 Aralık 2018 tarihinde erişildi. [https://npm-stat.com/charts.html?package=express&from=1970-01-31&to=2018-12-03]
