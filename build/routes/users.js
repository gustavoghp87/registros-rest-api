"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const database_1 = require("../controllers/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//const Vivienda = require('../model/Vivienda');
//const User = require('../model/User');
//const Mayor = require('../model/Mayor');
//const passport = require('passport');
//const env = require('../env.json');
const searchUserByEmail = (email) => {
    const User = database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ email });
    return User;
};
const searchUserByToken = (newToken) => {
    const User = database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ newToken });
    return User;
};
const addTokenToUser = (email, token) => {
    try {
        database_1.client.db("Misericordia-Web").collection('usuarios').updateOne({ email }, { $set: { newToken: token } });
        return true;
    }
    catch {
        return false;
    }
};
router.post('/register', async (_, res) => { res.send("Register"); });
const auth = async (req, res, next) => {
    // recibe usuario, se busca el token en cookie en la db
    // si es afirmativo, se colocan user y token en req,  y next
    // const user = await searchUserByToken(req.cookie.newToken);
    // if (user) {
    //     req.user = user;
    //     req.token = req.cookie.newToken;
    //     next();
    // }
};
router.get('/auth', async (req, res) => {
    console.log("PASANDO POR /AUTH cookies....", req.cookies);
    try {
        const user = await searchUserByToken(req.cookies.newToken);
        if (user) {
            let userData = {
                _id: user._id,
                isAdmin: user.role === 1 ? true : false,
                isAuth: true,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                role: user.role,
                image: user.image,
                cart: user.cart,
                history: user.history
            };
            res.status(200).json({ userData });
        }
        else {
            res.status(200).json({ isAuth: false });
        }
    }
    catch {
        console.log("Error al pasar por /auth");
    }
    ;
});
router.post('/login', async (req, res) => {
    const email = req.body.body || "";
    const password = req.body.password || "";
    console.log(email, password);
    const user = await searchUserByEmail(req.body.email);
    if (!user)
        res.status(200).json({ loginSuccess: false });
    console.log(user.password);
    const compare = await bcrypt_1.default.compare(password, user.password);
    //const compare = await user.comparePassword(req.body.password)
    console.log(compare);
    const jwt_string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfb354fab2sdf";
    if (compare) {
        const newToken = await jsonwebtoken_1.default.sign({ userId: user._id }, jwt_string, { expiresIn: '2160h' });
        console.log(newToken);
        addTokenToUser(user.email, newToken);
        res.cookie("newToken", newToken, { maxAge: 1000 * 60 * 10, httpOnly: false }).status(200).json({ loginSuccess: true });
    }
    else {
        console.log("Mal password ...........");
        res.status(200).json({ loginSuccess: false });
    }
    ;
});
router.get('/logout', async (req, res) => {
    try {
        console.log("COOKIE AL SALIR", req.cookies);
        const done = await addTokenToUser(req.cookies.newToken, "");
        res.status(200).json({ response: "ok" });
    }
    catch {
        res.status(200).json({ response: "Falló cerrar sesión" });
    }
});
module.exports = router;
