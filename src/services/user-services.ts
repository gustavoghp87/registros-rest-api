import Axios from 'axios'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserDb } from '../services-db/userDbConnection'
import { bcryptSalt, privateKey, string_jwt } from "../env-variables"
import { accessTokensExpiresIn } from '../server'
import { sendEmailNewPsw } from './email-services'
import { decodedObject, typeUser } from '../models/user'
import { ObjectId } from 'mongodb'

export const getUserByEmail = async (email: string): Promise<typeUser|null> => {
    const user = await new UserDb().GetUserByEmail(email)
    if (!user) return null
    console.log(`\n${(new Date()).toLocaleString("es-AR")} - User found by email: ${email}\n`)
    return user
}

const getUserById = async (_id: string): Promise<typeUser|null> => {
    const user: typeUser|null = await new UserDb().GetUserById(_id)
    if (!user) return null
    console.log(`\n${(new Date()).toLocaleString("es-AR")} - User found by id: ${_id}\n`)
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
    const encryptedPassword: string = await generatePasswordHash(password)
    const newUser: typeUser = {
        role: 0,
        estado: false,
        email,
        password: encryptedPassword,
        group
    }
    const result: boolean = await new UserDb().RegisterUser(newUser)
    if (!result) { console.error("Error signing up user..."); return false }
    console.log("User created successfully", newUser)
    return true
}

export const generateAccessToken = (userId: Object|null): string|null => {
    if (!userId) return null
    return jwt.sign({ userId }, string_jwt, { expiresIn: accessTokensExpiresIn })
}

export const getUserByAccessToken = async (token: string): Promise<typeUser|null> => {         // único que va a DB
    const userId: string|null = retrieveUserIdByAccessToken(token)
    if (!userId) return null
    const user: typeUser|null = await getUserById(userId)
    if (!user) return null
    console.log("User found by access token:", user.email)
    return user
}

export const getActivatedUserByAccessToken = async (token: string): Promise<typeUser|null> => {
    if (!token) return null
    const user: typeUser|null = await getUserByAccessToken(token)
    if (!user) return null
    const activated: boolean = verifyActivatedUser(user)
    return activated ? user : null
}

export const getActivatedAdminByAccessToken = async (token: string): Promise<typeUser|null> => {
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

export const retrieveUserIdByAccessToken = (token: string): string|null => {
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

const generatePasswordHash = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, parseInt(bcryptSalt))
}

export const comparePasswords = async (password0: string, password1: string): Promise<boolean> => {
    return await bcrypt.compare(password0, password1)
}

export const logoutAll = async (token: string): Promise<string|null> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return null

    user._id = new ObjectId()

    const success: boolean = await new UserDb().RegisterUser(user)
    if (!success) return null

    const removedUser: boolean = await new UserDb().DeleteUser(user._id.toString())
    if (!removedUser) return null

    const newToken: string|null = generateAccessToken(user._id)
    return newToken
}

export const changePsw = async (token: string, psw: string, newPsw: string): Promise<string|null> => {
    if (!psw || !newPsw || typeof newPsw !== 'string' || newPsw.length < 6) return null
    let user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user || !user.password || !user._id) return null
    let compare: boolean = await comparePasswords(psw, user.password)
    if (!compare) return "wrongPassword"
    const encryptedPassword: string = await generatePasswordHash(newPsw)
    const response: boolean = await new UserDb().ChangePsw(user.email, encryptedPassword)
    if (!response) { console.log("Fail trying to change password for", user.email); return null }
    console.log("Password changed successfully for", user.email)
    const newToken: string|null = generateAccessToken(user._id)
    return newToken
}

export const changePswOtherUser = async (token: string, email: string): Promise<string|null> => {
    if (!verifyActivatedAdminByAccessToken(token)) return null
    const user: typeUser|null = await getUserByEmail(email)
    if (!user) return null
    const getRandomCharacter = (i: number): string => Math.random().toString(36).slice(i*-1)
    const newPsw: string = getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4);
    const encryptedPassword: string = await generatePasswordHash(newPsw)
    let success: boolean = await new UserDb().ChangePsw(email, encryptedPassword)
    if (!success) return null
    const emailSuccess: boolean = await sendEmailNewPsw(user.email, newPsw)
    if (!emailSuccess) return "email failed"
    return "ok"
}

export const modifyUser = async (token: string,
     user_id: string, estado: boolean, role: number, group: number): Promise<typeUser|null> => {
    console.log("Updating", user_id)
    if (!verifyActivatedAdminByAccessToken(token)) return null
    const user: typeUser|null = await new UserDb().UpdateUserState(user_id, estado, role, group)
    return user ? user : null
}

export const changeMode = async (token: string, darkMode: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return false
    const response: boolean = await new UserDb().ChangeMode(user.email, darkMode)
    if (!response) { console.log("Error trying to change Dark Mode"); return false }
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
