import * as territoryServices from '../territory-services'
import * as userServices from '../user-services'
import { pubsub } from './resolvers'
import { checkAlert } from '../email-services/checkAlert'


type typeCambiar = {
    input: {
        token: string
        inner_id: string
        estado?: string
        noAbonado?: boolean
        asignado?: boolean
    }
}

type typeAsignar = {
    input: {
        token: string
        user_id: string
        asignar?: number
        desasignar?: number
        all?: boolean
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
        asignado?: boolean
    }
}


module.exports = {
    controlarUsuario: async (root:any, { input }:typeControlar) => {        
        console.log("Actualizando ", input.user_id)
        const user = await userServices.updateUserState(input)
        if (!user) return null
        pubsub.publish('cambiarUsuario', {escucharCambioDeUsuario: user})
        return user
    },
    asignar: async (root:any, { input }:typeAsignar) => {
        const user = await userServices.asignTerritory(input)
        if (!user) return null
        pubsub.publish('cambiarUsuario', {escucharCambioDeUsuario: user})
        return user
    },
    cambiarEstado: async (root:any, { input }:typeCambiar) => {
        input.asignado = !input.asignado ? false : input.asignado
        console.log("Changing household state:", input.inner_id, input.estado, input.noAbonado, input.asignado)
        const viviendaNuevoEstado = await territoryServices.updateHouseholdState(input)
        if (!viviendaNuevoEstado) return null
        pubsub.publish('cambiarEstado', {escucharCambioDeEstado: viviendaNuevoEstado})
        checkAlert()
        return viviendaNuevoEstado
    },
    agregarVivienda: async (root:any, { input }:typeAvivienda) => {
        let inner_id = "24878"
        let busqMayor = true
        while (busqMayor) {
            inner_id = (parseInt(inner_id) + 1).toString()
            busqMayor = await territoryServices.searchBuildingByNumber(inner_id)
        }
        console.log("Next inner_id:", inner_id);
        
        const estado = input.estado ? input.estado : "No predicado"
        const noAbonado = input.noAbonado ? input.noAbonado : false
        const fechaUlt = input.estado || input.noAbonado ? Date.now() : null

        

        // await dbClient.db(dbMW).collection(collTerr).insertOne({
        //     inner_id,
        //     territorio: input.territorio,
        //     manzana: input.manzana,
        //     direccion: input.direccion,
        //     telefono: input.telefono,
        //     estado,
        //     noAbonado,
        //     fechaUlt
        // })
        const viviendaNueva = await territoryServices.searchBuildingByNumber(inner_id)
        //console.log(viviendaNueva)
        
        return viviendaNueva

        // console.log(error, `${Date.now().toLocaleString()}`)
    }
}
