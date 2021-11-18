import express from 'express'
import * as userServices from '../services/user-services'
import { typeUser } from '../models/user'

export const router = express.Router()
    .post('/auth', async (req: any, res: any) => {
        const { token } = req.body
        const user: typeUser|null = await userServices.getActivatedUserByAccessToken(token)
        if (!user) { return res.json({ success: false, user: { isAuth: false, isAdmin: false } }) }
        console.log("Auth by token", user.email)
        let userData: typeUser = {
            _id: user._id,
            role: user.role,
            email: user.email,
            //password:user.password,
            estado: user.estado,
            group: user.group,
            asign: user.asign,
            isAuth: true,
            isAdmin: user.role == 1 ? true : false,
            darkMode: user.darkMode
        }
        res.json({ success: true, user: userData })
    })

    .post('/login', async (req: any, res: any) => {
        const { email, password, recaptchaToken } = req.body
        const checkRecaptch: boolean = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
        const user: typeUser|null = await userServices.getUserByEmail(email)
        if (!user || !user.password || !user._id) return res.json({ success: false })
        else if (!user.estado) return res.json({ success: false, isDisabled: true })
        const match: boolean = await userServices.comparePasswords(password, user.password)
        if (!match) return res.json({ success: false })
        const newToken: string|null = userServices.generateAccessToken(user._id)
        if (!newToken) return res.json({ success: false })
        res.json({ success: true, newToken })
    })

    // .post('/logout', async (req: any, res: any) => {
    //     const { token } = req.body
    //     const user: typeUser|null = await userServices.getUserByToken(token)
    //     if (!user || !user.email) return res.json({ success: false })
    //     const success: boolean = await userServices.addTokenToUser(user.email, "")
    //     if (!success) res.json({ success, response: "Failed /logout" })
    //     res.json({ success })
    // })

    .post('/logout-all', async (req: any, res: any) => {
        const { token } = req.body
        const newToken: string|null = await userServices.logoutAll(token)
        if (!newToken) return res.json({ success: false })
        res.json({ success: true, newToken })
    })

    .post('/register', async (req: any, res: any) => {
        const { email, password, recaptchaToken } = req.body
        try {
            const group: number = parseInt(req.body.group)
            console.log(req.body, group, typeof group);
            
            if (!email || !password || !group || !recaptchaToken) return res.json({ success: false })
            const checkRecaptch: boolean = await userServices.checkRecaptchaToken(recaptchaToken)
            if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
            const user: typeUser|null = await userServices.getUserByEmail(email)
            if (user) return res.json({ success: false, userExists: true })
            const success: boolean = await userServices.registerUser(email, password, group)
            res.json({ success })
        } catch (error) {
            res.json({ success: false })
        }
    })

    .post('/change-mode', async (req: any, res: any) => {
        const { token, darkMode } = req.body
        if (!token || darkMode === null) { console.log("No token or darkMode on change-mode"); return res.json({ success: false }) }
        const success: boolean = await userServices.changeMode(token, darkMode)
        res.json({ success })
    })

    .post('/change-psw', async (req: any, res: any) => {
        const { token, psw, newPsw } = req.body
        const newToken: string|null = await userServices.changePsw(token, psw, newPsw)
        if (newToken === "wrongPassword") return res.json({ success: false, wrongPassword: true })
        else if (!newToken) return res.json({ success: false })
        res.json({ success: true, newToken })
    })

    .post('/change-psw-other-user', async (req: any, res: any) => {
        const { token, email } = req.body
        if (!token || !email || typeof token !== "string" || typeof email !== "string") {
            console.log("No token or email error on /change-psw-other-user")
            return res.json({ success: false })
        }
        const result: string|null = await userServices.changePswOtherUser(token, email)
        if (!result) return res.json({ success: false })
        else if (result === "email failed") return res.json({ success: false, emailFailed: true})
        res.json({ success: true })
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
        const { token, user_id, all, asignar, desasignar } = req.body
        const user: typeUser|null = await userServices.assignTerritory(token, user_id, asignar, desasignar, all)
        if (!user) return res.json({ success: false })
        user.password = ""
        res.json({ success: true, user })
    })

    .post ('/controlar-usuario', async (req: any, res: any) => {
        const { token, user_id, estado, role, group } = req.body
        console.log("1", typeof role, typeof group);
        
        if (!token || !user_id || typeof estado !== 'boolean' || typeof role !== 'number' || typeof group !== 'number')
            return res.json({ success: false })
        console.log("2");
        const user: typeUser|null = await userServices.modifyUser(token, user_id, estado, role, group)
        if (!user) return res.json({ success: false })
        user.password = ""
        res.json({ success: true, user })
    })
;
