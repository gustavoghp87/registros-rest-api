import express, { Response, Request } from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()
import { searchUserByEmail, addTokenToUser } from '../controllers/functions';
// import { cors, corsOptions } from '../server';
const { auth } = require('../controllers/auth');
import { IUser } from "../types/types";
import cookieParser from 'cookie-parser';
require('../types/types')


router.post('/register', async (_:any, res:any) => {res.json()});


router.post('/auth', auth, (req:any, res:any) => {

    try {
        let userData:IUser = {
            _id: req.user._id,
            role: req.user.role,
            email: req.user.email,
            password: req.user.password,
            estado: req.user.estado,
            actividad: req.user.actividad,
            group: req.user.group,
            asign: req.user.asign,
            isAuth: true
        };
        //console.log(userData);

        res.status(200).json(userData)

    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false
        };
        res.status(200).json({userData})
    };

});



router.post('/login', async (req:any, res:any) => {

    console.log(req.body);
    
    
    const email = req.body.email || "";
    const password = req.body.password || "";

    const user = await searchUserByEmail(email);

    if (!user) res.status(200).json({loginSuccess:false})

    const compare = await bcrypt.compare(password, user.password)
    console.log("COMPARE:", compare);

    const jwt_string:string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf";

    if (compare) {
        const newtoken = await jwt.sign(
            {userId: user._id },
            jwt_string,
            { expiresIn: '2160h' }
        ).slice(-50);
        console.log("\n\nToken creado:", newtoken);
        await addTokenToUser(user.email, newtoken);

       // res.cookie("w_authExp", 160000000);
        res
            //.cookie("newtoken", newtoken, {signed:false, httpOnly:false})
            .json({loginSuccess: true, newtoken});

    } else {
        console.log("Mal password ...........");
        res.status(200).json({loginSuccess:false});
    };
});


router.post('/logout', auth, async (req:any, res:any) => {
    try {
        // console.log("COOKIE AL SALIR", req.cookies.newtoken);
        const done = await addTokenToUser(req.user.email, "");
        if (done)
            res
                //.cookie("newtoken", "")
                .status(200)
                .json({response:"ok"});
        res.status(200).json({response:"Falló cerrar sesión"});
    } catch {
        res.status(200).json({response:"Falló cerrar sesión"});
    }
});


module.exports = router;
