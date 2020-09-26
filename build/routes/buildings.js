"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//import { auth } from '../controllers/auth';
//const Vivienda = require('../model/Vivienda');
//const User = require('../model/User');
//const Mayor = require('../model/Mayor');
//const passport = require('passport');
//const env = require('../env.json');
router.get('/territorios', async (req, res) => {
    let territorios = [];
    for (let i = 1; i <= 56; i++) {
        territorios.push(i);
    }
    res.json({ territorios });
});
router.get('/getBuildings/:terri', async (req, res) => {
    let unterritorio = [
        {
            "_id": "5f1cf04e21b796c4c63865fd",
            "inner_id": "19",
            "cuadra_id": "1",
            "territorio": "1",
            "manzana": "1",
            "direccion": "Concordia 65 5 B",
            "telefono": "54-11-4611-4645",
            "estado": "No predicado"
        }, {
            "_id": "5f1cf04e21b796c4c63865fc",
            "inner_id": "18",
            "cuadra_id": "1",
            "territorio": "1",
            "manzana": "1",
            "direccion": "Concordia 65 4 A",
            "telefono": "54-11-4611-4716",
            "estado": "Contestó",
            "fechaUlt": "1595883537971",
            "noAbonado": false,
            "observaciones": ""
        }, {
            "_id": "5f1cf04e21b796c4c63865fa",
            "inner_id": "16",
            "cuadra_id": "1",
            "territorio": "1",
            "manzana": "1",
            "direccion": "Concordia 65 3 A",
            "telefono": "54-11-4612-3867",
            "estado": "Contestó",
            "fechaUlt": "1595883532288",
            "noAbonado": false,
            "observaciones": ""
        }
    ];
    console.log(unterritorio);
    res.status(200).json({ unterritorio });
});
router.get('/territorios/:terri/:manzana/nopred', async (req, res) => { res.send("territorios"); });
router.get('/estadisticas', async (req, res) => { res.send("estadisticas"); });
router.get('/estadisticas/:terri', async (req, res) => { res.send("estadisticas"); });
router.post('/agregarVivienda', async (req, res) => { res.send("agregarVivienda"); });
router.get('/revisitas', async (req, res) => { res.send("revisitas"); });
module.exports = router;
