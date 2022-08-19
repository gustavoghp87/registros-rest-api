import express, { NextFunction, Request, Response, Router } from 'express'
import * as userServices from '../services/user-services'
import { sendNewPswEmailService } from '../services/email-services'
import { checkRecaptchaTokenService } from '../services/recaptcha-services'
import { authorizationString, recaptchaTokenString, typeUser } from '../models'

// const unauthenticatedUser: typeUser = {
//     isAuth: false,
//     isAdmin: false,
//     role: 0,
//     email: "",
//     estado: false,
//     group: 0
// }

const blindUser = (user: typeUser): typeUser => {
    user.password = undefined
    user.tokenId = 0
    user.recoveryOptions = []
    return user
}

export const validateRecaptchaToken = async (req: Request, res: Response, next: NextFunction) => {
    const recaptchaToken: string = req.header(recaptchaTokenString) || ""
    // const success: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)
    // if (!success) return res.json({ success })
    next()
}

export const userController: Router = express.Router()

    // get my user
    .get('/', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        let user: typeUser|null = await userServices.getActivatedUserByAccessTokenService(token)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })
    
    // sign up user
    .post('/', validateRecaptchaToken, async (req: Request, res: Response) => {
        const { email, password, group, recaptchaToken } = req.body
        const checkRecaptch: boolean = await checkRecaptchaTokenService(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
        const user: typeUser|null = await userServices.getUserByEmailService(email)
        if (user) return res.json({ success: false, userExists: true })
        const success: boolean = await userServices.registerUserService(email, password, group)
        res.json({ success })
    })

    // get all users
    .get('/all', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const users: typeUser[]|null = await userServices.getUsersService(token)
        if (!users) return res.json({ success: false })
        users.forEach((user: typeUser) => { user = blindUser(user) })
        res.json({ success: true, users })
    })

    // change features for other users
    .put('/', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const email: string = req.body.email
        const isActive: boolean = req.body.isActive
        const role: number = req.body.role
        const group: number = req.body.group
        let user: typeUser|null = await userServices.editUserService(token, email, isActive, role, group)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })

    // change assignations for other users
    .put('/assignment', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const email: string = req.body.email
        const toAssign: number = req.body.toAssign
        const toUnassign: number = req.body.toUnassign
        const all: boolean = req.body.all
        let user: typeUser|null = await userServices.assignTLPTerritoryService(token, email, toAssign, toUnassign, all)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })
    
    // get email from email link id
    .get('/recovery/:id', validateRecaptchaToken, async (req: Request, res: Response) => {
        const id: string = req.params.id
        const user: typeUser|null = await userServices.getUserByEmailLinkService(id)
        if (!user || !user.email) return res.json({ success: false })
        res.json({ success: true, email: user.email })
    })

    // recover account by a link in email box
    .patch('/', validateRecaptchaToken, async (req: Request, res: Response) => {
        const email: string = req.body.email || ""
        const response: string = await userServices.recoverAccountService(email)
        if (response === "no user") res.json({ success: false, noUser: true })
        else if (response === "not sent") res.json({ success: false, notSent: true })
        else if (response === "ok") res.json({ success: true })
        else res.json({ success: false })
    })
    
    // new login
    .post('/token', async (req: Request, res: Response) => {
        const { email, password, recaptchaToken } = req.body
        const newToken: string|null = await userServices.loginUserService(email, password, recaptchaToken)
        if (!newToken)
            return res.json({ success: false })
        if (newToken === 'recaptchaFailed')
            return res.json({ success: false, recaptchaFails: true })
        if (newToken === 'isDisabled')
            return res.json({ success: false, isDisabled: true })
        res.json({ success: true, newToken })
    })

    // logout all devices
    .delete('/token', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const newToken: string|null = await userServices.logoutAllService(token)
        res.json({ success: !!newToken, newToken })
    })

    // change my password
    .put('/token', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { psw, newPsw, id } = req.body
        if (psw && newPsw) {
            // change my psw
            const newToken: string|null = await userServices.changePswService(token, psw, newPsw)
            if (newToken === "wrongPassword") return res.json({ success: false, wrongPassword: true })
            res.json({ success: !!newToken, newToken })
        } else if (id && newPsw) {
            // change my psw by recovery option
            const newToken: string|null = await userServices.changePswByEmailLinkService(id, newPsw)
            if (!newToken) return res.json({ success: false })
            if (newToken === "expired") return res.json({ success: false, expired: true })
            if (newToken === "used") return res.json({ success: false, used: true })
            res.json({ success: true, newToken })
        } else {
            res.json({ success: false })
        }
    })

    // change the password of other user by admin
    .patch('/token', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const email: string = req.body.email
        const newPassword: string|null = await userServices.changePswOtherUserService(token, email)
        if (!newPassword) return res.json({ success: false })
        const emailSuccess: boolean = await sendNewPswEmailService(email, newPassword)
        res.json({ success: !!newPassword, newPassword, emailSuccess })
    })
;
