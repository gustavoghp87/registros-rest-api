import express, { NextFunction, Request, Response, Router } from 'express'
import * as userServices from '../services/user-services'
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
    user.tokenId = undefined
    user.recoveryOptions = undefined
    user.darkMode = undefined
    return user
}

export const validateRecaptchaToken = async (req: Request, res: Response, next: NextFunction) => {
    const recaptchaToken: string = req.header(recaptchaTokenString) || ""
    //console.log(recaptchaToken);
    
    // const success: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)

    // if (!success) console.log("\n\n FALLÓ recaptcha  -------- \n\n");
    
    // if (!success) return res.json({ success })
    // console.log("\n\n Pasó recaptcha \n\n");
    
    next()
}

export const userController: Router = express.Router()

    // get my user
    .get('/', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        let user: typeUser|null = await userServices.getActivatedUserByAccessTokenService(token)
        if (!user) return res.json({ success: false })
        user.isAuth = true
        user.isAdmin = user.role == 1
        user = blindUser(user)
        res.json({ success: true, user })
    })
    
    // sign up user
    .post('/', validateRecaptchaToken, async (req: Request, res: Response) => {
        const { email, password, group, recaptchaToken } = req.body
        const checkRecaptch: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)
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
        const user_id: string = req.body.user_id
        const estado: boolean = req.body.estado
        const role: number = req.body.role
        const group: number = req.body.group
        let user: typeUser|null = await userServices.editUserService(token, user_id, estado, role, group)
        if (!user) return res.json({ success: false })
        user = blindUser(user)
        res.json({ success: true, user })
    })

    // change my dark mode    -    suspended
    .put('/mode', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const darkMode: boolean = req.body.darkMode
        const success: boolean = await userServices.changeModeService(token, darkMode)
        res.json({ success })
    })

    // change assignations for other users
    .put('/assignment', validateRecaptchaToken, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const user_id: string = req.body.user_id
        const asignar: number = req.body.asignar
        const desasignar: number = req.body.desasignar
        const all: boolean = req.body.all
        let user: typeUser|null = await userServices.assignTerritoryService(token, user_id, asignar, desasignar, all)
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
;
