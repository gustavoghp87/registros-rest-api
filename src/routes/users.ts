import express from 'express'
const router = express.Router()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'; dotenv.config()
import * as functions
    from '../controllers/functions'
import { auth, admin } from '../controllers/auth'
import { IUser } from '../types/types'


router

.post('/auth', auth, (req:any, res:any) => {

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
            isAuth: true,
            isAdmin: req.user.role=1 ? true : false
        }

        res.status(200).json(userData)

    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN")
        let userData = {
            isAuth: false
        }
        res.status(200).json({userData})
    }

})



.post('/login', async (req:any, res:any) => {

    console.log(req.body)
    
    const email = req.body.email || ""
    const password = req.body.password || ""
    const recaptchaToken = req.body.recaptchaToken || ""

    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken)
    if (!checkRecaptch) return res.status(200).json({loginSuccess:false, recaptchaFails:true})

    const user = await functions.searchUserByEmail(email)
    if (!user) return res.status(200).json({loginSuccess:false})
    if (user.estado!=="activado") return res.status(200).json({loginSuccess:false, disable:true})

    const compare = await bcrypt.compare(password, user.password)
    console.log("COMPARE:", compare)

    const jwt_string:string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"

    if (compare) {
        const newtoken = await jwt.sign(
            {userId: user._id },
            jwt_string,
            { expiresIn: '2160h' }
        ).slice(-70);
        console.log("\n\nToken creado:", newtoken)
        await functions.addTokenToUser(user.email, newtoken)

       // res.cookie("w_authExp", 160000000);
        res
            //.cookie("newtoken", newtoken, {signed:false, httpOnly:false})
            .json({loginSuccess: true, newtoken});

    } else {
        console.log("Mal password ...........")
        res.status(200).json({loginSuccess:false})
    }
})


.post('/logout', auth, async (req:any, res:any) => {
    try {
        // console.log("COOKIE AL SALIR", req.cookies.newtoken);
        const done = await functions.addTokenToUser(req.user.email, "")
        if (done)
            res
                //.cookie("newtoken", "")
                .status(200)
                .json({response:"ok"})
        else res.status(200).json({response:"Falló cerrar sesión"})
    } catch {
        res.status(200).json({response:"Falló cerrar sesión"})
    }
})


.post('/getUsers', admin, async (req:any, res:any) => {
    const users = await functions.searchAllUsers()    
    res.status(200).json({users})
})


.post('/register', async (req:any, res:any) => {

    console.log(req.body)
    
    const email = req.body.email || ""
    const password = req.body.password || ""
    const group = req.body.group || 0
    const recaptchaToken = req.body.recaptchaToken || ""

    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken)
    if (!checkRecaptch) return res.status(200).json({regSuccess:false, recaptchaFails:true})

    const busq = await functions.searchUserByEmail(email)
    if (busq) return res.status(200).json({regSuccess:false, userExists:true})

    const register = await functions.registerUser(email, password, group)
    if (!register) return res.json({regSuccess:false})

    res.status(200).json({regSuccess:true})
})




module.exports = router
