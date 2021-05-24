import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userServices from '../services/user-services'
import { auth } from './auth-controller'
import { typeUser } from '../models/user'
import { string_jwt } from '../services/env-variables';


export const router = express.Router()

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

        const checkRecaptch = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.status(200).json({loginSuccess:false, recaptchaFails:true})

        const user = await userServices.searchUserByEmail(email)
        if (!user) return res.status(200).json({loginSuccess:false})
        if (!user.estado) return res.status(200).json({loginSuccess:false, disable:true})

        const compare = await bcrypt.compare(password, user.password)

        if (compare) {
            const jwt_string:string = string_jwt
            const newtoken = await jwt.sign({userId:user._id}, jwt_string, {expiresIn:'2160h'})
            const addToken = await userServices.addTokenToUser(user.email, newtoken)
            if (!addToken) res.status(200).json({loginSuccess:false})
            res.json({loginSuccess:true, newtoken})
        } else res.status(200).json({loginSuccess:false})
    })

    .post('/logout', auth, async (req:any, res:any) => {
        try {
            const done = await userServices.addTokenToUser(req.user.email, "")
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

        const checkRecaptch = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.status(200).json({regSuccess:false, recaptchaFails:true})

        const busq = await userServices.searchUserByEmail(email)
        if (busq) return res.status(200).json({regSuccess:false, userExists:true})

        const register = await userServices.registerUser(email, password, group)
        if (!register) return res.json({regSuccess:false})

        res.status(200).json({regSuccess:true})
    })

    .post('/change-mode', async (req, res) => {
        const { token } = req.body
        if (!token) {console.log("No llegó el token en change-mode"); return res.json({success:false})}
        const user = await userServices.searchUserByToken(token)
        if (!user) return res.json({success:false})
        try {
            userServices.changeMode(user.email, req.body.darkMode)
            res.json({success:true, darkMode:req.body.darkMode})
        } catch (e) {console.log(e); res.json({success:false})}
    })

    .post('/change-psw', async (req, res) => {
        const { psw, newPsw, token } = req.body
        if (!token) {console.log("No llegó el token en change-psw"); return res.json({success:false})}
        console.log("Cambiar psw de " + psw + " a " + newPsw);
        const user = await userServices.searchUserByToken(token)
        if (!user || !newPsw) return res.json({success:false})
        const compare = await bcrypt.compare(psw, user.password)
        if (!compare) return res.json({success:false, compareProblem:true})
        try {
            console.log("ACA 1");
            const success = await userServices.changePsw(user.email, newPsw)
            if (!success) return res.json({success:false})
            console.log("ACA 2");
            const user2:typeUser|null = await userServices.searchUserByToken(token)
            if (!user2) return res.json({success:false})
            const compare2 = await bcrypt.compare(newPsw, user2.password)
            console.log(compare2)
            if (compare2) {
                console.log("ACA 3");
                const jwt_string:string = string_jwt
                const newToken = await jwt.sign({userId:user2._id}, jwt_string, {expiresIn:'2160h'})
                const addToken = await userServices.addTokenToUser(user2.email, newToken)
                console.log("ACA 4");
                if (!addToken) res.status(200).json({success:false})
                res.json({success:true, newToken})
            } else res.status(200).json({success:false})
        } catch (e) {console.log(e); res.json({success:false})}
    })
;
