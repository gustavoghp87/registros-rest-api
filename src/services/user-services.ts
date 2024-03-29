import { checkRecaptchaTokenService } from './recaptcha-services'
import { comparePasswordsService, generatePasswordHash } from './bcrypt-services'
import { createCongregationService, getConfigNotAuthedService, getConfigService, getMaxCongregationNumberService } from './config-services'
import { emailPattern, logger } from '../server'
import { errorLogs, loginLogs, userLogs } from './log-services'
import { getRandomId12, getRandomId24 } from './helpers'
import { sendRecoverAccountEmailService } from './email-services'
import { typeUserJwtObject, typeTerritoryNumber, typeUser, typeRecoveryOption } from '../models'
import { UserDb } from '../services-db/userDbConnection'
import { verifyAndDecodeAccessJwtService, generateAccessJwtService } from './jwt-services'

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
    const userToEdit: typeUser|null = await userDbConnection.GetUserByEmail(requesterUser.congregation, email)
    if (!requesterUser || requesterUser.role !== 1 || !userToEdit || (!toAssign && !toUnassign && !all)) return null
    const updatedUser: typeUser|null = await userDbConnection.AssignHTHTerritory(requesterUser.congregation, email, toAssign, toUnassign, all)
    if (updatedUser) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} modificó las asignaciones de Casa en Casa de ${updatedUser?.email}: asignados antes ${userToEdit.hthAssignments?.length ? userToEdit.hthAssignments : "ninguno"}, ahora ${updatedUser.hthAssignments?.length ? updatedUser.hthAssignments : "ninguno"}`, userLogs)
    } else {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} no pudo modificar las asignaciones de Casa en Casa de ${userToEdit?.email} (${toAssign}, ${toUnassign}, ${all})`, errorLogs)
    }
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
    const userToEdit: typeUser|null = await userDbConnection.GetUserByEmail(requesterUser.congregation, email)
    if (!requesterUser || requesterUser.role !== 1 || !userToEdit || (!toAssign && !toUnassign && !all)) return null
    const updatedUser: typeUser|null = await userDbConnection.AssignTLPTerritory(requesterUser.congregation, email, toAssign, toUnassign, all)
    if (updatedUser) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} modificó las asignaciones Telefónica de ${updatedUser?.email}: asignados antes ${userToEdit.phoneAssignments?.length ? userToEdit.phoneAssignments : "ninguno"}, ahora ${updatedUser.phoneAssignments?.length ? updatedUser.phoneAssignments : "ninguno"}`, userLogs)
    }
    return updatedUser
}

export const changeEmailService = async (requesterUser: typeUser, newEmail: string): Promise<boolean> => {
    if (!requesterUser || !newEmail || newEmail.length < 6) return false
    const success: boolean = await userDbConnection.ChangeEmail(requesterUser.congregation, requesterUser.id, newEmail)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cambió su dirección de Email a ${newEmail}`, loginLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no puedo cambiar su dirección de Email a ${newEmail}`, errorLogs)
    }
    return success
}

export const changePswByEmailLinkService = async (congregation: number, id: string, newPsw: string): Promise<string|null> => {
    if (!newPsw || typeof newPsw !== 'string' || newPsw.length < 8) return null
    const user: typeUser|null = await getUserByEmailLinkService(null, congregation, id)
    if (!user || !user.id || !user.recoveryOptions || !user.tokenId) return null
    const recoveryOption: typeRecoveryOption|undefined = user.recoveryOptions.find(x => x.id === id)
    if (!recoveryOption) return null
    if (recoveryOption.expiration < + new Date()) return 'expired'
    if (recoveryOption.used) return 'used'
    const encryptedPassword: string|null = await generatePasswordHash(congregation, newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(congregation, user.email, encryptedPassword)
    if (!success) return null
    logger.Add(congregation, `${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambió su contraseña por link de email`, loginLogs)
    const successSetAsUsed: boolean = await userDbConnection.SetRecoveryOptionAsUsed(congregation, user.email, id)
    if (!successSetAsUsed) {
        logger.Add(congregation, `No se pudo setear como usada la opción de recuperación para ${user.email} ${id}`, errorLogs)
    }
    const newToken: string|null = generateAccessTokenService(user, user.tokenId)
    return newToken
}

export const changePswOtherUserService = async (requesterUser: typeUser, email: string): Promise<string|null> => {
    const user: typeUser|null = await getUserByEmailService(requesterUser.congregation, email)
    if (!requesterUser || requesterUser.role !== 1 || !user) return null
    const newPsw: string = getRandomId12()
    const encryptedPassword: string|null = await generatePasswordHash(requesterUser.congregation, newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(requesterUser.congregation, email, encryptedPassword)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} cambió la contraseña de ${email}`, loginLogs)
    }
    return success ? newPsw : null
}

export const changePswService = async (requesterUser: typeUser, psw: string, newPsw: string): Promise<string|null> => {
    if (!requesterUser || !requesterUser.password || !requesterUser.id || !psw || !newPsw || newPsw.length < 8) return null
    let compare: boolean = await comparePasswordsService(requesterUser.congregation, psw, requesterUser.password)
    if (!compare) return 'wrongPassword'
    const encryptedPassword: string|null = await generatePasswordHash(requesterUser.congregation, newPsw)
    if (!encryptedPassword) return null
    const success: boolean = await userDbConnection.ChangePsw(requesterUser.congregation, requesterUser.email, encryptedPassword)
    if (!success) {
        logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo cambiar su contraseña usando la que tenía`, loginLogs)
        return null
    }
    logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cambió su contraseña usando la que tenía`, loginLogs)
    const newToken: string|null = generateAccessTokenService(requesterUser, requesterUser.tokenId || 1)
    return newToken
}

export const deallocateMyTLPTerritoryService = async (user: typeUser, territoryNumber: typeTerritoryNumber): Promise<boolean> => {
    // no auth
    if (!user) return false
    const toUnassign: number = parseInt(territoryNumber)
    if (!toUnassign || isNaN(toUnassign)) {
        logger.Add(user.congregation, `Falló deallocateMyTLPTerritoryService(): ${toUnassign}`, errorLogs)
        return false
    }
    const updatedUser: typeUser|null = await userDbConnection.AssignTLPTerritory(user.congregation, user.email, 0, toUnassign, false)
    if (updatedUser) {
        logger.Add(user.congregation, `Se desasignó el territorio de telefónica ${toUnassign} a ${user.email} porque lo cerró`, userLogs)
    } else {
        logger.Add(user.congregation, `El ${user.role === 1 ? 'admin' : 'usuario'} ${user.email} no pudo ser desasignado del territorio de telefónica ${toUnassign} después de cerrarlo`, errorLogs)
    }
    return !!updatedUser
}

export const deleteUserService = async (requesterUser: typeUser, userId: number): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1 || !userId || typeof userId !== 'number') return false
    const userToRemove: typeUser|null = await userDbConnection.GetUserById(requesterUser.congregation, userId)
    if (!userToRemove || userToRemove.isActive || userToRemove.role !== 0 || userToRemove.hthAssignments?.length
     || userToRemove.phoneAssignments?.length) return false
    const success: boolean = await userDbConnection.DeleteUser(requesterUser.congregation, userId)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} eliminó al usuario ${userToRemove.email} (${userToRemove.id})`, userLogs)
    } else {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} quiso eliminar al usuario ${userToRemove.email} (${userToRemove.id}) pero algo falló`, errorLogs)
    }
    return success
}

export const editUserService = async (requesterUser: typeUser, email: string, isActive: boolean, role: number): Promise<typeUser|null> => {
    isActive = !!isActive
    role = parseInt(role.toString())
    if (isNaN(role)) return null
    if (!requesterUser || requesterUser.role !== 1 || !email || typeof role !== 'number') return null
    const updatedUser: typeUser|null = await userDbConnection.EditUserState(requesterUser.congregation, email, isActive, role)
    if (updatedUser) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} modificó al usuario ${updatedUser.email}: activado ${updatedUser.isActive}, rol ${updatedUser.role}`, userLogs)
    }
    return updatedUser
}

const generateAccessTokenService = (user: typeUser, tokenId: number): string|null => {
    if (!user || !user.id || !tokenId) return null   // change to id
    const newToken: string|null = generateAccessJwtService(user.congregation, user.id, tokenId)
    if (!newToken) {
        logger.Add(user.congregation, `Falló generateAccessTokenService() ${user.email} ${user.id} ${tokenId}`, errorLogs)
        return null
    }
    logger.Add(user.congregation, `Se logueó el usuario ${user.email}`, loginLogs)
    return newToken
}

export const getActivatedUserByAccessTokenService = async (token: string): Promise<typeUser|null> => {
    if (!token) return null
    const decoded: typeUserJwtObject|null = verifyAndDecodeAccessJwtService(token)
    if (!decoded || !decoded.userId || !decoded.tokenId || !decoded.congregation) return null
    const user: typeUser|null = await userDbConnection.GetUserById(decoded.congregation, decoded.userId)
    if (!user || user.tokenId !== decoded.tokenId) return null
    return user && user.isActive ? user : null
}

export const getUserByEmailLinkService = async (congregationString: string|null, congregation: number|null, id: string): Promise<typeUser|null> => {
    if ((!congregationString && !congregation) || !id) return null
    if (congregationString) {
        try {
            congregation = parseInt(congregationString)
            if (isNaN(congregation)) throw new Error()
        } catch {
            logger.Add(0, "No se pudo capturar la congregación del link del email", errorLogs)
            return null;
        }
    }
    if (!congregation) return null
    const users: typeUser[]|null = await userDbConnection.GetAllUsers(congregation)
    if (!users) return null
    let user0: typeUser|undefined = users.find(x => x.recoveryOptions.find(y => y.id === id) !== undefined)
    return user0 ?? null
}

export const getUserByEmailService = async (congregation: number, email: string): Promise<typeUser|null> => {
    if (!email) return null
    const user = await userDbConnection.GetUserByEmail(congregation, email)
    return user
}

export const getUserByEmailEveryCongregationService = async (email: string): Promise<typeUser|null> => {
    if (!email) return null
    const user = await userDbConnection.GetUserByEmailEveryCongregation(email)
    return user
}

export const getUserById = async (congregation: number, id: number): Promise<typeUser|null> => {
    const user: typeUser|null = await userDbConnection.GetUserById(congregation, id)
    return user
}

export const getAllUsersService = async (requesterUser: typeUser): Promise<typeUser[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    let users: typeUser[]|null = await userDbConnection.GetAllUsers(requesterUser.congregation)
    if (!users) return null
    users = users.reverse()
    return users
}

export const getUsersService = async (requesterUser: typeUser): Promise<typeUser[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    let users: typeUser[]|null = await userDbConnection.GetAllUsers(requesterUser.congregation)
    if (!users) return null
    users = users.reverse()
    return users
}

export const loginUserService = async (email: string, password: string, recaptchaToken: string): Promise<string|null> => {
    const checkRecaptch: boolean = await checkRecaptchaTokenService(1, recaptchaToken)
    if (!checkRecaptch) return 'recaptchaFailed'
    const user: typeUser|null = await getUserByEmailEveryCongregationService(email)
    if (!user || !user.password || !user.tokenId || !user.id) return null
    if (!user.isActive) return 'disabled'
    const match: boolean = await comparePasswordsService(user.congregation, password, user.password)
    if (!match) return null
    const newToken: string|null = generateAccessTokenService(user, user.tokenId)
    return newToken
}

export const logoutAllService = async (requesterUser: typeUser): Promise<string|null> => {
    if (!requesterUser || !requesterUser.tokenId || !requesterUser.id) return null
    const success: boolean = await userDbConnection.UpdateTokenId(requesterUser.congregation, requesterUser.id, requesterUser.tokenId + 1)
    if (!success) return null
    logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cerró todas las sesiones`, loginLogs)
    const newToken: string|null = generateAccessTokenService(requesterUser, requesterUser.tokenId + 1)
    return newToken
}

export const recoverAccountService = async (email: string): Promise<string> => {
    if (!email) return 'no user'
    const user: typeUser|null = await getUserByEmailEveryCongregationService(email)
    if (!user) return 'no user'
    const id: string = getRandomId24()
    let success: boolean = await userDbConnection.AddRecoveryOption(user.congregation, email, id)
    if (!success) return ''
    logger.Add(user.congregation, `${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} solicitó un email de recuperación de contraseña`, loginLogs)
    success = await sendRecoverAccountEmailService(user.congregation, email, id)
    return success ? 'ok' : 'not sent'
}

const createUser = async (congregation: number, email: string, password: string, newCongregationNumber: number = 0) => {
    const encryptedPassword: string|null = await generatePasswordHash(congregation, password)
    if (!encryptedPassword)
        return false
    const newUser: typeUser = {
        congregation: newCongregationNumber ? newCongregationNumber : congregation,
        email,
        hthAssignments: [],
        id: Date.now(),
        isActive: true,
        password: encryptedPassword,
        phoneAssignments: [],
        recoveryOptions: [],
        role: newCongregationNumber ? 1 : 0,
        tokenId: 1
    }
    const success: boolean = await userDbConnection.RegisterUser(congregation, newUser, newCongregationNumber)
    return success
}

export const registerUserAdminsService = async (requesterUser: typeUser, email: string, password: string): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1)
        return false
    if (!email || !emailPattern.test(email) || !password || password.length < 8)
        return false
    const success = await createUser(requesterUser.congregation, email, password)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} registró un usuario con email ${email}`, loginLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo registrar un usuario con email ${email}`, errorLogs)
    }
    return success
}

export const registerUserService = async (id: string, congregation: number, email: string, password: string): Promise<boolean|string> => {
    if (!id || !email || !emailPattern.test(email) || !password || password.length < 8 || !congregation || isNaN(congregation) || !Number.isInteger(congregation))
        return false
    const congregationConfig = await getConfigNotAuthedService(congregation)
    const invitation = congregationConfig?.invitations?.find(i => i.id === id && i.email === email)
    if (!invitation)
        return false
    if (invitation.expire < Date.now())
        return 'expired'
    let success = false
    if (invitation.isNewCongregation) {
        const maxCongregationNumber = await getMaxCongregationNumberService()
        if (!maxCongregationNumber) return false
        success = await createUser(1, email, password, maxCongregationNumber + 1)
        if (success) {
            logger.Add(1, `Se creó un usuario Administrador ${email} para la Congregación nueva ${maxCongregationNumber + 1}`, loginLogs)
            await createCongregationService(maxCongregationNumber + 1, email)
        } else {
            logger.Add(1, `No pudo crearse un usuario Administrador para la Congregación nueva ${maxCongregationNumber + 1} (${email})`, errorLogs)
        }
    } else {
        success = await createUser(congregation, email, password)
        if (success) {
            logger.Add(congregation, `${email} creó un usuario por invitación`, loginLogs)
        } else {
            logger.Add(congregation, `${email} no pudo crearse un usuario`, errorLogs)
        }
    }
    return success
}
