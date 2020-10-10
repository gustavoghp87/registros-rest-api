import { client, dbMW, collUsers, collTerr } from '../controllers/database'
import * as functions from '../controllers/functions'
import { authGraph, adminGraph } from '../controllers/auth'
import { ObjectId } from 'mongodb'
import { pubsub } from './resolvers'


type typeCambiar = {
    input: {
        token: string
        inner_id: string
        estado?: string
        noAbonado?: boolean
    }
}

type typeAsignar = typeControlar & {
    input: {
        terr: string
    }
}

type typeControlar = {
    input: {
        token: string
        user_id: string
        estado: boolean
        role: number
        group: number
    }
}

type typeAvivienda = {
    input: {
        token: string
        inner_id: string
        territorio: string
        manzana: string
        direccion: string
        telefono: string
        estado?: string
        noAbonado?: boolean
        fechaUlt?: string
    }
}


module.exports = {
    controlarUsuario: async (root:any, { input }:typeControlar) => {        
        console.log("aca1", input)
        const userAuth = await adminGraph(input.token)
        if (!userAuth) return null
        console.log("Actualizando ", input.user_id)
        await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
            {$set: {estado:input.estado, role:input.role, group:input.group}}
        )
        const user = await functions.searchUserById(input.user_id)
        return user
    },
    cambiarEstado: async (root:any, { input }:typeCambiar) => {
        try {
            const userAuth = await authGraph(input.token)
            if (!userAuth) return null
            console.log("Cambiando estado,", input.inner_id, input.estado, input.noAbonado)
            await client.db(dbMW).collection(collTerr).updateOne({inner_id: input.inner_id},
                {$set: {estado:input.estado, noAbonado:input.noAbonado, fechaUlt:Date.now()}}
            )
            const viviendaNuevoEstado = await functions.searchBuildingByNumber(input.inner_id)
            pubsub.publish('cambiarEstado', {escucharCambioDeEstado: viviendaNuevoEstado})
            return viviendaNuevoEstado
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`);
            return null
        }
    },
    asignar: async (root:any, { input }:typeAsignar) => {
        try {
            const userAuth = await adminGraph(input.token)
            if (!userAuth) return null
            console.log(`Asignando territorio ${input.terr} a ${input.user_id}`);
            await client.db(dbMW).collection(collUsers).updateOne({_id: new ObjectId(input.user_id)},
                {$addToSet: {asign: parseInt(input.terr)}
            })
            const user = await functions.searchUserById(input.user_id)
            return user
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`)
            return null
        }
    },
    desasignar: async (root:any, { input }:typeAsignar) => {
        try {
            const userAuth = await adminGraph(input.token)
            if (!userAuth) return null
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return null
        }
    },
    agregarVivienda: async (root:any, { input }:typeAvivienda) => {
        try {
            const userAuth = await adminGraph(input.token)
            if (!userAuth) return null
            let inner_id = "24878"
            let busqMayor = true
            while (busqMayor) {
                inner_id = (parseInt(inner_id) + 1).toString()
                busqMayor = await functions.searchBuildingByNumber(inner_id)
            }
            console.log("El inner_id que sige es ", inner_id);
            
            const estado = input.estado ? input.estado : "No predicado"
            const noAbonado = input.noAbonado ? input.noAbonado : false
            const fechaUlt = input.estado || input.noAbonado ? Date.now() : null

            await client.db(dbMW).collection(collTerr).insertOne({
                inner_id,
                territorio: input.territorio,
                manzana: input.manzana,
                direccion: input.direccion,
                telefono: input.telefono,
                estado,
                noAbonado,
                fechaUlt
            })
            const viviendaNueva = await functions.searchBuildingByNumber(inner_id)
            console.log(viviendaNueva)
            return viviendaNueva
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`)
            return null
        }
    }
}
