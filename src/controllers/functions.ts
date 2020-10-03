import { client, dbMW, collUsers, collTerr } from './database'
import Axios from 'axios'
import { typeUser, typeVivienda } from '../types/types'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'


export const searchUserByEmail = async (email:string) => {
    const user = await client.db(dbMW).collection(collUsers).findOne({email})
    return user
}

export const searchUserById = async (_id:string) => {
    console.log("buscando por id,", _id);
    const user = await client.db(dbMW).collection(collUsers)
        .findOne({_id: new ObjectId(_id)})
    return user
}

export const searchUserByToken = async (newtoken:string) => {
    const user = await client.db(dbMW).collection(collUsers).findOne({newtoken})
    return user
}

export const searchAllUsers = async () => {
    const users = await client.db(dbMW).collection(collUsers).find().toArray()
    return users
}

export const addTokenToUser = async (email:string, token:string) => {
    try {
        await client.db(dbMW).collection(collUsers).updateOne({email}, {$set:{newtoken:token}})
        console.log("Token agregado a db correctamente", token)
        return true
    } catch(error) {
        console.log("Error al intentar agregar token a db...", error)
        return false
    }
}

export const registerUser = async (email:string, password:string, group:number) => {

    const passwordEncrypted = await bcrypt.hash(password, 12)

    const newUser = <typeUser> {
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
        await client.db(dbMW).collection(collUsers).insertOne(newUser)
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

export const searchTerritoryByNumber = async (terr:String) => {
    console.log("Buscando viviendas por territorio", terr);
    const viviendas = await client.db(dbMW).collection(collTerr)
        .find({territorio:terr}).toArray()
    return viviendas
}

export const searchBuildingByNumber = async (num:string) => {
    console.log("Buscando vivienda por inner_id", num);
    const vivienda = await client.db(dbMW).collection(collTerr)
        .find({inner_id:num}).toArray()
    return vivienda
}
