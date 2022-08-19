import { logger } from '../server'
import { sendRecoverAccountEmailService } from './email-services'
import { errorLogs, loginLogs, userLogs } from './log-services'
import { getRandomId12, getRandomId24 } from './helpers'
import { checkRecaptchaTokenService } from './recaptcha-services'
import { comparePasswordsService, generatePasswordHash } from './bcrypt-services'
import { decodeVerifiedService, signUserService } from './jwt-services'
import { UserDb } from '../services-db/userDbConnection'
import { typeJWTObjectForUser, typeRecoveryOption, typeTerritoryNumber, typeUser } from '../models'

const userDbConnection: UserDb = new UserDb()

export const assignTLPTerritoryService = async (token: string, email: string, toAssign: number, toUnassign: number, all: boolean): Promise<typeUser|null> => {
    all = !!all
    if (toAssign) {
        toAssign = parseInt(toAssign.toString())
        if (isNaN(toAssign)) return null
    }
    if (toUnassign) {
        toUnassign = parseInt(toUnassign.toString())
        if (isNaN(toUnassign)) return null
    }
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    const userToEdit: typeUser|null = await userDbConnection.GetUserByEmail(email)
    if (!user || !userToEdit || (!toAssign && !toUnassign && !all)) return null
    const updatedUser: typeUser|null = await userDbConnection.AssignTLPTerritory(email, toAssign, toUnassign, all)
    if (updatedUser) logger.Add(`Admin ${user.email} modificó las asignaciones de ${updatedUser?.email}: asignados antes ${userToEdit.phoneAssignments?.length ? userToEdit.phoneAssignments : "ninguno"}, ahora ${updatedUser.phoneAssignments?.length ? updatedUser.phoneAssignments : "ninguno"}`, userLogs)
    return updatedUser
}

export const changePswByEmailLinkService = async (id: string, newPsw: string): Promise<string|null> => {
    if (!newPsw || typeof newPsw !== 'string' || newPsw.length < 8) return null
    const user: typeUser|null = await getUserByEmailLinkService(id)
    if (!user || !user._id || !user.recoveryOptions || !user.tokenId) return null
    const recoveryOption: typeRecoveryOption|undefined = user.recoveryOptions.find(x => x.id === id)
    if (!recoveryOption) return null
    if (recoveryOption.expiration < + new Date()) return 'expired'
    if (recoveryOption.used) return 'used'
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(user.email, encryptedPassword)
    if (!success) return null
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambió su contraseña por link de email`, loginLogs)
    const successSetAsUsed: boolean = await userDbConnection.SetRecoveryOptionAsUsed(user.email, id)
    if (!successSetAsUsed) logger.Add(`No se pudo setear como usada la opción de recuperación para ${user.email} ${id}`, errorLogs)
    const newToken: string|null = generateAccessTokenService(user, user.tokenId)
    return newToken
}

export const changePswOtherUserService = async (token: string, email: string): Promise<string|null> => {
    const myUser: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    const user: typeUser|null = await getUserByEmailService(email)
    if (!myUser || !user) return null
    const newPsw: string = getRandomId12()
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(email, encryptedPassword)
    if (success) logger.Add(`Admin ${myUser.email} cambió la contraseña de ${email}`, loginLogs)
    return success ? newPsw : null
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
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} no pudo cambiar su contraseña usando la que tenía`, loginLogs)
        return null
    }
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambió su contraseña usando la que tenía`, loginLogs)
    const newToken: string|null = generateAccessTokenService(user, user.tokenId || 1)
    return newToken
}

export const deallocateMyTLPTerritoryService = async (token: string, territoryNumber: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    const toUnassign: number = parseInt(territoryNumber)
    if (!toUnassign || isNaN(toUnassign)) {
        logger.Add(`Falló deallocateMyTLPTerritoryService(): ${toUnassign}`, errorLogs)
        return false
    }
    const updatedUser: typeUser|null = await userDbConnection.AssignTLPTerritory(user.email, 0, toUnassign, false)
    if (updatedUser) logger.Add(`Se desasignó el territorio de telefónica ${toUnassign} a ${user.email} porque lo cerró`, userLogs)
    else logger.Add(`El ${user.role === 1 ? 'admin' : 'usuario'} ${user.email} no pudo ser desasignado del territorio de telefónica ${toUnassign} después de cerrarlo`, errorLogs)
    return !!updatedUser
}

export const editUserService = async (token: string, email: string, isActive: boolean, role: number, group: number): Promise<typeUser|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    isActive = !!isActive
    role = parseInt(role.toString())
    group = parseInt(group.toString())
    if (isNaN(role) || isNaN(group)) return null
    if (!user || !email || typeof role !== 'number' || typeof group !== 'number') return null
    const updatedUser: typeUser|null = await userDbConnection.EditUserState(email, isActive, role, group)
    if (updatedUser) logger.Add(`Admin ${user.email} modificó al usuario ${updatedUser.email}: activado ${updatedUser.isActive}, rol ${updatedUser.role}, grupo ${updatedUser.group}`, userLogs)
    return updatedUser
}

export const generateAccessTokenService = (user: typeUser, tokenId: number): string|null => {
    if (!user || !user._id || !tokenId) return null   // change to id
    const newToken: string|null = signUserService(user._id.toString(), tokenId, user.id)  // change to id
    if (!newToken) {
        logger.Add(`Falló generateAccessTokenService() ${user.email} ${tokenId}`, errorLogs)
        return null
    }
    logger.Add(`Se logueó el usuario ${user.email}`, loginLogs)
    return newToken
}

export const getActivatedAdminByAccessTokenService = async (token: string): Promise<typeUser|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    return user && user.role === 1 ? user : null
}

export const getActivatedUserByAccessTokenService = async (token: string): Promise<typeUser|null> => {
    if (!token) return null
    let decoded: typeJWTObjectForUser|null = decodeVerifiedService(token) as typeJWTObjectForUser
    if (!decoded || !decoded.userId || !decoded.tokenId) return null       // change to id
    const user: typeUser|null = await userDbConnection.GetUserByMongoId(decoded.userId)
    if (!user || user.tokenId !== decoded.tokenId) return null
    return user && user.isActive ? user : null
}

export const getUserByEmailLinkService = async (id: string): Promise<typeUser|null> => {
    if (!id) return null
    const users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    let user0: typeUser|undefined = users.find(x => x.recoveryOptions.find(y => y.id === id) !== undefined)
    // users.forEach((user: typeUser) => {
    //     if (user && user.recoveryOptions) user.recoveryOptions.forEach((recoveryOption: typeRecoveryOption) => {
    //         if (recoveryOption.id === id) user0 = user 
    //     })
    // })
    return user0 ?? null
}

export const getUserByEmailService = async (email: string): Promise<typeUser|null> => {
    if (!email) return null
    const user = await userDbConnection.GetUserByEmail(email)
    return user
}

export const getUserById = async (_id: string): Promise<typeUser|null> => {  // change to id
    const user: typeUser|null = await userDbConnection.GetUserByMongoId(_id)
    return user
}

export const getUsersNotAuthService = async (): Promise<typeUser[]|null> => {
    // without permission filter
    let users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    users = users.reverse()
    return users
}

export const getUsersService = async (token: string): Promise<typeUser[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    let users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    users = users.reverse()
    return users
}

export const loginUserService = async (email: string, password: string, recaptchaToken: string): Promise<string|null> => {
    const checkRecaptch: boolean = await checkRecaptchaTokenService(recaptchaToken)
    if (!checkRecaptch) return 'recaptchaFailed'
    const user: typeUser|null = await getUserByEmailService(email)
    if (!user || !user.password || !user.tokenId || !user._id) return null             // change to id
    if (!user.isActive) return 'isDisabled'
    const match: boolean = await comparePasswordsService(password, user.password)
    if (!match) return null
    const newToken: string|null = generateAccessTokenService(user, user.tokenId)
    return newToken
}

export const logoutAllService = async (token: string): Promise<string|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !user.tokenId || !user._id) return null  // change to id
    const success: boolean = await userDbConnection.UpdateTokenId(user._id.toString(), user.tokenId + 1)   // change to id
    if (!success) return null
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cerró todas las sesiones`, loginLogs)
    const newToken: string|null = generateAccessTokenService(user, user.tokenId + 1)
    return newToken
}

export const recoverAccountService = async (email: string): Promise<string> => {
    if (!email) return "no user"
    const user: typeUser|null = await getUserByEmailService(email)
    if (!user) return "no user"
    const id: string = getRandomId24()
    let success: boolean = await userDbConnection.AddRecoveryOption(email, id)
    if (!success) return ""
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} solicitó un email de recuperación de contraseña`, loginLogs)
    success = await sendRecoverAccountEmailService(email, id)
    if (!success) return "not sent"
    return "ok"
}

export const registerUserService = async (email: string, password: string, groupString: string): Promise<boolean> => {
    const group: number = parseInt(groupString)
    if (!email || !email.includes("@") || !password || password.length < 8 || !group || isNaN(group)) return false
    const encryptedPassword: string|null = await generatePasswordHash(password)
    if (!encryptedPassword) return false
    const newUser: typeUser = {
        email,
        group,
        id: +new Date(),
        isActive: false,
        password: encryptedPassword,
        phoneAssignments: [],
        recoveryOptions: [],
        role: 0,
        tokenId: 1
    }
    const success: boolean = await userDbConnection.RegisterUser(newUser)
    if (success) logger.Add(`Se registró un usuario con email ${email} y grupo ${group}`, loginLogs)
    return success
}
