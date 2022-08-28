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

export const assignHTHTerritoryService = async (requesterUser: typeUser, email: string, toAssign: number, toUnassign: number, all: boolean): Promise<typeUser|null> => {
    all = !!all
    if (toAssign) {
        toAssign = parseInt(toAssign.toString())
        if (isNaN(toAssign)) return null
    }
    if (toUnassign) {
        toUnassign = parseInt(toUnassign.toString())
        if (isNaN(toUnassign)) return null
    }
    const userToEdit: typeUser|null = await userDbConnection.GetUserByEmail(email)
    if (!requesterUser || requesterUser.role !== 1 || !userToEdit || (!toAssign && !toUnassign && !all)) return null
    const updatedUser: typeUser|null = await userDbConnection.AssignHTHTerritory(email, toAssign, toUnassign, all)
    if (updatedUser) logger.Add(`Admin ${requesterUser.email} modificó las asignaciones de Casa en Casa de ${updatedUser?.email}: asignados antes ${userToEdit.phoneAssignments?.length ? userToEdit.phoneAssignments : "ninguno"}, ahora ${updatedUser.hthAssignments?.length ? updatedUser.hthAssignments : "ninguno"}`, userLogs)
    return updatedUser
}

export const assignTLPTerritoryService = async (requesterUser: typeUser, email: string, toAssign: number, toUnassign: number, all: boolean): Promise<typeUser|null> => {
    all = !!all
    if (toAssign) {
        toAssign = parseInt(toAssign.toString())
        if (isNaN(toAssign)) return null
    }
    if (toUnassign) {
        toUnassign = parseInt(toUnassign.toString())
        if (isNaN(toUnassign)) return null
    }
    const userToEdit: typeUser|null = await userDbConnection.GetUserByEmail(email)
    if (!requesterUser || requesterUser.role !== 1 || !userToEdit || (!toAssign && !toUnassign && !all)) return null
    const updatedUser: typeUser|null = await userDbConnection.AssignTLPTerritory(email, toAssign, toUnassign, all)
    if (updatedUser) logger.Add(`Admin ${requesterUser.email} modificó las asignaciones Telefónica de ${updatedUser?.email}: asignados antes ${userToEdit.phoneAssignments?.length ? userToEdit.phoneAssignments : "ninguno"}, ahora ${updatedUser.phoneAssignments?.length ? updatedUser.phoneAssignments : "ninguno"}`, userLogs)
    return updatedUser
}

export const changePswByEmailLinkService = async (id: string, newPsw: string): Promise<string|null> => {
    if (!newPsw || typeof newPsw !== 'string' || newPsw.length < 8) return null
    const user: typeUser|null = await getUserByEmailLinkService(id)
    if (!user || !user.id || !user.recoveryOptions || !user.tokenId) return null
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

export const changePswOtherUserService = async (requesterUser: typeUser, email: string): Promise<string|null> => {
    const user: typeUser|null = await getUserByEmailService(email)
    if (!requesterUser || requesterUser.role !== 1 || !user) return null
    const newPsw: string = getRandomId12()
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(email, encryptedPassword)
    if (success) logger.Add(`Admin ${requesterUser.email} cambió la contraseña de ${email}`, loginLogs)
    return success ? newPsw : null
}

export const changePswService = async (requesterUser: typeUser, psw: string, newPsw: string): Promise<string|null> => {
    if (!requesterUser || !requesterUser.password || !requesterUser.id || !psw || !newPsw || newPsw.length < 8) return null
    let compare: boolean = await comparePasswordsService(psw, requesterUser.password)
    if (!compare) return 'wrongPassword'
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(requesterUser.email, encryptedPassword)
    if (!success) {
        logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo cambiar su contraseña usando la que tenía`, loginLogs)
        return null
    }
    logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cambió su contraseña usando la que tenía`, loginLogs)
    const newToken: string|null = generateAccessTokenService(requesterUser, requesterUser.tokenId || 1)
    return newToken
}

export const deallocateMyTLPTerritoryService = async (user: typeUser, territoryNumber: typeTerritoryNumber): Promise<boolean> => {
    // no auth
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

export const deleteUserService = async (requesterUser: typeUser, userId: number): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1 || !userId || typeof userId !== 'number') return false
    const userToRemove: typeUser|null = await userDbConnection.GetUserById(userId)
    if (!userToRemove || userToRemove.isActive || userToRemove.role !== 0 || userToRemove.hthAssignments?.length
     || userToRemove.phoneAssignments?.length) return false
    const success: boolean = await userDbConnection.DeleteUser(userId)
    if (success) logger.Add(`Admin ${requesterUser.email} eliminó al usuario ${userToRemove.email}`, userLogs)
    else logger.Add(`Admin ${requesterUser.email} quiso eliminar al usuario ${userToRemove.email} pero algo falló`, errorLogs)
    return success
}

export const editUserService = async (requesterUser: typeUser, email: string, isActive: boolean, role: number, group: number): Promise<typeUser|null> => {
    isActive = !!isActive
    role = parseInt(role.toString())
    group = parseInt(group.toString())
    if (isNaN(role) || isNaN(group)) return null
    if (!requesterUser || requesterUser.role !== 1 || !email || typeof role !== 'number' || typeof group !== 'number') return null
    const updatedUser: typeUser|null = await userDbConnection.EditUserState(email, isActive, role, group)
    if (updatedUser) logger.Add(`Admin ${requesterUser.email} modificó al usuario ${updatedUser.email}: activado ${updatedUser.isActive}, rol ${updatedUser.role}, grupo ${updatedUser.group}`, userLogs)
    return updatedUser
}

export const generateAccessTokenService = (user: typeUser, tokenId: number): string|null => {
    if (!user || !user.id || !tokenId) return null   // change to id
    const newToken: string|null = signUserService(user.id, tokenId)  // change to id
    if (!newToken) {
        logger.Add(`Falló generateAccessTokenService() ${user.email} ${user.id} ${tokenId}`, errorLogs)
        return null
    }
    logger.Add(`Se logueó el usuario ${user.email}`, loginLogs)
    return newToken
}

export const getActivatedUserByAccessTokenService = async (token: string): Promise<typeUser|null> => {
    if (!token) return null
    const decoded: typeJWTObjectForUser|null = decodeVerifiedService(token) as typeJWTObjectForUser
    if (!decoded || !decoded.userId || !decoded.tokenId) return null       // change to id
    const user: typeUser|null = await userDbConnection.GetUserById(decoded.userId)
    if (!user || user.tokenId !== decoded.tokenId) return null
    return user && user.isActive ? user : null
}

export const getUserByEmailLinkService = async (id: string): Promise<typeUser|null> => {
    if (!id) return null
    const users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    let user0: typeUser|undefined = users.find(x => x.recoveryOptions.find(y => y.id === id) !== undefined)
    return user0 ?? null
}

export const getUserByEmailService = async (email: string): Promise<typeUser|null> => {
    if (!email) return null
    const user = await userDbConnection.GetUserByEmail(email)
    return user
}

export const getUserById = async (id: number): Promise<typeUser|null> => {
    const user: typeUser|null = await userDbConnection.GetUserById(id)
    return user
}

export const getUsersNotAuthService = async (): Promise<typeUser[]|null> => {
    // without permission filter
    let users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    users = users.reverse()
    return users
}

export const getUsersService = async (requesterUser: typeUser): Promise<typeUser[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    let users: typeUser[]|null = await userDbConnection.GetAllUsers()
    if (!users) return null
    users = users.reverse()
    return users
}

export const loginUserService = async (email: string, password: string, recaptchaToken: string): Promise<string|null> => {
    const checkRecaptch: boolean = await checkRecaptchaTokenService(recaptchaToken)
    if (!checkRecaptch) return 'recaptchaFailed'
    const user: typeUser|null = await getUserByEmailService(email)
    if (!user || !user.password || !user.tokenId || !user.id) return null
    if (!user.isActive) return 'isDisabled'
    const match: boolean = await comparePasswordsService(password, user.password)
    if (!match) return null
    const newToken: string|null = generateAccessTokenService(user, user.tokenId)
    return newToken
}

export const logoutAllService = async (requesterUser: typeUser): Promise<string|null> => {
    if (!requesterUser || !requesterUser.tokenId || !requesterUser.id) return null
    const success: boolean = await userDbConnection.UpdateTokenId(requesterUser.id, requesterUser.tokenId + 1)
    if (!success) return null
    logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cerró todas las sesiones`, loginLogs)
    const newToken: string|null = generateAccessTokenService(requesterUser, requesterUser.tokenId + 1)
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
        hthAssignments: [],
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
