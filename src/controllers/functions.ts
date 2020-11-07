import { client, dbMW, collUsers, collTerr } from './database'
import Axios from 'axios'
import { typeUser, typeVivienda } from '../controllers/types'
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
    console.log("Buscando por token");
    const user = await client.db(dbMW).collection(collUsers).findOne({newtoken})
    return user
}

export const searchAllUsers = async () => {
    console.log("Buscando a todos los usuarios")
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
        estado: false,
        email,
        password: passwordEncrypted,
        group
    }

    try {
        await client.db(dbMW).collection(collUsers).insertOne(newUser)
        console.log("Creado nuevo usuario", newUser)
        return true
    } catch (e) {
        console.error(e)
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
    console.log("Recaptcha:", success)
    return success
}


////////////////////////////////////////////////////////////////////////////////////////////////

export const countBlocks = async (terr:String) => {

    const buscar = ['1', '2', '3', '4', '5', '6', '7', '8']

    let manzanas = []
    let cantidad = 1
    while ( cantidad < buscar.length) {
        let busq = await client.db(dbMW).collection(collTerr).findOne({
            territorio: {$in: [terr]},
            manzana: {$in: [cantidad.toString()]}
        })
        if (busq) manzanas.push(cantidad)
        cantidad++
    }
    console.log("Array de manzanas:", manzanas)
    return manzanas[manzanas.length-1].toString()

    // let cond = true
    // do {
    //     cantidad=cantidad+1
    //     console.log("Territorio", terr, "cantidad al entrar al ciclo", cantidad);
    //     let busq = await client.db(dbMW).collection(collTerr).findOne({
    //         territorio: {$in: [terr]},
    //         manzana: {$in: [cantidad.toString()]}
    //     })
    //     if (!busq) {cantidad = cantidad-1; cond = false}
    // } while (cond===true) 
    // console.log("Cantidad de salida", cantidad)
    // return cantidad
}

export const searchTerritoryByNumber = async (
    terr:string, manzana:string, todo:boolean, traidos:number, traerTodos:boolean
) => {
    console.log("Buscando viviendas por territorio", terr, "manzana", manzana)
    let viviendas:any
    
    if (!todo) viviendas = await client.db(dbMW).collection(collTerr).find({
        $and: [
            {territorio: {$in: [terr]}},
            {manzana: {$in: [manzana]}},
            {estado: 'No predicado'},
            {$or: [{noAbonado: false}, {noAbonado: null}]}
        ]
    }).limit(traidos).toArray()

    else {
        if (traerTodos)
            viviendas = await client.db(dbMW).collection(collTerr).find(
                {territorio: {$in: [terr]}, manzana: {$in: [manzana]}}
            ).sort({fechaUlt:-1}).toArray()
        else viviendas = await client.db(dbMW).collection(collTerr).find(
            {territorio: {$in: [terr]}, manzana: {$in: [manzana]}}
        ).limit(traidos).toArray()
    }
    
    return viviendas
}

export const searchBuildingByNumber = async (num:string) => {
    console.log("Buscando vivienda por inner_id", num)
    const vivienda = await client.db(dbMW).collection(collTerr).findOne({inner_id:num})
    console.log(vivienda)
    return vivienda
}
