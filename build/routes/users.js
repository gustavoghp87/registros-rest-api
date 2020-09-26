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
const searchUserByToken = (newtoken) => {
    const User = database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ newtoken });
    return User;
};
const addTokenToUser = (email, token) => {
    try {
        database_1.client.db("Misericordia-Web").collection('usuarios').updateOne({ email }, { $set: { newtoken: token } });
        console.log(("Token agregado a db correctamente"));
        return true;
    }
    catch (error) {
        console.log("Error al intentar agregar token a db...", error);
        return false;
    }
};
router.post('/register', async (_, res) => { res.send("Register"); });
const auth = async (req, res, next) => {
    // recibe usuario, se busca el token en cookie en la db
    // si es afirmativo, se colocan user y token en req,  y next
    // const user = await searchUserByToken(req.cookie.newtoken);
    // if (user) {
    //     req.user = user;
    //     req.token = req.cookie.newtoken;
    //     next();
    // }
};
router.get('/auth', async (req, res) => {
    let token = req.cookies.newtoken || "abcde";
    console.log("PASANDO POR /AUTH cookies....", req.cookies.newtoken, req.newtoken, token);
    console.log(req.cookies, req.headers.newtoken);
    try {
        const user = await searchUserByToken(token);
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
            console.log("USUARIO NO ENCONTRADO POR TOKEN");
            res.status(200).json({ isAuth: false });
        }
    }
    catch {
        console.log("Error 1 al pasar por /auth", token);
        try {
            console.log("Error 2 al pasar por /auth", token);
        }
        catch { }
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
        const newtoken = await jsonwebtoken_1.default.sign({ userId: user._id }, jwt_string, { expiresIn: '2160h' });
        console.log(newtoken);
        addTokenToUser(user.email, newtoken);
        req.user = user;
        //req.cookies.newtoken = newtoken;
        res
            .cookie("newtoken", newtoken)
            .status(200)
            .json({ loginSuccess: true });
        try {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!", req.cookies.newtoken);
        }
        catch (e) {
            console.error("No se pudo cargar cookie", e);
        }
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
        const done = await addTokenToUser("ghp.2120@gmail.com", "");
        res.status(200).json({ response: "ok" });
    }
    catch {
        res.status(200).json({ response: "Falló cerrar sesión" });
    }
});
module.exports = router;
