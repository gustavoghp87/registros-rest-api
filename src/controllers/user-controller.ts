import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as userServices from '../services/user-services'
import { auth } from './user-controller-auth'
import { string_jwt } from '../env-variables';
import { typeUser } from '../models/user'

export const router = express.Router()
    .post('/auth', auth, (req: any, res: any) => {
        try {
            let userData: typeUser = {
                _id: req.user._id,
                role: req.user.role,
                email: req.user.email,
                //password: req.user.password,
                estado: req.user.estado,
                group: req.user.group,
                asign: req.user.asign,
                isAuth: true,
                isAdmin: req.user.role == 1 ? true : false,
                darkMode: req.user.darkMode
            }
            res.json(userData)
        } catch {
            let userData = {
                isAuth: false
            }
            res.json({ userData })
        }
    })

    .post('/login', async (req: any, res: any) => {                 // TODO: change login, don't save token in db
        const email = req.body.email || ""
        const password = req.body.password || ""
        const recaptchaToken = req.body.recaptchaToken || ""
        console.log("Entra en login", email, recaptchaToken.length);

        const checkRecaptch: boolean = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })

        const user: typeUser|null = await userServices.getUserByEmail(email)
        if (!user || !user.password) return res.json({ success: false })
        else if (!user.estado) return res.json({ success: false, disable: true })

        const compare = await bcrypt.compare(password, user.password)
        if (!compare) return res.json({ success: false })

        const jwt_string: string = string_jwt
        const newtoken = await jwt.sign({ userId: user._id }, jwt_string, { expiresIn:'2160h' })
        const success = await userServices.addTokenToUser(user.email, newtoken)
        if (!success) res.json({ success })
        res.json({ success, newtoken })
    })

    .post('/logout', async (req: any, res: any) => {
        const { token } = req.body
        const user: typeUser|null = await userServices.getUserByToken(token)
        if (!user || !user.email) return res.json({ success: false })
        const success: boolean = await userServices.addTokenToUser(user.email, "")
        if (!success) res.json({ success, response: "Failed /logout" })
        res.json({ success })
    })

    .post('/register', async (req: any, res: any) => {
        const { email, password, group, recaptchaToken } = req.body
        if (!email || !password || !group || !recaptchaToken) return res.json({ success: false })

        const checkRecaptch = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })

        const user: typeUser|null = await userServices.getUserByEmail(email)
        if (user) return res.json({ success: false, userExists: true })

        const register = await userServices.registerUser(email, password, group)
        if (!register) return res.json({ success: false })

        res.json({ success: true })
    })

    .post('/change-mode', async (req: any, res: any) => {
        const { token } = req.body
        if (!token) { console.log("No token on change-mode"); return res.json({ success: false }) }
        const user: typeUser|null = await userServices.getUserByToken(token)
        if (!user) return res.json({ success: false })
        const success: boolean = await userServices.changeMode(user.email, req.body.darkMode)
        if (!success) return res.json({ success })
        res.json({ success, darkMode: user.darkMode })
    })

    .post('/change-psw', async (req: any, res: any) => {
        const { token, psw, newPsw } = req.body
        if (!token || !psw || !newPsw || psw !== newPsw) {
            console.log("No token or psw error on /change-psw")
            return res.json({ success: false })
        }
        let user: typeUser|null = await userServices.getUserByToken(token)
        if (!user || !user.password) return res.json({ success: false })
        let compare: boolean = await bcrypt.compare(psw, user.password)
        if (!compare) return res.json({ success: false, compareProblem: true })
        try {
            const success: boolean = await userServices.changePsw(user.email, newPsw)
            if (!success) return res.json({ success: false })

            user = await userServices.getUserByToken(token)
            if (!user || !user.password) return res.json({ success: false })

            compare = await bcrypt.compare(newPsw, user.password)
            if (!compare) return res.json({ success: false })

            const jwt_string: string = string_jwt
            const newToken = await jwt.sign({ userId: user._id }, jwt_string, {expiresIn: '2160h' })
            const addToken = await userServices.addTokenToUser(user.email, newToken)
            if (!addToken) res.json({ success: false })
            res.json({ success: true, newToken })
        } catch (e) { console.log(e); res.json({ success: false }) }
    })

    .post('/change-psw-other-user', async (req: any, res: any) => {
        const { token, email } = req.body
        if (!token || !email || typeof token !== "string" || typeof email !== "string") {
            console.log("No token or email error on /change-psw-other-user")
            return res.json({ success: false })
        }
        const success: boolean = await userServices.changePswOtherUser(token, email)
        res.json({ success })
    })

    .post('/get-all', async (req: any, res: any) => {
        const { token } = req.body
        if (!token) { console.log("No llegó el token en users/get-all"); return res.json({ success: false }) }
        const users: typeUser[]|null = await userServices.getUsers(token)
        if (!users) return res.json({ success: false })
        users.forEach((user: typeUser) => user.password = "")
        res.json({ success: true, users })
    })

    .post('/asignar', async (req: any, res: any) => {
        const token = req.body.token || ""
        if (!token) { console.log("No token in /asignar"); return res.json({ success: false }) }
        const user_id = req.body.user_id || ""
        const all = req.body.all || false
        let asignar = req.body.asignar || 0
        let desasignar = req.body.desasignar || 0
        if (typeof asignar !== "number")
            try { asignar = parseInt(asignar) }
            catch (error) { console.log(error); return res.json({ success: false }) }
        if (typeof desasignar !== "number")
            try { asignar = parseInt(asignar) }
            catch (error) { console.log(error); return res.json({ success: false }) }
        const user: typeUser|null = await userServices.assignTerritory(token, user_id, asignar, desasignar, all)
        if (!user) return res.json({ success: false })
        user.password = ""
        res.json({ success: true, user })
    })

    .post ('/controlar-usuario', async (req: any, res: any) => {
        const { token, user_id, estado, role, group } = req.body
        if (!token || !user_id || typeof estado !== 'boolean' || typeof role !== 'number' || typeof group !== 'number')
            return res.json({ success: false })
        const user: typeUser|null = await userServices.modifyUser(token, user_id, estado, role, group)
        if (!user) return res.json({ success: false })
        user.password = ""
        res.json({ success: true, user })
    })
;
