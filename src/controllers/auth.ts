import { Request, Response, NextFunction } from 'express'
import { searchUserByToken } from '../controllers/functions'


declare module "express" {
    export interface Request {
        user?: any
        token?: any
        newtoken?: string
        cookies?: any
    }
}


export const auth = async(req:Request, res:Response, next:NextFunction) => {

    console.log("Entra en auth", req.body)

    try {
        let token = req.body.token.split('newtoken=')[1] || "abcde"
        console.log("PASANDO POR /AUTH cookies....", token)
        const user = await searchUserByToken(token)    
        try {console.log("Encontrado usuario por cookie,", user.email)} catch {}

        if (!user || !user.estado) {
            let userData = {isAuth:false, isAdmin:false}
            return res.status(200).json(userData)
        }
        req.token = token
        req.user = user
        next()
    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN")
        let userData = {isAuth:false, isAdmin:false}
        res.status(200).json(userData)
    }
}


export const admin = async(req:Request, res:Response, next:NextFunction) => {

    let token = req.body.token.split('newtoken=')[1] || "abcde"
    const user = await searchUserByToken(token)
    if (user && user.estado && user.role===1) {
        req.token = token
        req.user = user
        return next()
    }

    console.log("USUARIO NO ENCONTRADO POR TOKEN")
    res.status(200).json({userData: {isAuth:false, isAdmin:false}})
}


export const authGraph = async (token:string) => {
    try {
        let Token = token.split('newtoken=')[1] || "abcde"
        console.log("PASANDO POR /AUTH GraphQL....", Token)    
        const user = await searchUserByToken(Token)
        if (!user.estado) return null
        console.log("Encontrado usuario por cookie,", user.email)
        return user
    } catch(e) {console.log("Falló búsqueda por token", token)}
}


export const adminGraph = async (token:string) => {
    try {
        let Token = token.split('newtoken=')[1] || "abcde"
        console.log("PASANDO POR /AUTH GraphQL....", Token)
        const user = await searchUserByToken(Token)
        if (user && user.estado && user.role==1) return user
        return null
    } catch(e) {console.log("Falló búsqueda por token", token)}
}
