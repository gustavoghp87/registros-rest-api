import express, { Request, Response, Router } from 'express'
import * as userServices from '../services/user-services'
import { sendNewPswEmailService } from '../services/email-services'
import { checkRecaptchaTokenService } from '../services/recaptcha-services'
import { typeUser } from '../models'

// const unauthenticatedUser: typeUser = {
//     isAuth: false,
//     isAdmin: false,
//     role: 0,
//     email: "",
//     estado: false,
//     group: 0
// }

const blindUser = (user: typeUser): typeUser => {
    if (!user) return user
    user.password = undefined
    user.tokenId = 0
    user.recoveryOptions = []
    return user
}

export const userController: Router = express.Router()

    // get my user
    .get('/', async (req: Request, res: Response) => {
        if (!req.user) return res.json({ success: false })
        let user: typeUser = blindUser(req.user)
        res.json({ success: true, user })
    })
    
    // sign up user
    .post('/', async (req: Request, res: Response) => {
        const { email, password, group, recaptchaToken } = req.body
        const checkRecaptch: boolean = await checkRecaptchaTokenService(recaptchaToken)
        if (!checkRecaptch) return res.json({ success: false, recaptchaFails: true })
        const user: typeUser|null = await userServices.getUserByEmailService(email)
        if (user) return res.json({ success: false, userExists: true })
        const success: boolean = await userServices.registerUserService(email, password, group)
        res.json({ success })
    })

    // get all users
    .get('/all', async (req: Request, res: Response) => {
        const users: typeUser[]|null = await userServices.getUsersService(req.user)
        if (!users) return res.json({ success: false })
        users.forEach((user: typeUser) => { user = blindUser(user) })
        res.json({ success: true, users })
    })

    // change features for other users
    .put('/', async (req: Request, res: Response) => {
        const email: string = req.body.email
        const isActive: boolean = req.body.isActive
        const role: number = req.body.role
        const group: number = req.body.group
        let user: typeUser|null = await userServices.editUserService(req.user, email, isActive, role, group)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })

    // change house-to-house assignations for other users
    .put('/hth-assignment', async (req: Request, res: Response) => {
        const email: string = req.body.email
        const toAssign: number = req.body.toAssign
        const toUnassign: number = req.body.toUnassign
        const all: boolean = req.body.all
        let user: typeUser|null = await userServices.assignHTHTerritoryService(req.user, email, toAssign, toUnassign, all)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })

    // change telephonic assignations for other users
    .put('/tlp-assignment', async (req: Request, res: Response) => {
        const email: string = req.body.email
        const toAssign: number = req.body.toAssign
        const toUnassign: number = req.body.toUnassign
        const all: boolean = req.body.all
        let user: typeUser|null = await userServices.assignTLPTerritoryService(req.user, email, toAssign, toUnassign, all)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })
    
    // get email from email link id
    .get('/recovery/:id', async (req: Request, res: Response) => {
        const id: string = req.params.id
        const user: typeUser|null = await userServices.getUserByEmailLinkService(id)
        if (!user || !user.email) return res.json({ success: false })
        res.json({ success: true, email: user.email })
    })

    // recover account by a link in email box
    .patch('/', async (req: Request, res: Response) => {
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
        const newToken: string|null = await userServices.logoutAllService(req.user)
        res.json({ success: !!newToken, newToken })
    })

    // change my password
    .put('/token', async (req: Request, res: Response) => {
        const { psw, newPsw, id } = req.body
        if (psw && newPsw) {
            // change my psw
            const newToken: string|null = await userServices.changePswService(req.user, psw, newPsw)
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
        const email: string = req.body.email
        const newPassword: string|null = await userServices.changePswOtherUserService(req.user, email)
        if (!newPassword) return res.json({ success: false })
        const emailSuccess: boolean = await sendNewPswEmailService(email, newPassword)
        res.json({ success: !!newPassword, newPassword, emailSuccess })
    })
;
