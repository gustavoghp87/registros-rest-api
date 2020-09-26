import { Request, Response, NextFunction } from 'express';
import { searchUserByToken } from '../controllers/functions';

declare module "express" {
    export interface Request {
        user?: any
        token?: string
        newtoken?: string
        cookies?: any
    }
};

const auth = async(req:Request, res:Response, next:NextFunction) => {

    let token = req.cookies.newtoken || "abcde";

    console.log("PASANDO POR /AUTH cookies....", req.cookies.newtoken)    

    const user = await searchUserByToken(token);

    try {
        console.log("Encontrado usuario por cookie,", user.email);
        req.token = token;
        req.user = user;
        next();
    } catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false
        };
        res.status(200).json({userData})
    };
};

module.exports = { auth };
