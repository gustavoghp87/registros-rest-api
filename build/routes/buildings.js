"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const functions_1 = require("../controllers/functions");
const router = express_1.default.Router();
const { auth } = require('../controllers/auth');
router
    .post('/territorios', auth, async (req, res) => {
    let territorios = req.user.asign;
    res.json({ territorios });
})
    .post('/getBuildings/:terri', async (req, res) => {
    const territorio = await functions_1.searchBuildingsByNumber(req.params.terri);
    let unterritorio = territorio;
    res.status(200).json({ unterritorio });
})
    .get('/territorios/:terri/:manzana/nopred', async (req, res) => { res.send("territorios"); })
    .get('/estadisticas', async (req, res) => { res.send("estadisticas"); })
    .get('/estadisticas/:terri', async (req, res) => { res.send("estadisticas"); })
    .post('/agregarVivienda', async (req, res) => { res.send("agregarVivienda"); })
    .get('/revisitas', async (req, res) => { res.send("revisitas"); });
module.exports = router;
