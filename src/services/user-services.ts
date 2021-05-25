import Axios from 'axios'
import { typeUser } from '../models/user'
import bcrypt from 'bcrypt'
import { privateKey } from "./env-variables";
import { dbClient } from '../server'


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
    if (!user || !checkAuthByToken(token)) return null
    console.log("User auth for GraphQL,", user.email)
    return user
}

export const userAdminForGraphQL = async (token: string) => {
    console.log("PASSING BY /AUTH GraphQL....", token?.length)
    if (!token) return null
    const user = await searchUserByToken(token)
    if (!user || !checkAdminByToken(token)) return null
    console.log("User admin for GraphQL,", user.email)
    return user
}

export const searchUserByEmail = async (email: string) => {
    console.log("Searching user by email,", email);
    const user = await dbClient.SearchUserByEmail(email)
    console.log("User found by Email:", user?.email)
    return user
}

export const searchUserById = async (_id: string) => {
    console.log("Searching user by id,", _id);
    const user = await dbClient.SearchUserById(_id)
    console.log("User found by Id:", user?.email)
    return user
}

export const searchUserByToken = async (token: string) => {
    console.log("Searching user by token", token.length)
    const user = await dbClient.SearchUserByToken(token)
    if (!user) return null
    console.log("User found by token:", user.email)
    return user
}

export const searchAllUsers = async () => {
    console.log("Searching all users")
    let users = await dbClient.SearchAllUsers()
    users = users.reverse()
    return users
}

export const addTokenToUser = async (email:string, token:string) => {
    const result = await dbClient.AddTokenToUser(email, token)
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
    const result = await dbClient.RegisterUser(newUser)
    if (!result) {
        console.error("Error signing up user...")
        return false
    }
    console.log("User created successfully", newUser)
    return true
}

export const changeMode = async (email:string, darkMode:boolean) => {
    const response = await dbClient.ChangeMode(email, darkMode)
    if (!response) {
        console.log("Error trying to change Dark Mode")
        return false
    }
    console.log("Dark Mode changed from", !darkMode, "a", darkMode, "(" + email + ")")
    return true
}

export const changePsw = async (email:string, newPsw:string) => {
    const passwordEncrypted = await bcrypt.hash(newPsw, 12)
    const response = await dbClient.ChangePsw(email, passwordEncrypted)
    if (!response) {
        console.log("Fail trying to change password for", email)
        return false
    }
    console.log("Password changed successfully for", email)
    return true
}

export const updateUserState = async (input: any) => {
    if (!checkAdminByToken(input.token)) return null
    const user = await dbClient.UpdateUserState(input)
    if (!user) return null
    return user
}

export const asignTerritory = async (input: any) => {
    if (!checkAdminByToken(input.token)) return null
    const user = await dbClient.AsignTerritory(input)
    if (!user) return null
    return user
}
