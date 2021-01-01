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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const functions = __importStar(require("../controllers/functions"));
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
router
    .post('/auth', auth_1.auth, (req, res) => {
    try {
        let userData = {
            _id: req.user._id,
            role: req.user.role,
            email: req.user.email,
            password: req.user.password,
            estado: req.user.estado,
            group: req.user.group,
            asign: req.user.asign,
            isAuth: true,
            isAdmin: req.user.role == 1 ? true : false,
            darkMode: req.user.darkMode
        };
        res.status(200).json(userData);
    }
    catch {
        let userData = {
            isAuth: false
        };
        res.status(200).json({ userData });
    }
})
    .post('/login', async (req, res) => {
    const email = req.body.email || "";
    const password = req.body.password || "";
    const recaptchaToken = req.body.recaptchaToken || "";
    console.log("Entra en login", email, recaptchaToken);
    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken);
    if (!checkRecaptch)
        return res.status(200).json({ loginSuccess: false, recaptchaFails: true });
    const user = await functions.searchUserByEmail(email);
    if (!user)
        return res.status(200).json({ loginSuccess: false });
    if (!user.estado)
        return res.status(200).json({ loginSuccess: false, disable: true });
    const compare = await bcrypt_1.default.compare(password, user.password);
    if (compare) {
        const jwt_string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf";
        const newtoken = await jsonwebtoken_1.default.sign({ userId: user._id }, jwt_string, { expiresIn: '2160h' });
        const addToken = await functions.addTokenToUser(user.email, newtoken);
        if (!addToken)
            res.status(200).json({ loginSuccess: false });
        res.json({ loginSuccess: true, newtoken });
    }
    else
        res.status(200).json({ loginSuccess: false });
})
    .post('/logout', auth_1.auth, async (req, res) => {
    try {
        const done = await functions.addTokenToUser(req.user.email, "");
        if (done)
            res.status(200).json({ response: "ok" });
        else
            res.status(200).json({ response: "Falló cerrar sesión" });
    }
    catch {
        res.status(200).json({ response: "Falló cerrar sesión" });
    }
})
    .post('/register', async (req, res) => {
    const email = req.body.email || "";
    const password = req.body.password || "";
    const group = req.body.group || 0;
    const recaptchaToken = req.body.recaptchaToken || "";
    if (!email || !password || !group || !recaptchaToken)
        return res.status(200).json({ regSuccess: false });
    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken);
    if (!checkRecaptch)
        return res.status(200).json({ regSuccess: false, recaptchaFails: true });
    const busq = await functions.searchUserByEmail(email);
    if (busq)
        return res.status(200).json({ regSuccess: false, userExists: true });
    const register = await functions.registerUser(email, password, group);
    if (!register)
        return res.json({ regSuccess: false });
    res.status(200).json({ regSuccess: true });
})
    .post('/change-mode', async (req, res) => {
    const token = req.body.token.split('=')[1];
    const user = await functions.searchUserByToken(token);
    if (!user)
        return res.json({ success: false });
    try {
        functions.changeMode(user.email, req.body.darkMode);
        res.json({ success: true, darkMode: req.body.darkMode });
    }
    catch (e) {
        console.log(e);
        res.json({ success: false });
    }
});
module.exports = router;
