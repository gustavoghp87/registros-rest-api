import * as functions from '../controllers/functions'
import { authGraph, adminGraph } from '../controllers/auth'

type typeArgs0 = {
    terr: string
}

type typeArgs1 = {
    token: string
    terr: string
    manzana: string
}

type typeArgs2 = {
    token: string
    inner_id: string
}

type typeArgs3 = {
    token: string
}


module.exports = {

    countBlocks: async (root:any, args:typeArgs0) => {
        console.log("Buscando cantidad de manzanas")        
        try {
            const cantidad = (await functions.countBlocks(args.terr)).toString()
            return {cantidad} 
        } catch(error) {
            console.log(error)
            return null
        }
    },
    getApartmentsByTerritory: async (root:any, args:typeArgs1) => {
        const user = await authGraph(args.token)
        if (!user) return null
        const viviendas = await functions.searchTerritoryByNumber(args.terr, args.manzana)
        return viviendas
    },
    getApartment: async (root:any, args:typeArgs2) => {
        const user = await authGraph(args.token)
        if (!user) return null
        const vivienda =  await functions.searchBuildingByNumber(args.inner_id)
        return vivienda
    },
    getUsers: async (root:any, args:typeArgs3) => {
        try {
            console.log("Buscando todos los usuarios")
            const user = await adminGraph(args.token)
            if (!user) return null
            const users = await functions.searchAllUsers()
            return users
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error desactivando usuario`
        }
    }
    
}

