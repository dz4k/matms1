"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express"), cors = require("cors"), admin = require('firebase-admin'), bodyParser = require("body-parser"), mjpage = require("mathjax-node-page"), pug = require("pug"), path = require("path");
var serviceAccount = process.env.SERVICEACCOUNT.startsWith("{") ?
    JSON.parse(process.env.SERVICEACCOUNT) :
    process.env.SERVICEACCOUNT;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mat-ms.firebaseio.com"
});
var db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});
// Sunucu
var yanitlarDepo = new Map();
function belgeUyarla(belge) {
    return __awaiter(this, void 0, void 0, function () {
        function yanitlarOku(snapshot) {
            var rv = snapshot.docs.map(function (ref) { return ref.data(); });
            yanitlarDepo.set(belge.ref.id, rv);
            return rv;
        }
        var yanitlar, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!yanitlarDepo.has(belge.ref.id)) return [3 /*break*/, 1];
                    yanitlar = yanitlarDepo.get(belge.ref.id);
                    return [3 /*break*/, 3];
                case 1:
                    query = belge.ref.collection("Yanıtlar")
                        .orderBy("Zaman", "desc");
                    return [4 /*yield*/, query.get().then(yanitlarOku)];
                case 2:
                    yanitlar = _a.sent();
                    query.onSnapshot(yanitlarOku);
                    _a.label = 3;
                case 3: return [2 /*return*/, __assign({}, belge.data(), { id: belge.ref.id, yanitlar: yanitlar })];
            }
        });
    });
}
var sorular;
db.collection("Sorular").orderBy("Zaman", "desc").onSnapshot(function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(snapshot.docs.map(belgeUyarla))];
            case 1:
                sorular = _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var app = express();
var sunucu = app.listen(process.env.PORT);
app.use(express.static('wwwroot'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'pug');
var s = path.sep;
var indexTemplate = pug.compileFile(__dirname + (s + "views" + s + "index.pug"), { cache: true });
var sorularTemplate = pug.compileFile(__dirname + (s + "views" + s + "sorular.pug"));
var soruTemplate = pug.compileFile(__dirname + (s + "views" + s + "soru.pug"));
mjpage.init();
app.get("/", function (req, res) {
    var compiled = indexTemplate({});
    mjpage.mjpage(compiled, { format: ["AsciiMath"], output: "html" }, {}, function (mjrendered) {
        res.send(mjrendered);
    });
});
app.get("/sorular", function (req, res) {
    if (!sorular)
        return res.send("");
    var compiled = sorularTemplate({ sorular: sorular });
    mjpage.mjpage(compiled, { format: ["AsciiMath"], output: "html", cssInline: false }, { linebreaks: true }, function (mjrendered) {
        res.send(mjrendered);
    });
});
app.get("/soru", function (req, res) {
    db.collection("Sorular")
        .doc(req.query.id).get().then(function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
        var rendered, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!snapshot.data)
                        return [2 /*return*/, res.status(404)];
                    _a = soruTemplate;
                    _b = {};
                    return [4 /*yield*/, belgeUyarla(snapshot)];
                case 1:
                    rendered = _a.apply(void 0, [(_b.soru = _c.sent(), _b)]);
                    mjpage.mjpage(rendered, { format: ["AsciiMath"], output: "html" }, {}, function (sonuç) { return res.send(sonuç); });
                    return [2 /*return*/];
            }
        });
    }); });
});
app.post("/soru", function (req, res) {
    if (!req.body ||
        typeof req.body["Yazan"] !== "string" ||
        typeof req.body["İçerik"] !== "string") {
        return res.send(400 /*Bad Request*/);
    }
    db.collection("Sorular").add({
        "Yazan": req.body["Yazan"],
        "İçerik": req.body["İçerik"],
        "Zaman": admin.firestore.Timestamp.now()
    });
    res.status(200);
    res.redirect("back");
});
app.post("/yanitla", function (req, res) {
    if (!req.query.id ||
        typeof req.body["Yazan"] !== "string" ||
        typeof req.body["İçerik"] !== "string") {
        return res.status(400);
    }
    db.collection("Sorular")
        .doc(req.query.id)
        .collection("Yanıtlar").add({
        "Yazan": req.body["Yazan"],
        "İçerik": req.body["İçerik"],
        "Zaman": admin.firestore.Timestamp.now()
    });
    res.status(200);
    res.redirect("back");
});
//# sourceMappingURL=index.js.map