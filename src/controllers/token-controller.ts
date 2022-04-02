import express from 'express'
import * as userServices from '../services/user-services'
import { sendEmailNewPsw } from '../services/email-services'
import { typeUser } from '../models/user'
import { Request, Response } from 'express'

export const router = express.Router()

    // new login
    .post('/', async (req: Request, res: Response) => {
        const { email, password, recaptchaToken } = req.body
        const checkRecaptch: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
        const user: typeUser|null = await userServices.getUserByEmailService(email)
        if (!user || !user.password || !user._id) return res.json({ success: false })
        else if (!user.estado) return res.json({ success: false, isDisabled: true })
        const match: boolean = await userServices.comparePasswordsService(password, user.password)
        if (!match) return res.json({ success: false })
        const newToken: string|null = userServices.generateAccessTokenService(user, user.tokenId || 1)
        res.json({ success: newToken !== null, newToken })
    })

    // logout all devices
    .delete('/', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const newToken: string|null = await userServices.logoutAllService(token)
        res.json({ success: newToken !== null, newToken })
    })

    // change my password
    .put('/', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const { psw, newPsw, id } = req.body
        if (psw && newPsw) {
            // change my psw
            const newToken: string|null = await userServices.changePswService(token, psw, newPsw)
            if (newToken === "wrongPassword") return res.json({ success: false, wrongPassword: true })
            else if (!newToken) return res.json({ success: false })
            res.json({ success: true, newToken })
        } else if (id && newPsw) {
            // change my psw by recovery option
            const newToken: string|null = await userServices.changePswByEmailLinkService(id, newPsw)
            if (!newToken) return res.json({ success: false })
            if (newToken === "expired") return res.json({ success: false, newToken: null, expired: true })
            if (newToken === "used") return res.json({ success: false, newToken: null, used: true })
            res.json({ success: true, newToken })
        } else {
            res.json({ success: false })
        }
    })

    // change the password of other user by admin
    .patch('/', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const email: string = req.body.email
        const newPassword: string|null = await userServices.changePswOtherUserService(token, email)
        if (!newPassword) return res.json({ success: false })
        const emailSuccess: boolean = await sendEmailNewPsw(email, newPassword)
        if (!emailSuccess) return res.json({ success: false, newPassword, emailFailed: true })
        res.json({ success: true, newPassword })
    })
;
