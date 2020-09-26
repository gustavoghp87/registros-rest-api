"use strict";
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
const functions_1 = require("../controllers/functions");
const { auth } = require('../controllers/auth');
;
router.post('/register', async (_, res) => { res.json(); });
router.get('/auth', auth, async (req, res) => {
    try {
        let userData = {
            _id: req.user._id,
            role: req.user.role,
            email: req.user.email,
            password: req.user.password,
            estado: req.user.estado,
            actividad: req.user.actividad,
            group: req.user.group,
            isAuth: true
        };
        //console.log(userData);
        res.status(200).json({ userData });
    }
    catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false
        };
        res.status(200).json({ userData });
    }
    ;
});
router.post('/login', async (req, res) => {
    const email = req.body.body || "";
    const password = req.body.password || "";
    console.log(email, password);
    const user = await functions_1.searchUserByEmail(req.body.email);
    if (!user)
        res.status(200).json({ loginSuccess: false });
    console.log(user.password);
    const compare = await bcrypt_1.default.compare(password, user.password);
    //const compare = await user.comparePassword(req.body.password)
    console.log(compare);
    const jwt_string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf";
    if (compare) {
        const newtoken = await jsonwebtoken_1.default.sign({ userId: user._id }, jwt_string, { expiresIn: '2160h' });
        console.log("\n\nToken creado:", newtoken);
        functions_1.addTokenToUser(user.email, newtoken);
        res
            .cookie("newtoken", newtoken)
            .status(200)
            .json({ loginSuccess: true });
    }
    else {
        console.log("Mal password ...........");
        res.status(200).json({ loginSuccess: false });
    }
    ;
});
router.get('/logout', async (req, res) => {
    try {
        console.log("COOKIE AL SALIR", req.cookies.newtoken);
        // const done = await addTokenToUser(req.user.email, "");
        const done = await functions_1.addTokenToUser("ghp.2120@gmail.com", "");
        res.cookie("newtoken", "").status(200).json({ response: "ok" });
    }
    catch {
        res.status(200).json({ response: "Falló cerrar sesión" });
    }
});
module.exports = router;
