import { client, dbMW, collUsers, collTerr } from '../controllers/database'
import * as functions from '../controllers/functions'
import { ObjectId } from 'mongodb'


interface ICambiar {
    input: {
        inner_id: string
        estado?: string
        noAbonado?: boolean
    }
}

interface IAsign {
    input: {
        user_id: string
        terr: string
    }
}

interface IActivar {
    input: {
        user_id: string
    }
}


module.exports = {
    cambiarEstado: async (root:any, { input }:ICambiar) => {
        try {
            console.log("Cambiando estado,", input.inner_id, input.estado)
            await client.db(dbMW).collection(collTerr).updateOne({inner_id: input.inner_id},
                {$set: {estado: input.estado, fechaUlt: Date.now()}}
            )
            const viviendaNuevoEstado = await functions.searchBuildingByNumber(input.inner_id)
            return viviendaNuevoEstado
        } catch (error) {
            console.log(error);
            return `Error cambiando estado, ${Date.now().toLocaleString()}`
        }
    },
    cambiarNoAbonado: async (root:any, { input }:ICambiar) => {
        try {
            console.log("Cambiando estado,", input.inner_id, input.noAbonado)
            await client.db(dbMW).collection(collTerr).updateOne({inner_id: input.inner_id},
                {$set: {noAbonado: input.noAbonado, fechaUlt: Date.now()}}
            )
            const viviendaNoAbon = await functions.searchBuildingByNumber(input.inner_id)
            return viviendaNoAbon
        } catch (error) {
            console.log(error)
            return `Error cambiando estado, ${Date.now().toLocaleString()}`
        }
    },
    asignar: async (root:any, { input }:IAsign) => {
        try {
            console.log(`Asignando territorio ${input.terr} a ${input.user_id}`);
            console.log(typeof input.user_id)
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$addToSet: {asign: parseInt(input.terr)}
            })
            const busq = await functions.searchUserById(input.user_id)
            const user = {
                email: busq.email,
                asign: busq.asign
            }
            return user
        } catch (error) {
            console.log(error)
            return `Error asignando territorio, ${Date.now().toLocaleString()}`
        }
    },
    desasignar: async (root:any, { input }:IAsign) => {
        try {
            console.log(`Desasignando territorio ${input.terr} a ${input.user_id}`);
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$pull: {asign: { $in: [parseInt(input.terr)] } } }, {multi:true}
            )
            const busq = await functions.searchUserById(input.user_id)
            const user = {
                email: busq.email,
                asign: busq.asign
            }
            return user
        } catch (error) {
            console.log(error)
            return `Error desasignando territorio, ${Date.now().toLocaleString()}`
        }
    },
    activar: async (root:any, { input }:IActivar) => {
        try {
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$set: {estado: "activado"}}
            )
            const busq = await functions.searchUserById(input.user_id)
            const user = {
                _id: busq._id,
                email: busq.email,
                estado: busq.estado
            }
            return user
        } catch (error) {
            console.log(error)
            return `Error activando usuario, ${Date.now().toLocaleString()}`
        }
    },
    desactivar: async (root:any, { input }:IActivar) => {
        try {
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$set: {estado: "desactivado"}}
            )
            const busq = await functions.searchUserById(input.user_id)
            const user = {
                _id: busq._id,
                email: busq.email,
                estado: busq.estado
            }
            return user
        } catch (error) {
            console.log(error)
            return `Error desactivando usuario, ${Date.now().toLocaleString()}`
        }
    },
    hacerAdmin: async (root:any, { input }:IActivar) => {
        try {
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$set: {role: 1}}
            )
            const busq = await functions.searchUserById(input.user_id)
            const user = {
                _id: busq._id,
                email: busq.email,
                role: busq.role
            }
            return user
        } catch (error) {
            console.log(error)
            return `Error activando usuario, ${Date.now().toLocaleString()}`
        }
    },
    deshacerAdmin: async (root:any, { input }:IActivar) => {
        try {
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$set: {role: 0}}
            )
            const busq = await functions.searchUserById(input.user_id)
            const user = {
                _id: busq._id,
                email: busq.email,
                role: busq.role
            }
            return user
        } catch (error) {
            console.log(error)
            return `Error desactivando usuario, ${Date.now().toLocaleString()}`
        }
    }
}

