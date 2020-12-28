"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    let datos2 = await require('../graphql/queries').getLocalStatistics("", { token: req.body.token, territorio: req.body.territorio });
    res.json(datos2);
});
module.exports = router;
