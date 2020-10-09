"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const functions = __importStar(require("../controllers/functions"));
const router = express_1.default.Router();
const { auth } = require('../controllers/auth');
router
    .post('/territorios', auth, async (req, res) => {
    let territorios = req.user.asign;
    res.json({ territorios });
})
    .post('/getBuildings/:terri', async (req, res) => {
    const territorio = await functions.searchTerritoryByNumber(req.params.terri, "1");
    let unterritorio = territorio;
    res.status(200).json({ unterritorio });
})
    .get('/territorios/:terri/:manzana/nopred', async (req, res) => { res.send("territorios"); })
    .get('/estadisticas', async (req, res) => { res.send("estadisticas"); })
    .get('/estadisticas/:terri', async (req, res) => { res.send("estadisticas"); })
    .post('/agregarVivienda', async (req, res) => { res.send("agregarVivienda"); })
    .get('/revisitas', async (req, res) => { res.send("revisitas"); });
module.exports = router;
