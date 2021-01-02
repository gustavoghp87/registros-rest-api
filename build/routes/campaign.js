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
router.post('/getCampaign', async (req, res) => {
    const packs = await functions.getCampaign(req.body.token);
    res.json(packs);
});
router.post('/asign', async (req, res) => {
    const asign = await functions.asignCampaign(req.body.token, req.body.id, req.body.email);
    if (asign)
        res.json({ success: true });
    else
        res.json({ success: false });
});
router.post('/getPack', async (req, res) => {
    const pack = await functions.getPack(parseInt(req.body.id));
    res.json(pack);
});
router.post('/clickBox', async (req, res) => {
    const task = await functions.clickBox(req.body.token, req.body.tel, req.body.id, req.body.checked);
    if (task)
        res.json({ success: true });
    else
        res.json({ success: false });
});
module.exports = router;
