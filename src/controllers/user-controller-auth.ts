import { Request, Response, NextFunction } from 'express'
import * as userServices from '../services/user-services'
import { typeUser } from '../models/user'

declare module "express" {
    export interface Request {
        user?: any
        token?: any
        newtoken?: string
        cookies?: any
    }
}

export const auth = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || "abcde"
    const user = await userServices.checkAuthByTokenReturnUser(token)
    if (!user) {
        console.log("Check auth by token failed")
        return res.status(200).json({ userData: { isAuth: false, isAdmin: false } })
    }
    console.log("Auth by token", user.email)
    req.token = token
    req.user = user
    next()
}

export const admin = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || "abcde"
    const user: typeUser|null = await userServices.checkAdminByTokenReturnUser(token)
    if (!user) {
        console.log("Check admin by token failed")
        return res.status(200).json({ userData: { isAuth: false, isAdmin: false } })
    }
    console.log("Admin by token", user.email)
    req.token = token
    req.user = user
    next()
}
