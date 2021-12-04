import Axios from 'axios'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { bcryptSalt, privateKey, string_jwt } from '../env-variables'
import { UserDb } from '../services-db/userDbConnection'
import { accessTokensExpiresIn } from '../server'
import { sendEmailRecoverAccount } from './email-services'
import { decodedObject, recoveryOption, typeUser } from '../models/user'

export const getUserByEmail = async (email: string): Promise<typeUser|null> => {
    const user = await new UserDb().GetUserByEmail(email)
    if (!user) return null
    console.log(`\n${(new Date()).toLocaleString("es-AR")} -        User found by email: ${email}\n`)
    return user
}

const getUserById = async (_id: string): Promise<typeUser|null> => {
    const user: typeUser|null = await new UserDb().GetUserById(_id)
    if (!user) return null
    console.log(`\n${(new Date()).toLocaleString("es-AR")} -        User found by id: ${_id}\n`)
    return user
}

export const getUsers = async (token: string): Promise<typeUser[]|null> => {
    if (!await verifyActivatedAdminByAccessToken(token)) return null
    let users: typeUser[]|null = await new UserDb().GetAllUsers()
    if (!users) { console.log("Users cannot be retrieved"); return null }
    users = users.reverse()
    return users
}

export const checkRecaptchaToken = async (token: string): Promise<boolean> => {
    const publicKey: string = token
    const url: string = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyURL: string = `${url}?secret=${privateKey}&response=${publicKey}`
    const response: any|null = await Axios.post(verifyURL)
    if (!response || !response.data || !response.data.success) { console.log("Recaptcha validation failed"); return false }
    return true
}

export const registerUser = async (email: string, password: string, group: number): Promise<boolean> => {
    if (!password || typeof password !== 'string' || password.length < 6) return false
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
    const result: boolean = await new UserDb().RegisterUser(newUser)
    if (!result) { console.error("Error signing up user..."); return false }
    console.log("User created successfully", newUser)
    return true
}

export const generateAccessToken = (userId: Object|null, tokenId: number): string|null => {
    if (!userId) return null
    if (!tokenId) tokenId = 1
    try { if (typeof tokenId !== 'number') tokenId = parseInt(tokenId) } catch { return null }
    return jwt.sign({ userId, tokenId }, string_jwt, { expiresIn: accessTokensExpiresIn })
}

const getUserByAccessToken = async (token: string): Promise<typeUser|null> => {
    const userId: string|null = retrieveUserIdByAccessToken(token)
    if (!userId) return null
    const tokenId: number|null = retrieveTokenIdByAccessToken(token)
    if (!tokenId) return null
    const user: typeUser|null = await getUserById(userId)
    if (!user) return null
    user.tokenId = user.tokenId ?? 1
    if (tokenId < user.tokenId) return null
    console.log("User found by access token:", user.email)
    return user
}

const retrieveUserIdByAccessToken = (token: string): string|null => {
    if (!token || typeof token !== 'string') return null 
    const timeNow: number = Date.now() / 1000
    let decoded: decodedObject|null;
    try {
        decoded = jwt.verify(token, string_jwt) as decodedObject
        if (decoded && decoded.iat && decoded.exp && decoded.iat < timeNow && decoded.exp > timeNow) return decoded.userId
        else return null
    } catch {
        return null
    }
}

const retrieveTokenIdByAccessToken = (token: string): number|null => {
    if (!token || typeof token !== 'string') return null 
    let decoded: decodedObject|null;
    try {
        decoded = jwt.verify(token, string_jwt) as decodedObject
        if (decoded && decoded.tokenId) return decoded.tokenId
        else return 1
    } catch {
        return null
    }
}

export const getActivatedUserByAccessToken = async (token: string): Promise<typeUser|null> => {
    if (!token) return null
    const user: typeUser|null = await getUserByAccessToken(token)
    if (!user) return null
    const activated: boolean = verifyActivatedUser(user)
    return activated ? user : null
}

const getActivatedAdminByAccessToken = async (token: string): Promise<typeUser|null> => {
    if (!token) return null
    const user: typeUser|null = await getUserByAccessToken(token)
    if (!user) return null
    const activated: boolean = verifyActivatedAdmin(user)
    return activated ? user : null
}

export const verifyActivatedUserByAccessToken = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    return user ? true : false
}

const verifyActivatedUser = (user: typeUser): boolean => {
    return user && user.estado ? true : false
}

const verifyActivatedAdmin = (user: typeUser): boolean => {
    return user && user.estado && user.role == 1 ? true : false
}

export const verifyActivatedAdminByAccessToken = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessToken(token)
    return user ? true : false
}

const generatePasswordHash = async (password: string): Promise<string|null> => {
    try {
        return await bcrypt.hash(password, parseInt(bcryptSalt))
    } catch (error) {
        console.log(error)
        return null
    }
}

export const comparePasswords = async (password0: string, password1: string): Promise<boolean> => {
    return await bcrypt.compare(password0, password1)
}

export const logoutAll = async (token: string): Promise<string|null> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user || !user._id) return null
    const tokenId = user.tokenId || 1
    const success: boolean = await new UserDb().UpdateTokenId(user._id.toString(), tokenId + 1)
    if (!success) return null
    const newToken: string|null = generateAccessToken(user._id, tokenId + 1 || 2)
    return newToken
}

export const changePsw = async (token: string, psw: string, newPsw: string): Promise<string|null> => {
    if (!psw || !newPsw || typeof newPsw !== 'string' || newPsw.length < 8) return null
    let user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user || !user.password || !user._id) return null
    let compare: boolean = await comparePasswords(psw, user.password)
    if (!compare) return "wrongPassword"
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    const response: boolean = await new UserDb().ChangePsw(user.email, encryptedPassword)
    if (!response) { console.log("Fail trying to change password for", user.email); return null }
    console.log("Password changed successfully for", user.email)
    const newToken: string|null = generateAccessToken(user._id, user.tokenId || 1)
    return newToken
}

const getRandomCharacter = (i: number): string => Math.random().toString(36).slice(i*-1)

export const changePswOtherUser = async (token: string, email: string): Promise<string|null> => {
    if (!verifyActivatedAdminByAccessToken(token)) return null
    const user: typeUser|null = await getUserByEmail(email)
    if (!user) return null
    const newPsw: string = getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4);
    const encryptedPassword: string|null = await generatePasswordHash(newPsw)
    if (!encryptedPassword) return null
    let success: boolean = await new UserDb().ChangePsw(email, encryptedPassword)
    if (!success) return null
    return newPsw
}

export const getUserByEmailLink = async (id: string): Promise<typeUser|null> => {
    const user: typeUser|null = await new UserDb().GetUserByEmailLink(id)
    return user
}

export const changePswByEmailLink = async (id: string, newPsw: string): Promise<string|null> => {
    if (!newPsw || typeof newPsw !== 'string' || newPsw.length < 8) return null
    const user: typeUser|null = await new UserDb().GetUserByEmailLink(id)
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
    const response: boolean = await new UserDb().ChangePsw(user.email, encryptedPassword)
    if (!response) { console.log("Fail trying to change password for", user.email); return null }
    console.log("Password changed successfully for", user.email)
    await new UserDb().SetRecoveryOptionAsUsed(user, id)
    const newToken: string|null = generateAccessToken(user._id, user.tokenId || 1)
    return newToken
}

export const recoverAccount = async (email: string): Promise<string> => {
    const user: typeUser|null = await getUserByEmail(email)
    if (!user) return "no user"
    const id: string = getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4)
        + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4)
    let success: boolean = await new UserDb().AddRecoveryOption(email, id)
    if (!success) return "not sent"
    success = await sendEmailRecoverAccount(email, id)
    return "ok"
}

export const modifyUser = async (token: string,
     user_id: string, estado: boolean, role: number, group: number): Promise<typeUser|null> => {
    if (!verifyActivatedAdminByAccessToken(token)) return null
    const user: typeUser|null = await new UserDb().UpdateUserState(user_id, estado, role, group)
    return user ? user : null
}

export const changeMode = async (token: string, darkMode: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return false
    const response: boolean = await new UserDb().ChangeMode(user.email, darkMode)
    if (!response) return false
    console.log("Dark Mode changed from", !darkMode, "to", darkMode, "(" + user.email + ")")
    return true
}

export const assignTerritory = async (token: string,
    user_id: string, asignar: number, desasignar: number, all: boolean): Promise<typeUser|null> => {
    if (!verifyActivatedAdminByAccessToken(token)) return null
    const user: typeUser|null = await new UserDb().AssignTerritory(user_id, asignar, desasignar, all)
    return user ? user : null
}

export const deallocateMyTerritory = async (token: string, territory: string): Promise<boolean> => {
   console.log("Deallocate my territory", territory)
   let user: typeUser|null = await getActivatedUserByAccessToken(token)
   if (!user || !user._id) return false
   let territoryNumber: number = 0
   try { territoryNumber = parseInt(territory) } catch (error) { console.log(error); return false }
   user = await new UserDb().AssignTerritory(user._id.toString(), 0, territoryNumber, false)
   return user ? true : false
}
