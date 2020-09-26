import express, { Response, Request } from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()
import { searchUserByEmail, searchUserByToken, addTokenToUser } from '../controllers/functions';
const { auth } = require('../controllers/auth');


interface IUser {
    _id: Object
    role: number
    estado: string
    actividad: Object[]
    email: string
    password: string
    __v?: number
    group: number
    isAuth?: boolean
};


router.post('/register', async (_:any, res:Response) => {res.json()});


router.get('/auth', auth, async (req:Request, res:Response) => {

    try {
        let userData:IUser = {
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

        res.status(200).json({userData})

    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false
        };
        res.status(200).json({userData})
    };

});



router.post('/login', async (req:Request, res) => {
    
    const email = req.body.body || "";
    const password = req.body.password || "";
    
    console.log(email, password);

    const user = await searchUserByEmail(req.body.email);

    if (!user) res.status(200).json({loginSuccess:false})

    console.log(user.password);

    const compare = await bcrypt.compare(password, user.password)
    //const compare = await user.comparePassword(req.body.password)
    console.log(compare);

    const jwt_string:string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf";

    if (compare) {
        const newtoken = await jwt.sign(
            {userId: user._id },
            jwt_string,
            { expiresIn: '2160h' }
        )
        console.log("\n\nToken creado:", newtoken);
        addTokenToUser(user.email, newtoken);

        res
            .cookie("newtoken", newtoken)
            .status(200)
            .json({loginSuccess: true});

    } else {
        console.log("Mal password ...........");
        res.status(200).json({loginSuccess: false});
    };

});

router.get('/logout', async (req, res) => {
    try {
        console.log("COOKIE AL SALIR", req.cookies.newtoken);
        
        // const done = await addTokenToUser(req.user.email, "");
        const done = await addTokenToUser("ghp.2120@gmail.com", "");
        res.cookie("newtoken", "").status(200).json({response:"ok"});
    } catch {
        res.status(200).json({response:"Falló cerrar sesión"});
    }
});


module.exports = router;
