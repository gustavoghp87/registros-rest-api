import express from 'express'
import * as userServices from '../services/user-services'
import { typeUser } from '../models/user'

export const router = express.Router()

    //get my user
    .get('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const user: typeUser|null = await userServices.getActivatedUserByAccessToken(token)
        if (!user) { return res.json({ success: false, user: { isAuth: false, isAdmin: false } }) }
        console.log("Auth by token *********************************************************************", user.email)
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
    
    // sign up user
    .post('/', async (req: any, res: any) => {
        const { email, password, recaptchaToken } = req.body
        let group: number = 9
        try { group = parseInt(req.body.group) } catch {}
        if (!email || !password || !group || !recaptchaToken) return res.json({ success: false })
        const checkRecaptch: boolean = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
        const user: typeUser|null = await userServices.getUserByEmail(email)
        if (user) return res.json({ success: false, userExists: true })
        const success: boolean = await userServices.registerUser(email, password, group)
        res.json({ success })
    })

    // get all users
    .get('/all', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const users: typeUser[]|null = await userServices.getUsers(token)
        if (!users) return res.json({ success: false })
        users.forEach(user => {
            user.password = ""
            user.tokenId = 0
            user.recoveryOptions = undefined
        })
        res.json({ success: true, users })
    })

    // change my features / change my feature mode / change assignations for other users
    .put ('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const user_id: string = req.body.user_id
        let { darkMode, estado, role, group, all, asignar, desasignar } = req.body
        console.log("\n\nDATA\n", darkMode)
        console.log(user_id, estado, role, group)
        console.log(all, asignar, desasignar)
        
        if (!token) {
            res.json({ success: false })
        } else if (darkMode !== undefined) {
            if (typeof darkMode !== 'boolean') darkMode = darkMode == 'true' ? true : false
            console.log(darkMode);
            const success: boolean = await userServices.changeMode(token, darkMode)
            res.json({ success })
        } else if (user_id && estado !== undefined && role !== undefined && group !== undefined) {
            estado = (estado == 'true' || estado == true) ? true : false
            if (typeof role !== 'number')
                try { role = parseInt(role) } catch { return res.json({ success: false }) }
            if (typeof group !== 'number')
                try { group = parseInt(group) } catch { return res.json({ success: false }) }
            const user: typeUser|null = await userServices.modifyUser(token, user_id, estado, role, group)
            if (!user) return res.json({ success: false })
            user.password = ""
            user.tokenId = 0
            user.recoveryOptions = undefined
            res.json({ success: true, user })
        } else if (user_id && (asignar !== undefined || desasignar !== undefined || all !== undefined)) {
            if (asignar !== null && typeof asignar !== 'number')
                try { asignar = parseInt(asignar) } catch { return res.json({ success: false }) }
            if (desasignar !== null && typeof desasignar !== 'number')
                try { desasignar = parseInt(desasignar) } catch { return res.json({ success: false }) }
            all = all !== undefined && (all == 'true' || all == true) ? true : false
            console.log(all, asignar, desasignar)
            const user: typeUser|null = await userServices.assignTerritory(token, user_id, asignar, desasignar, all)
            if (!user) return res.json({ success: false })
            user.password = ""
            user.tokenId = 0
            user.recoveryOptions = undefined
            res.json({ success: true, user })
        } else {
            res.json({ success: false })
        }
    })
    
    // get email from email link id
    .get('/recovery/:id', async (req: any, res: any) => {
        const id: string = req.params.id || ""
        if (!id) return res.json({ success: false })
        const user: typeUser|null = await userServices.getUserByEmailLink(id)
        if (!user) return res.json({ success: false })
        // user.password = ""
        // user.tokenId = 0
        // user.recoveryOptions = undefined
        res.json({ success: true, email: user.email })
    })

    // recover account by a link in email box
    .patch('/', async (req: any, res: any) => {
        const email: string = req.body.email || ""
        const success: string = await userServices.recoverAccount(email)
        if (success === "no user") res.json({ success: false, noUser: true })
        else if (success === "not sent") res.json({ success: false, notSent: true })
        else res.json({ success: true })
    })
;
