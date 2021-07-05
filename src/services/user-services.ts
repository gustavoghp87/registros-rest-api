import Axios from 'axios'
import { typeUser } from '../models/user'
import bcrypt from 'bcrypt'
import { privateKey } from "./env-variables"
import { UserDb } from './database-services/userDbConnection'

export const checkAdminByToken = async (token: string) => {
    const user = await searchUserByToken(token)
    if (!user || !user.estado || user.role!==1) {console.log("No autenticado por token"); return false}
    console.log("Pasó auth ############", user.email)
    return true
}

export const checkAuthByToken = async (token: string) => {
    const user = await searchUserByToken(token)
    if (!user || !user.estado) {console.log("No autenticado por token"); return false}
    console.log("Pasó auth ############", user.email)
    return true
}

export const checkRecaptchaToken = async (token: string) => {
    const publicKey = token
    const url = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyURL = `${url}?secret=${privateKey}&response=${publicKey}`
    const axios = await Axios.post(verifyURL)
    const { success } = axios.data
    console.log("Recaptcha:", success)
    return success
}

export const userAuthForGraphQL = async (token: string) => {
    console.log("PASSING BY /AUTH GraphQL....", token?.length)    
    if (!token) return null
    const user = await searchUserByToken(token)
    if (!user || !await checkAuthByToken(token)) return null
    console.log("User auth for GraphQL,", user.email)
    return user
}

export const userAdminForGraphQL = async (token: string) => {
    console.log("PASSING BY /AUTH GraphQL....", token?.length)
    if (!token) return null
    const user = await searchUserByToken(token)
    if (!user || !await checkAdminByToken(token)) return null
    console.log("User admin for GraphQL,", user.email)
    return user
}

export const searchUserByEmail = async (email: string) => {
    console.log("Searching user by email,", email);
    const user = await new UserDb().SearchUserByEmail(email)
    console.log("User found by Email:", user?.email)
    return user
}

export const searchUserById = async (_id: string) => {
    console.log("Searching user by id,", _id);
    const user = await new UserDb().SearchUserById(_id)
    console.log("User found by Id:", user?.email)
    return user
}

export const searchUserByToken = async (token: string) => {
    console.log("Searching user by token", token.length)
    const user = await new UserDb().SearchUserByToken(token)
    if (!user) return null
    console.log("User found by token:", user.email)
    return user
}

export const searchAllUsers = async () => {
    console.log("Searching all users")
    let users = await new UserDb().SearchAllUsers()
    users = users.reverse()
    return users
}

export const addTokenToUser = async (email:string, token:string) => {
    const result = await new UserDb().AddTokenToUser(email, token)
    if (!result) {
        console.log("Error trying to add token in db...")
        return false
    }
    console.log("Token added to db", token.length)
    return true
}

export const registerUser = async (email: string, password: string, group: number) => {
    const passwordEncrypted = await bcrypt.hash(password, 12)
    const newUser:typeUser = {
        role: 0,
        estado: false,
        email,
        password: passwordEncrypted,
        group
    }
    const result = await new UserDb().RegisterUser(newUser)
    if (!result) {
        console.error("Error signing up user...")
        return false
    }
    console.log("User created successfully", newUser)
    return true
}

export const changeMode = async (email:string, darkMode:boolean) => {
    const response = await new UserDb().ChangeMode(email, darkMode)
    if (!response) {
        console.log("Error trying to change Dark Mode")
        return false
    }
    console.log("Dark Mode changed from", !darkMode, "a", darkMode, "(" + email + ")")
    return true
}

export const changePsw = async (email:string, newPsw:string) => {
    const passwordEncrypted = await bcrypt.hash(newPsw, 12)
    const response = await new UserDb().ChangePsw(email, passwordEncrypted)
    if (!response) {
        console.log("Fail trying to change password for", email)
        return false
    }
    console.log("Password changed successfully for", email)
    return true
}

export const updateUserState = async (input: any) => {
    if (!await checkAdminByToken(input.token)) return null
    const user = await new UserDb().UpdateUserState(input)
    if (!user) return null
    return user
}

export const assignTerritory = async (input: any) => {
    if (!await checkAdminByToken(input.token)) return null
    const user = await new UserDb().AssignTerritory(input)
    if (!user) return null
    return user
}

export const deallocateMyTerritory = async (territorio: string, token: string) => {
    console.log("deallocate my territory ", territorio)
    if (!await checkAuthByToken(token)) return false
    const user:typeUser = await searchUserByToken(token)
    console.log(user.email)
    if (!user || !user._id) return false
    let input:any = {}
    input.user_id = user._id
    input.desasignar = parseInt(territorio)
    const user1 = await new UserDb().AssignTerritory(input)
    if (!user1) return false
    return true
}
