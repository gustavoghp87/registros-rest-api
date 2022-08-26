import { NextFunction, Request, Response } from 'express'
import { getActivatedUserByAccessTokenService } from './user-services'
import { getMockedUserResponse } from './mocked-user-service'
import { authorizationString, recaptchaTokenString, typeUser } from '../models'

declare global {
    namespace Express {
        export interface Request {
            user: typeUser
        }
    }
}

export const setUpUser = async (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.header(authorizationString) || ""
    if (token || req?.body?.email) {
        const mockedUserResponse = getMockedUserResponse(token, req.body.email)
        if (mockedUserResponse) return res.json(mockedUserResponse)
    }
    if (token) {
        const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
        if (user) req.user = user
    }
    const recaptchaToken: string = req.header(recaptchaTokenString) || ""
    if (recaptchaToken) {
        // const success: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)    TODO
        // if (!success) return res.json({ success })
    }
    next()
}
