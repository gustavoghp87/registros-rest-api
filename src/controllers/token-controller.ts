import express from 'express'
import * as userServices from '../services/user-services'
import { sendEmailNewPsw } from '../services/email-services'
import { typeUser } from '../models/user'

export const router = express.Router()

    // login
    .post('/', async (req: any, res: any) => {
        const { email, password, recaptchaToken } = req.body
        const checkRecaptch: boolean = await userServices.checkRecaptchaToken(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
        const user: typeUser|null = await userServices.getUserByEmail(email)
        if (!user || !user.password || !user._id) return res.json({ success: false })
        else if (!user.estado) return res.json({ success: false, isDisabled: true })
        const match: boolean = await userServices.comparePasswords(password, user.password)
        if (!match) return res.json({ success: false })
        const newToken: string|null = userServices.generateAccessToken(user._id, user.tokenId || 1)
        if (!newToken) return res.json({ success: false })
        res.json({ success: true, newToken })
    })

    // logout all devices
    .delete('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const newToken: string|null = await userServices.logoutAll(token)
        if (!newToken) return res.json({ success: false })
        res.json({ success: true, newToken })
    })

    // change my password
    .put('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const { psw, newPsw, id } = req.body
        if (psw && newPsw) {
            const newToken: string|null = await userServices.changePsw(token, psw, newPsw)
            if (newToken === "wrongPassword") return res.json({ success: false, wrongPassword: true })
            else if (!newToken) return res.json({ success: false })
            res.json({ success: true, newToken })
        } else if (id && newPsw) {
            const newToken: string|null = await userServices.changePswByEmailLink(id, newPsw)
            if (!newToken) return res.json({ success: false })
            if (newToken === "expired") return res.json({ success: false, newToken: null, expired: true })
            if (newToken === "used") return res.json({ success: false, newToken: null, used: true })
            res.json({ success: true, newToken })
        } else {
            res.json({ success: false })
        }
    })

    // change the password of other user
    .patch('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { email } = req.body
        if (!token || !email) return res.json({ success: false })
        const newPassword: string|null = await userServices.changePswOtherUser(token, email)
        if (!newPassword) return res.json({ success: false })
        const emailSuccess: boolean = await sendEmailNewPsw(email, newPassword)
        if (!emailSuccess) return res.json({ success: false, newPassword, emailFailed: true})
        res.json({ success: true, newPassword })
    })
;
