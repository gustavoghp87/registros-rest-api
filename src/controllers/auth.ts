import { Request, Response, NextFunction } from 'express';
import { searchUserByToken } from '../controllers/functions';

declare module "express" {
    export interface Request {
        user?: any
        token?: any
        newtoken?: string
        cookies?: any
    }
}


export const auth = async(req:Request, res:Response, next:NextFunction) => {

    try {
        let token = req.body.token.split('newtoken=')[1] || "abcde"

        console.log("PASANDO POR /AUTH cookies....", token)    

        const user = await searchUserByToken(token)
    
        console.log("Encontrado usuario por cookie,", user.email)
        
        req.token = token
        req.user = user
        next()
    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN")
        let userData = {
            isAuth: false,
            isAdmin: false
        };
        res.status(200).json(userData)
    }
}

export const admin = async(req:Request, res:Response, next:NextFunction) => {

    try {
        let token = req.body.token.split('newtoken=')[1] || "abcde"

        console.log("PASANDO POR /AUTH cookies....", token)    

        const user = await searchUserByToken(token)
    
        console.log("Encontrado usuario por cookie,", user.email)
        
        if (user.role===1) {
            req.token = token
            req.user = user
            next()
        }

    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN")
        let userData = {
            isAuth: false,
            isAdmin: false
        };
        res.status(200).json(userData)
    }
}

export const authGraph = async (token:string) => {
    try {
        const Token = token.split('newtoken=')[1] || "abcde"
        console.log("PASANDO POR /AUTH GraphQL....", Token)    
        const user = await searchUserByToken(Token)
        console.log("Encontrado usuario por cookie,", user.email)
        return user
    } catch(e) {console.log("Falló búsqueda por token", token)}
}

export const adminGraph = async (token:string) => {
    try {
        const Token = token.split('newtoken=')[1] || "abcde"
        console.log("PASANDO POR /AUTH GraphQL....", Token)    
        const user = await searchUserByToken(Token)
        if (user && user.role===1) return user
        return null
    } catch(e) {console.log("Falló búsqueda por token", token)}
}
