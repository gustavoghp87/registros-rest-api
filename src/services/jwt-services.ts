import { accessTokensExpiresIn, logger } from '../server'
import { errorLogs } from './log-services'
import { getUserById } from './user-services'
import { jwtString } from '../env-variables'
import { typeJWTObjectForUser, typeUser } from '../models'
import jwt from 'jsonwebtoken'

export const decodeVerifiedService = (token: string): typeJWTObjectForUser|null => {
    if (!token) return null
    try {
        const decoded = jwt.verify(token, jwtString) as jwt.JwtPayload|null
        if (!decoded) throw Error("No hay objeto decodificado")
        return {
            congregation: decoded.team,
            exp: decoded.exp || 0,
            iat: decoded.iat || 0,
            tokenId: decoded.tokenId,
            userId: decoded.userId
        }
    } catch (error) {
        const decoded = decodeService(token)
        if (decoded && decoded.userId && decoded.congregation) {
            getUserById(decoded.congregation, decoded.userId).then((user: typeUser|null) => {
                if (user) logger.Add(decoded.congregation, `No se pudo verificar token de ${user.email}: ${error}`, errorLogs)
                else logger.Add(decoded.congregation, `No se pudo verificar token de usuario desconocido: ${error}`, errorLogs)
            })
        }
        else if (decoded) logger.Add(1, `No se pudo verificar token ${JSON.stringify(decoded)}: ${error}`, errorLogs)
        return null
    }
}

export const decodeService = (token: string): typeJWTObjectForUser|null => {
    if (!token) return null
    try {
        const decoded: jwt.JwtPayload|null = jwt.decode(token, { complete: true, json: true })
        if (!decoded) return null;
        return {
            congregation: decoded.payload.team,
            exp: decoded.exp || 0,
            iat: decoded.iat || 0,
            tokenId: decoded.payload.tokenId,
            userId: decoded.payload.userId
        }
    } catch (error) {
        logger.Add(1, `No se pudo decodificar token: ${error}`, errorLogs)
        return null
    }
}

export const signUserService = (congregation: number, id: number, tokenId: number): string|null => {
    try {
        const payload = {
            team: congregation,
            userId: id,
            tokenId
        }
        const token: string = jwt.sign(payload, jwtString, { expiresIn: accessTokensExpiresIn })
        return token
    } catch (error) {
        logger.Add(congregation, `No se pudo crear token de usuario: ${error}`, errorLogs)
        return null
    }
}
