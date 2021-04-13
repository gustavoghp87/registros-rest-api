import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'; dotenv.config()
import * as functions from '../controllers/functions'
import { auth } from '../controllers/auth'
import { typeUser } from '../controllers/types'
const router = express.Router()


router

.post('/auth', auth, (req:any, res:any) => {
    try {
        let userData:typeUser = {
            _id: req.user._id,
            role: req.user.role,
            email: req.user.email,
            password: req.user.password,
            estado: req.user.estado,
            group: req.user.group,
            asign: req.user.asign,
            isAuth: true,
            isAdmin: req.user.role==1 ? true : false,
            darkMode: req.user.darkMode
        }
        res.status(200).json(userData)
    } catch {
        let userData = {
            isAuth: false
        }
        res.status(200).json({userData})
    }
})


.post('/login', async (req:any, res:any) => {
    const email = req.body.email || ""
    const password = req.body.password || ""
    const recaptchaToken = req.body.recaptchaToken || ""
    console.log("Entra en login", email, recaptchaToken);

    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken)
    if (!checkRecaptch) return res.status(200).json({loginSuccess:false, recaptchaFails:true})

    const user = await functions.searchUserByEmail(email)
    if (!user) return res.status(200).json({loginSuccess:false})
    if (!user.estado) return res.status(200).json({loginSuccess:false, disable:true})

    const compare = await bcrypt.compare(password, user.password)

    if (compare) {
        const jwt_string:string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"
        const newtoken = await jwt.sign({userId:user._id}, jwt_string, {expiresIn:'2160h'})
        const addToken = await functions.addTokenToUser(user.email, newtoken)
        if (!addToken) res.status(200).json({loginSuccess:false})
        res.json({loginSuccess:true, newtoken})
    } else res.status(200).json({loginSuccess:false})
})


.post('/logout', auth, async (req:any, res:any) => {
    try {
        const done = await functions.addTokenToUser(req.user.email, "")
        if (done) res.status(200).json({response:"ok"})
        else res.status(200).json({response:"Falló cerrar sesión"})
    } catch {res.status(200).json({response:"Falló cerrar sesión"})}
})


.post('/register', async (req:any, res:any) => {
    const email = req.body.email || ""
    const password = req.body.password || ""
    const group = req.body.group || 0
    const recaptchaToken = req.body.recaptchaToken || ""
    if (!email || !password || !group || !recaptchaToken) return res.status(200).json({regSuccess:false})

    const checkRecaptch = await functions.checkRecaptchaToken(recaptchaToken)
    if (!checkRecaptch) return res.status(200).json({regSuccess:false, recaptchaFails:true})

    const busq = await functions.searchUserByEmail(email)
    if (busq) return res.status(200).json({regSuccess:false, userExists:true})

    const register = await functions.registerUser(email, password, group)
    if (!register) return res.json({regSuccess:false})

    res.status(200).json({regSuccess:true})
})


.post('/change-mode', async (req, res) => {
    const { token } = req.body
    if (!token) {console.log("No llegó el token en change-mode"); return res.json({success:false})}
    const user = await functions.searchUserByToken(token)
    if (!user) return res.json({success:false})
    try {
        functions.changeMode(user.email, req.body.darkMode)
        res.json({success:true, darkMode:req.body.darkMode})
    } catch (e) {console.log(e); res.json({success:false})}
})


.post('/change-psw', async (req, res) => {
    const { psw, newPsw, token } = req.body
    if (!token) {console.log("No llegó el token en change-psw"); return res.json({success:false})}
    console.log("Cambiar psw de " + psw + " a " + newPsw);
    const user = await functions.searchUserByToken(token)
    const compare = await bcrypt.compare(psw, user.password)
    if (!user || !newPsw) return res.json({success:false})
    if (!compare) return res.json({success:false, compareProblem:true})
    try {
        console.log("ACA 1");
        const success = await functions.changePsw(user.email, newPsw)
        if (!success) return res.json({success:false})
        console.log("ACA 2");
        const user2:typeUser = await functions.searchUserByToken(token)
        const compare2 = await bcrypt.compare(newPsw, user2.password)
        console.log(compare2)
        if (compare2) {
            console.log("ACA 3");
            const jwt_string:string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"
            const newToken = await jwt.sign({userId:user2._id}, jwt_string, {expiresIn:'2160h'})
            const addToken = await functions.addTokenToUser(user2.email, newToken)
            console.log("ACA 4");
            if (!addToken) res.status(200).json({success:false})
            res.json({success:true, newToken})
        } else res.status(200).json({success:false})
    } catch (e) {console.log(e); res.json({success:false})}
})


module.exports = router
