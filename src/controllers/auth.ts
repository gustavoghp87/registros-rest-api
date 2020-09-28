import { Request, Response, NextFunction } from 'express';
import { searchUserByToken } from '../controllers/functions';

declare module "express" {
    export interface Request {
        user?: any
        token?: any
        newtoken?: string
        cookies?: any
    }
};


const auth = async(req:Request, res:Response, next:NextFunction) => {


    let token = req.body.token.split('newtoken=')[1] || "abcde";

    console.log("PASANDO POR /AUTH cookies....", token)    

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
