import express, { NextFunction } from 'express';
const router = express.Router();
import { client } from '../controllers/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

//const Vivienda = require('../model/Vivienda');
//const User = require('../model/User');
//const Mayor = require('../model/Mayor');
//const passport = require('passport');
//const env = require('../env.json');


const searchUserByEmail = (email:string) => {
    const User = client.db("Misericordia-Web").collection('usuarios').findOne({email});
    return User;
};

const searchUserByToken = (newToken:string) => {
    const User = client.db("Misericordia-Web").collection('usuarios').findOne({newToken});
    return User
};

const addTokenToUser = (email:string, token:string) => {
    try {
        client.db("Misericordia-Web").collection('usuarios').updateOne({email}, {$set:{newToken:token}});
        return true
    } catch {
        return false
    }
};

interface IUser {
    _id: Object
    role: number
    estado: string
    actividad: Object[]
    email: string
    password: string
    __v?: number
    group: number
}

router.post('/register', async (_, res) => {res.send("Register")});

const auth = async (req:Request, res:Response, next:NextFunction) => {
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
            }
            res.status(200).json({userData})
        } else {
            res.status(200).json({isAuth: false});
        }
    } catch {
        console.log("Error al pasar por /auth");
    };
});



router.post('/login', async (req, res) => {
    
    const email = req.body.body || "";
    const password = req.body.password || "";
    
    console.log(email, password);

    const user = await searchUserByEmail(req.body.email);

    if (!user) res.status(200).json({loginSuccess:false})

    console.log(user.password);

    const compare = await bcrypt.compare(password, user.password)
    //const compare = await user.comparePassword(req.body.password)
    console.log(compare);

    const jwt_string:string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfb354fab2sdf";

    if (compare) {
        const newToken = await jwt.sign(
            {userId: user._id },
            jwt_string,
            { expiresIn: '2160h' }
        )
        console.log(newToken);
        addTokenToUser(user.email, newToken);

        res.cookie("newToken", newToken,{maxAge:1000*60*10, httpOnly: false }).status(200).json({loginSuccess: true});

    } else {
        console.log("Mal password ...........");
        res.status(200).json({loginSuccess: false});
    };

});

router.get('/logout', async (req, res) => {
    try {
        console.log("COOKIE AL SALIR", req.cookies);
        
        const done = await addTokenToUser(req.cookies.newToken, "");
        res.status(200).json({response:"ok"});
    } catch {
        res.status(200).json({response:"Falló cerrar sesión"});
    }
});


module.exports = router;
