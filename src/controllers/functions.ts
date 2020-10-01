import { client } from './database'
import Axios from 'axios'
import { IUser } from '../types/types'
import bcrypt from 'bcrypt'


export const searchUserByEmail = async (email:string) => {
    const user = await client.db("Misericordia-Web").collection('usuarios').findOne({email})
    return user
}

export const searchUserByToken = async (newtoken:string) => {
    const user = await client.db("Misericordia-Web").collection('usuarios').findOne({newtoken})
    return user
}

export const searchAllUsers = async () => {
    const users = await client.db("Misericordia-Web").collection('usuarios').find().toArray()
    return users
}

export const addTokenToUser = async (email:string, token:string) => {
    try {
        await client.db("Misericordia-Web").collection('usuarios').updateOne({email}, {$set:{newtoken:token}})
        console.log("Token agregado a db correctamente", token)
        return true
    } catch(error) {
        console.log("Error al intentar agregar token a db...", error)
        return false
    }
}

export const registerUser = async (email:string, password:string, group:number) => {

    const passwordEncrypted = await bcrypt.hash(password, 12)

    const newUser = <IUser> {
        role: 0,
        estado: "desactivado",
        actividad: [],
        email,
        password: passwordEncrypted,
        group,
        isAuth: false,
        isAdmin: false
    }

    try {
        await client.db("Misericordia-Web").collection('usuarios').insertOne(newUser)
        console.log(newUser);
        
        return true
    } catch (e) {
        console.error(e);
        return false
    }
}

export const checkRecaptchaToken = async (token:string) => {
    const privateKey = process.env.RECAPTCHA_SECRET || ""
    const publicKey = token
    const url = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyURL = `${url}?secret=${privateKey}&response=${publicKey}`
    const axios = await Axios.post(verifyURL)
    const { success } = axios.data
    console.log("Recaptcha:", success);
    return success
}


////////////////////////////////////////////////////////////////////////////////////////////////

export const searchBuildingsByNumber = async (num:string) => {
    const terr = await client.db("Misericordia-Web").collection('viviendas')
        .find({territorio:num}).toArray()
    return terr
}


