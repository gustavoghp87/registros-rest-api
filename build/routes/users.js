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
const router = express_1.default.Router();
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const functions = __importStar(require("../controllers/functions"));
const auth_1 = require("../controllers/auth");
router
    .post('/auth', auth_1.auth, (req, res) => {
    try {
        let userData = {
            _id: req.user._id,
            role: req.user.role,
            email: req.user.email,
            password: req.user.password,
            estado: req.user.estado,
            actividad: req.user.actividad,
            group: req.user.group,
            asign: req.user.asign,
            isAuth: true,
            isAdmin: req.user.role == 1 ? true : false
        };
        res.status(200).json(userData);
    }
    catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false
        };
        res.status(200).json({ userData });
    }
})
    .post('/login', async (req, res) => {
    console.log(req.body);
    const email = req.body.email || "";
    const password = req.body.password || "";
    const recaptchaToken = req.body.recaptchaToken || "";
    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken);
    if (!checkRecaptch)
        return res.status(200).json({ loginSuccess: false, recaptchaFails: true });
    const user = await functions.searchUserByEmail(email);
    if (!user)
        return res.status(200).json({ loginSuccess: false });
    if (user.estado !== "activado")
        return res.status(200).json({ loginSuccess: false, disable: true });
    const compare = await bcrypt_1.default.compare(password, user.password);
    console.log("COMPARE:", compare);
    const jwt_string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf";
    if (compare) {
        const newtoken = await jsonwebtoken_1.default.sign({ userId: user._id }, jwt_string, { expiresIn: '2160h' }).slice(-70);
        console.log("\n\nToken creado:", newtoken);
        await functions.addTokenToUser(user.email, newtoken);
        // res.cookie("w_authExp", 160000000);
        res
            //.cookie("newtoken", newtoken, {signed:false, httpOnly:false})
            .json({ loginSuccess: true, newtoken });
    }
    else {
        console.log("Mal password ...........");
        res.status(200).json({ loginSuccess: false });
    }
})
    .post('/logout', auth_1.auth, async (req, res) => {
    try {
        // console.log("COOKIE AL SALIR", req.cookies.newtoken);
        const done = await functions.addTokenToUser(req.user.email, "");
        if (done)
            res
                //.cookie("newtoken", "")
                .status(200)
                .json({ response: "ok" });
        else
            res.status(200).json({ response: "Falló cerrar sesión" });
    }
    catch {
        res.status(200).json({ response: "Falló cerrar sesión" });
    }
})
    .post('/getUsers', auth_1.admin, async (req, res) => {
    const users = await functions.searchAllUsers();
    res.status(200).json({ users });
})
    .post('/register', async (req, res) => {
    console.log(req.body);
    const email = req.body.email || "";
    const password = req.body.password || "";
    const group = req.body.group || 0;
    const recaptchaToken = req.body.recaptchaToken || "";
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
});
module.exports = router;
