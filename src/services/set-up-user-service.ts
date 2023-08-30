import { authorizationString, recaptchaTokenString, typeUser } from '../models'
import { getActivatedUserByAccessTokenService } from './user-services'
import { getMockedUserResponse } from './mocked-user-service'
import { NextFunction, Request, Response } from 'express'

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
        if (user) {
            // clean up old recovery options
            // if (!!user.recoveryOptions?.length) {
            //     const recoveryOptionsToKeep: typeRecoveryOption[] = []
            //     user.recoveryOptions.forEach(o => {
            //         if (o.expiration > +new Date() + 10 * recoveryTokensExpiresIn)
            //             recoveryOptionsToKeep.push(o)
            //     })
            // }
            req.user = user
        }
    }
    const recaptchaToken: string = req.header(recaptchaTokenString) || ""
    if (recaptchaToken) {
        // const success: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)    TODO
        // if (!success) return res.json({ success })
    }
    next()
}
