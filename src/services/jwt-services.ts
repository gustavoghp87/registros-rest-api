import jwt from 'jsonwebtoken'
import { jwtString } from '../env-variables'
import { accessTokensExpiresIn, logger } from '../server'
import { errorLogs } from './log-services'
import { getUserById } from './user-services'
import { typeUser } from '../models'

export const decodeVerifiedService = (token: string): jwt.JwtPayload|null => {
    if (!token) return null
    try {
        const decoded: jwt.JwtPayload|null = jwt.verify(token, jwtString) as jwt.JwtPayload
        return decoded
    } catch (error) {
        const decoded = decodeService(token)
        if (decoded && decoded.payload.userId) {
            getUserById(decoded.payload.userId).then((user: typeUser|null) => {
                if (user) logger.Add(`No se pudo verificar token de ${user.email}: ${error}`, errorLogs)
                else logger.Add(`No se pudo verificar token de usuario desconocido: ${error}`, errorLogs)
            })
        }
        else if (decoded) logger.Add(`No se pudo verificar token ${JSON.stringify(decoded)}: ${error}`, errorLogs)
        return null
    }
}

export const decodeService = (token: string): jwt.JwtPayload|null => {
    if (!token) return null
    try {
        const decoded: jwt.JwtPayload|null = jwt.decode(token, { complete: true, json: true })
        return decoded
    } catch (error) {
        logger.Add(`No se pudo decodificar token: ${error}`, errorLogs)
        return null
    }
}

export const signUserService = (id: number, tokenId: number): string|null => {
    try {
        const token: string = jwt.sign({ id, tokenId }, jwtString, { expiresIn: accessTokensExpiresIn })
        return token
    } catch (error) {
        logger.Add(`No se pudo crear token de usuario: ${error}`, errorLogs)
        return null
    }
}
