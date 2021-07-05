import { Request, Response, NextFunction } from 'express'
import * as userServices from '../services/user-services'


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
    console.log("PASSING BY /AUTH token....", token?.length)
    const user = await userServices.searchUserByToken(token)
    if (!user || !await userServices.checkAuthByToken(token)) {
        console.log("USER CHECK AUTH BY TOKEN FAILED")
        return res.status(200).json({ userData: {isAuth:false, isAdmin:false} })
    }
    console.log("Auth by token,", user.email)
    req.token = token
    req.user = user
    next()
}

export const admin = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || "abcde"
    console.log("PASSING BY /ADMIN token....", token?.length)
    const user = await userServices.searchUserByToken(token)
    if (!user || !await userServices.checkAdminByToken(token)) {
        console.log("USER CHECK ADMIN BY TOKEN FAILED")
        return res.status(200).json({ userData: {isAuth:false, isAdmin:false} })
    }
    console.log("Admin by token,", user.email)
    req.token = token
    req.user = user
    return next()
}
