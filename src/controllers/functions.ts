import { client, dbMW, collUsers, collTerr } from './database'
import Axios from 'axios'
import { typePack, typeUser } from './types'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'


export const searchUserByEmail = async (email:string) => {
    const user = await client.db(dbMW).collection(collUsers).findOne({email})
    return user
}

export const searchUserById = async (_id:string) => {
    console.log("buscando por id,", _id);
    const user = await client.db(dbMW).collection(collUsers).findOne({_id: new ObjectId(_id)})
    return user
}

export const searchUserByToken = async (newtoken:string) => {
    console.log("Buscando por token", newtoken)
    const user = await client.db(dbMW).collection(collUsers).findOne({newtoken})
    if (user) console.log("Usuario encontrado:", user.email)
    return user
}

export const searchAllUsers = async () => {
    console.log("Buscando a todos los usuarios")
    const users = (await client.db(dbMW).collection(collUsers).find().toArray()).reverse()
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

    const newUser:typeUser = {
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

export const changeMode = async (email:string, darkMode:boolean) => {
    try {
        await client.db(dbMW).collection(collUsers).updateOne({email}, {$set:{darkMode}})
        console.log("Modo oscuro cambiado de", !darkMode, "a", darkMode, "(" + email + ")")
        return true
    } catch(error) {
        console.log("Error al intentar cambiar modo oscuro...", error)
        return false
    }
}

export const changePsw = async (email:string, newPsw:string) => {
    try {
        const passwordEncrypted = await bcrypt.hash(newPsw, 12)
        const user = await searchUserByEmail(email)
        if (!user) {console.log("Problema de usuario en changePsw", email); return false}
        await client.db(dbMW).collection(collUsers).updateOne({email}, {$set: {password:passwordEncrypted}})
        return true
    } catch (error) {
        console.log("Error al intentar cambiar el password", error);
        return false
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////

export const countBlocks = async (terr:String) => {

    const buscar = ['1', '2', '3', '4', '5', '6', '7', '8']

    let manzanas = []
    let cantidad = 1
    while (cantidad < buscar.length) {
        let busq = await client.db(dbMW).collection(collTerr).findOne({
            territorio: {$in: [terr]},
            manzana: {$in: [cantidad.toString()]}
        })
        if (busq) manzanas.push(cantidad)
        cantidad++
    }
    console.log("Array de manzanas:", manzanas)
    //return manzanas[manzanas.length-1].toString()       // manzana mayor
    return manzanas
}

export const searchTerritoryByNumber = async (
    terr:string, manzana:string, todo:boolean, traidos:number, traerTodos:boolean
) => {
    console.log("Buscando viviendas por territorio", terr, "manzana", manzana)
    let viviendas:any
    
    if (!todo && !traerTodos) viviendas = await client.db(dbMW).collection(collTerr).find({
        $and: [
            {territorio: {$in: [terr]}},
            {manzana: {$in: [manzana]}},
            {estado: 'No predicado'},
            {$or: [{noAbonado: false}, {noAbonado: null}]}
        ]
    }).toArray()   // quito limit

    if (!todo && traerTodos) viviendas = await client.db(dbMW).collection(collTerr).find({
        $and: [
            {territorio: {$in: [terr]}},
            {manzana: {$in: [manzana]}},
            {estado: 'No predicado'},
            {$or: [{noAbonado: false}, {noAbonado: null}]}
        ]
    }).toArray()

    if (todo) {
        if (traerTodos)
            viviendas = await client.db(dbMW).collection(collTerr).find(
                {territorio: {$in: [terr]}, manzana: {$in: [manzana]}}
            ).sort({fechaUlt:1}).toArray()
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


///////////////////////////////////////////////////////////////////////////////////////////////////

export const resetTerritory = async (token:string, option:number, territorio:string) => {
    const user = await searchUserByToken(token)
    if (!user || user.role!==1) {console.log("No autenticado por token"); return false}
    console.log("Pasó auth ############")

    const time = Date.now()                              // todo en milisegundos
    const sixMonths = 15778458000
    const timeSixMonths = time - sixMonths

    if (option===1) {
        console.log("Entra en opción 1")                 // limpiar más de 6 meses
        await client.db(dbMW).collection(collTerr).updateMany({
            $and: [
                {territorio},
                {$or: [{noAbonado: false}, {noAbonado: null}]},
                {fechaUlt: {$lt: timeSixMonths}}
            ]
        }, {
            $set: {estado: "No predicado"}
        }, {
            multi:true
        })
        return true
    }
    
    if (option===2) {
        console.log("Entra en opción 2")                 // limpiar todos
        await client.db(dbMW).collection(collTerr).updateMany({
            $and: [
                {territorio},
                {$or: [{noAbonado: false}, {noAbonado: null}]}
            ]
        }, {
            $set: {estado: "No predicado"}
        }, {
            multi:true
        })
        return true
    }
    
    if (option===3) {
        console.log("Entra en opción 3")                 // limpiar y no abonados de más de 6 meses
        await client.db(dbMW).collection(collTerr).updateMany({
            $and: [
                {territorio},
                {fechaUlt: {$lt: timeSixMonths}}
            ]
        }, {
            $set: {estado: "No predicado", noAbonado:false}
        }, {
            multi:true
        })
        return true
    }
    
    if (option===4) {
        console.log("Entra en opción 4")                 // limpiar absolutamente todo
        await client.db(dbMW).collection(collTerr).updateMany({
            $and: [
                {territorio}
            ]
        }, {
            $set: {estado: "No predicado", noAbonado:false}
        }, {
            multi:true
        })
        return true
    }
    return false

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCampaign = async (token:string) => {
    const user = await searchUserByToken(token)
    if (!user) {console.log("No autenticado por token"); return false}
    console.log("Pasó auth ############ mandando campanya 2021")
    try {
        const pack = await client.db(dbMW).collection('campanya').find().toArray()
        return pack
    } catch (error) {console.error(error)}
}


export const asignCampaign = async (token:string, id:number, email:string) => {
    const user = await searchUserByToken(token)
    if (!user || user.role!==1) {console.log("No autenticado por token"); return false}
    console.log("Pasó auth ############ asignando usuario a campanya 2021")
    try {
        if (email==='Nadie') await client.db(dbMW).collection('campanya').updateOne({id}, {$set: {asignado:'No asignado'}})
        else await client.db(dbMW).collection('campanya').updateOne({id}, {$set: {asignado:email}})
        return true
    } catch (error) {console.error(error); return false}
}


export const getPack = async (id:number) => {
    const pack = await client.db(dbMW).collection('campanya').findOne({id})
    return pack
}


export const clickBox = async (token:string, tel:number, id:number, checked:boolean) => {
    try {
        const user = await searchUserByToken(token)
        if (!user) {console.log("No autenticado por token"); return false}
        
        const pack:typePack = await client.db(dbMW).collection('campanya').findOne({id})
        if (pack.asignado!==user.email) return false

        console.log("Pasó auth ############ cambiando estado de tel de campanya 2021")

        if (checked) {
            await client.db(dbMW).collection('campanya').updateOne({id}, {$pull: {llamados:tel}})
            await client.db(dbMW).collection('campanya').updateOne({id}, {$set: {terminado:false}})
        } else {
            await client.db(dbMW).collection('campanya').updateOne({id}, {$addToSet: {llamados:tel}})
            const packN:typePack = await client.db(dbMW).collection('campanya').findOne({id})
            if (packN && packN.llamados && packN.llamados.length===50) {
                console.log("YA SON 50")
                await client.db(dbMW).collection('campanya').updateOne({id}, {$set: {terminado:true}})
            }
        }
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

