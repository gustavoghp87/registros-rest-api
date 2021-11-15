import Axios from 'axios'
import bcrypt from 'bcrypt'
import { UserDb } from '../services-db/userDbConnection'
import { privateKey } from "../env-variables"
import { sendEmailNewPsw } from './email-services'
import { typeUser } from '../models/user'

export const getUserByEmail = async (email: string): Promise<typeUser|null> => {
    const user = await new UserDb().GetUserByEmail(email)
    if (!user) return null
    console.log(`${(new Date()).toLocaleString("es-AR")} - User found by email: ${email}`)
    return user
}

export const getUserByToken = async (token: string): Promise<typeUser|null> => {
    const user: typeUser|null = await new UserDb().GetUserByToken(token)
    if (!user) return null
    console.log(`${(new Date()).toLocaleString("es-AR")} - User found by token: ${user.email}`)
    return user
}

export const checkAuthByToken = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getUserByToken(token)
    if (!user || !user.estado) { console.log("No auth by token"); return false }
    return true
}

export const checkAuthByTokenReturnUser = async (token: string): Promise<typeUser|null> => {
    const user: typeUser|null = await getUserByToken(token)
    if (!user || !user.estado) { console.log("No auth by token"); return null }
    return user
}

export const checkAdminByToken = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getUserByToken(token)
    if (!user || !user.estado || user.role !== 1 ) { console.log("No auth Admin by token"); return false }
    return true
}

export const checkAdminByTokenReturnUser = async (token: string): Promise<typeUser|null> => {
    const user: typeUser|null = await getUserByToken(token)
    if (!user || !user.estado || user.role !== 1 ) { console.log("No auth Admin by token"); return null }
    return user
}

export const getUsers = async (token: string): Promise<typeUser[]|null> => {
    if (!await checkAdminByToken(token)) return null
    let users: typeUser[]|null = await new UserDb().SearchAllUsers()
    if (!users) { console.log("Users cannot be retrieved"); return null }
    users = users.reverse()
    return users
}

export const checkRecaptchaToken = async (token: string): Promise<boolean> => {
    const publicKey: string = token
    const url: string = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyURL: string = `${url}?secret=${privateKey}&response=${publicKey}`
    const axios: any|null = await Axios.post(verifyURL)
    if (!axios || !axios.data || !axios.data.success) { console.log("Recaptcha validation failed"); return false }
    return true
}

export const addTokenToUser = async (email: string, token: string): Promise<boolean> => {
    const result: boolean = await new UserDb().AddTokenToUser(email, token)
    if (!result) { console.log("Error trying to add token in db..."); return false }
    return true
}

export const registerUser = async (email: string, password: string, group: number): Promise<boolean> => {
    const encryptedPassword: string = await bcrypt.hash(password, 12)
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

export const changeMode = async (email: string, darkMode: boolean): Promise<boolean> => {
    const response: boolean = await new UserDb().ChangeMode(email, darkMode)
    if (!response) { console.log("Error trying to change Dark Mode"); return false }
    console.log("Dark Mode changed from", !darkMode, "a", darkMode, "(" + email + ")")
    return true
}

export const changePsw = async (email: string, newPsw: string): Promise<boolean> => {
    const passwordEncrypted: string = await bcrypt.hash(newPsw, 12)
    const response: boolean = await new UserDb().ChangePsw(email, passwordEncrypted)
    if (!response) { console.log("Fail trying to change password for", email); return false }
    console.log("Password changed successfully for", email)
    return true
}

export const changePswOtherUser = async (token: string, email: string): Promise<boolean> => {
    if (!checkAdminByToken(token)) return false
    const user: typeUser|null = await getUserByEmail(email)
    if (!user) return false
    const getRandomCharacter = (i: number): string => Math.random().toString(36).slice(i*-1)
    const newPsw: string = getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4);
    const encryptedPassword: string = await bcrypt.hash(newPsw, 12)
    let success: boolean = await new UserDb().ChangePsw(email, encryptedPassword)
    if (!success) return false
    success = await sendEmailNewPsw(user.email, newPsw)
    return success
}

export const modifyUser = async (token: string,
     user_id: string, estado: boolean, role: number, group: number): Promise<typeUser|null> => {
    console.log("Updating", user_id)
    if (!checkAdminByToken(token)) return null
    const user: typeUser|null = await new UserDb().UpdateUserState(user_id, estado, role, group)
    if (!user) return null
    return user
}

export const assignTerritory = async (token: string,
    user_id: string, asignar: number, desasignar: number, all: boolean): Promise<typeUser|null> => {
    if (!checkAdminByToken(token)) return null
    const user: typeUser|null = await new UserDb().AssignTerritory(user_id, asignar, desasignar, all)
    if (!user) return null
    return user
}

export const deallocateMyTerritory = async (token: string, territory: string): Promise<boolean> => {
   console.log("Deallocate my territory ", territory)
   let user: typeUser|null = await checkAuthByTokenReturnUser(token)
   if (!user || !user._id) return false
   let territoryNumber = 0
   try { territoryNumber = parseInt(territory) } catch (error) { console.log(error); return false }
   user = await new UserDb().AssignTerritory(user._id.toString(), 0, territoryNumber, false)
   if (!user) return false
   return true
}
