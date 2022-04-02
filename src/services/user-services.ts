import Axios from 'axios'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { bcryptSalt, privateKey, string_jwt } from '../env-variables'
import { UserDb } from '../services-db/userDbConnection'
import { accessTokensExpiresIn, logger } from '../server'
import { sendEmailRecoverAccount } from './email-services'
import { decodedObject, recoveryOption, typeUser } from '../models/user'

const userDbConnection: UserDb = new UserDb()

export const getUserByEmailService = async (email: string): Promise<typeUser|null> => {
    if (!email) return null
    const user = await userDbConnection.GetUserByEmail(email)
    return user
}

export const getUsersService = async (token: string): Promise<typeUser[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    let users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    users = users.reverse()
    return users
}

export const getUsersNotAuthService = async (): Promise<typeUser[]|null> => {
    // without permission filter
    let users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    users = users.reverse()
    return users
}

export const checkRecaptchaTokenService = async (recaptchaToken: string): Promise<boolean> => {
    if (!recaptchaToken || !privateKey) return false
    const url: string = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyURL: string = `${url}?secret=${privateKey}&response=${recaptchaToken}`
    try {
        const response: any|null = await Axios.post(verifyURL)
        if (!response || !response.data || !response.data.success) return false
        return true
    } catch (error) {
        console.log(error)
        logger.Add(`Falló checkRecaptchaTokenService(): ${error}`, 'error')
        return false
    }
}

export const registerUserService = async (email: string, password: string, groupString: string): Promise<boolean> => {
    let group: number
    try { group = parseInt(groupString) } catch { return false }
    if (!email || !email.includes("@") || !password || password.length < 8 || !group || isNaN(group)) return false
    const encryptedPassword: string|null = await generatePasswordHash(password)
    if (!encryptedPassword) return false
    const newUser: typeUser = {
        role: 0,
        estado: false,
        email,
        password: encryptedPassword,
        group,
        tokenId: 1
    }
    const success: boolean = await userDbConnection.RegisterUser(newUser)
    if (success) logger.Add(`Se registró un usuario con email ${email} y grupo ${group}`, "login")
    return success
}

export const generateAccessTokenService = (user: typeUser, tokenId: number): string|null => {
    if (!user || !user._id) return null
    if (!tokenId) tokenId = 1
    try { if (typeof tokenId !== 'number') tokenId = parseInt(tokenId) } catch { return null }
    try {
        const newToken: string = jwt.sign({ userId: user._id, tokenId }, string_jwt, { expiresIn: accessTokensExpiresIn })
        if (newToken) logger.Add(`Se logueó el usuario ${user.email}`, "login")
        return newToken
    } catch (error) {
        logger.Add(`Falló generateAccessTokenService() ${user.email} ${tokenId}`, 'error')
        return null
    }
}

export const getActivatedUserByAccessTokenService = async (token: string): Promise<typeUser|null> => {
    const user: typeUser|null = await getUserByAccessToken(token)
    if (!user) return null
    return user && user.estado ? user : null
}

export const getActivatedAdminByAccessTokenService = async (token: string): Promise<typeUser|null> => {
    const user: typeUser|null = await getUserByAccessToken(token)
    return user && user.estado && user.role == 1 ? user : null
}

const getUserByAccessToken = async (token: string): Promise<typeUser|null> => {
    if (!token) return null 
    let decoded: decodedObject|null
    let tokenId: number|null
    const timeNow: number = Date.now() / 1000
    try {
        decoded = jwt.verify(token, string_jwt) as decodedObject
    } catch (error) {
        console.log(error)
        logger.Add(`Falló retrieveUserIdByAccessToken(): ${error}`, 'error')
        return null
    }
    const userId: string|null = decoded && decoded.iat && decoded.exp && decoded.iat < timeNow && decoded.exp > timeNow ? decoded?.userId : null
    tokenId = decoded && decoded.tokenId ? decoded.tokenId : 1
    if (!userId || !tokenId) return null
    const user: typeUser|null = await userDbConnection.GetUserById(userId)
    if (!user) return null
    user.tokenId = user.tokenId ?? 1
    if (tokenId < user.tokenId) return null
    return user
}

const generatePasswordHash = async (password: string): Promise<string|null> => {
    try {
        const passwordHash: string = await bcrypt.hash(password, parseInt(bcryptSalt))
        return passwordHash
    } catch (error) {
        console.log(error)
        logger.Add(`Falló generatePasswordHash(): ${error}`, 'error')
        return null
    }
}

export const comparePasswordsService = async (password0: string, password1: string): Promise<boolean> => {
    try {
        const success: boolean = await bcrypt.compare(password0, password1)
        return success
    } catch (error) {
        console.log(error)
        logger.Add(`Falló comparePasswordsService(): ${error}`, 'error')
        return false
    }
}

export const logoutAllService = async (token: string): Promise<string|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !user._id) return null
    const tokenId = user.tokenId || 1
    const success: boolean = await userDbConnection.UpdateTokenId(user._id.toString(), tokenId + 1)
    if (!success) return null
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cerró todas las sesiones`, "login")
    const newToken: string|null = generateAccessTokenService(user, tokenId + 1 || 2)
    return newToken
}

export const changePswService = async (token: string, psw: string, newPsw: string): Promise<string|null> => {
    let user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !user.password || !user._id || !psw || !newPsw || newPsw.length < 8) return null
    let compare: boolean = await comparePasswordsService(psw, user.password)
    if (!compare) return "wrongPassword"
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(user.email, encryptedPassword)
    if (!success) {
        console.log("Fail trying to change password for", user.email)
        return null
    }
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambió su contraseña usando la que tenía`, "login")
    const newToken: string|null = generateAccessTokenService(user, user.tokenId || 1)
    return newToken
}

const getRandomCharacter = (i: number): string => Math.random().toString(36).slice(i*-1)

export const changePswOtherUserService = async (token: string, email: string): Promise<string|null> => {
    const myUser: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    const user: typeUser|null = await getUserByEmailService(email)
    if (!myUser || !user) return null
    const newPsw: string = getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4);
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(email, encryptedPassword)
    if (success) logger.Add(`${myUser.role === 1 ? 'Admin' : 'Usuario'} ${myUser.email} cambió la contraseña de ${email}`, "login")
    return success ? newPsw : null
}

export const getUserByEmailLinkService = async (id: string): Promise<typeUser|null> => {
    if (!id) return null
    const user: typeUser|null = await userDbConnection.GetUserByEmailLink(id)
    return user
}

export const changePswByEmailLinkService = async (id: string, newPsw: string): Promise<string|null> => {
    if (!newPsw || typeof newPsw !== 'string' || newPsw.length < 8) return null
    const user: typeUser|null = await userDbConnection.GetUserByEmailLink(id)
    if (!user || !user._id || !user.recoveryOptions) return null
    let recoveryOption: recoveryOption|null = null
    for (let i = 0; i < user.recoveryOptions.length; i++) {
        if (user.recoveryOptions[i].id === id) recoveryOption = user.recoveryOptions[i]
    }
    if (!recoveryOption) return null
    if (recoveryOption.expiration < + new Date()) return "expired"
    if (recoveryOption.used) return "used"
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(user.email, encryptedPassword)
    if (!success) return null
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} recuperó su contraseña por link de email`, "login")
    await userDbConnection.SetRecoveryOptionAsUsed(user, id)
    const newToken: string|null = generateAccessTokenService(user, user.tokenId || 1)
    return newToken
}

export const recoverAccountService = async (email: string): Promise<string> => {
    if (!email) return "no user"
    const user: typeUser|null = await getUserByEmailService(email)
    if (!user) return "no user"
    const id: string = getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4)
    let success: boolean = await userDbConnection.AddRecoveryOption(email, id)
    if (!success) return ""
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} solicitó un email de recuperación de contraseña`, "login")
    success = await sendEmailRecoverAccount(email, id)
    if (!success) return "not sent"
    return "ok"
}

export const modifyUserService = async (token: string, user_id: string, estado: boolean, role: number, group: number): Promise<typeUser|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    estado = !estado ? false : true
    try { role = parseInt(role.toString()) } catch { return null }
    try { group = parseInt(group.toString()) } catch { return null }
    if (!user || !user_id || typeof role !== 'number' || typeof group !== 'number') return null
    const updatedUser: typeUser|null = await userDbConnection.UpdateUserState(user_id, estado, role, group)
    if (updatedUser) logger.Add(`Admin ${user.email} modificó al usuario ${updatedUser.email}: activado ${updatedUser.estado}, rol ${updatedUser.role}, grupo ${updatedUser.group}`, "userChanges")
    return updatedUser
}

export const changeModeService = async (token: string, darkMode: boolean): Promise<boolean> => {    // suspended
    darkMode = !darkMode ? false : true
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !user.email) return false
    const success: boolean = await userDbConnection.ChangeMode(user.email, darkMode)
    return success
}

export const assignTerritoryService = async (token: string, user_id: string, asignar: number, desasignar: number, all: boolean): Promise<typeUser|null> => {
    all = !all ? false : true
    if (!all)
        try {
            asignar = parseInt(asignar.toString())
        } catch {
            try {
                desasignar = parseInt(desasignar.toString())
            } catch { return null }
        }
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    const userToEdit :typeUser|null = await userDbConnection.GetUserById(user_id)
    if (!user || !userToEdit || (!asignar && !desasignar && !all)) return null
    const updatedUser: typeUser|null = await userDbConnection.AssignTerritory(user_id, asignar, desasignar, all)
    if (updatedUser) logger.Add(`Admin ${user.email} modificó las asignaciones de ${updatedUser?.email}: asignados antes ${userToEdit.asign?.length ? userToEdit.asign : "ninguno"}, ahora ${updatedUser.asign?.length ? updatedUser.asign : "ninguno"}`, "userChanges")
    return updatedUser
}

export const deallocateMyTerritoryService = async (token: string, territory: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !user._id) return false
    let territoryNumber: number = 0
    try {
        territoryNumber = parseInt(territory)
    } catch (error) {
       console.log(error)
       logger.Add(`Falló deallocateMyTerritoryService(): ${error}`, 'error')
       return false
    }
    const updatedUser: typeUser|null = await userDbConnection.AssignTerritory(user._id.toString(), 0, territoryNumber, false)
    if (!updatedUser) logger.Add(`Usuario ${user.email} no pudo ser desasignado de ${territory}`, "territoryChange")
    return updatedUser ? true : false
}
