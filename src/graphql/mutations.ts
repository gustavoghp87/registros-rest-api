import { client, dbMW, collUsers, collTerr } from '../controllers/database'
import * as functions from '../controllers/functions'
import { ObjectId } from 'mongodb'


type typeCambiar = {
    input: {
        inner_id: string
        estado?: string
        noAbonado?: boolean
    }
}

type typeAsign = typeActivar & {
    input: {
        terr: string
    }
}

type typeActivar = {
    input: {
        user_id: string
    }
}

type typeAvivienda = {
    input: {
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
    cambiarEstado: async (root:any, { input }:typeCambiar) => {
        try {
            console.log("Cambiando estado,", input.inner_id, input.estado)
            await client.db(dbMW).collection(collTerr).updateOne({inner_id: input.inner_id},
                {$set: {estado: input.estado, fechaUlt: Date.now()}}
            )
            const viviendaNuevoEstado = await functions.searchBuildingByNumber(input.inner_id)
            return viviendaNuevoEstado
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`);
            return `Error cambiando estado`
        }
    },
    cambiarNoAbonado: async (root:any, { input }:typeCambiar) => {
        try {
            console.log("Cambiando estado,", input.inner_id, input.noAbonado)
            await client.db(dbMW).collection(collTerr).updateOne({inner_id: input.inner_id},
                {$set: {noAbonado: input.noAbonado, fechaUlt: Date.now()}}
            )
            const viviendaNoAbon = await functions.searchBuildingByNumber(input.inner_id)
            return viviendaNoAbon
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error cambiando estado`
        }
    },
    asignar: async (root:any, { input }:typeAsign) => {
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error asignando territorio`
        }
    },
    desasignar: async (root:any, { input }:typeAsign) => {
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error desasignando territorio`
        }
    },
    activar: async (root:any, { input }:typeActivar) => {
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error activando usuario`
        }
    },
    desactivar: async (root:any, { input }:typeActivar) => {
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error desactivando usuario`
        }
    },
    hacerAdmin: async (root:any, { input }:typeActivar) => {
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error activando usuario`
        }
    },
    deshacerAdmin: async (root:any, { input }:typeActivar) => {
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
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error desactivando usuario`
        }
    },
    agregarVivienda: async (root:any, { input }:typeAvivienda) => {
        try {
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
            return `Error agregando vivienda`
        }
    }
}

