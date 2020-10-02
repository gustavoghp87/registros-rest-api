import { client, dbMW, collUsers, collTerr } from '../controllers/database'
import * as functions from '../controllers/functions'
import { IVivienda } from '../types/types'

type typeArgs = {
    terr: string
    inner_id: string
}

module.exports = {

    getApartmentsByTerritory: async (root:any, args:typeArgs) => {
        const viviendas = await functions.searchBuildingsByTerritory(args.terr)
        return viviendas
    },
    getApartment: async (root:any, args:typeArgs) => {
        const vivienda =  await functions.searchBuildingByNumber(args.inner_id)
        return vivienda
    },
    getUsers: async () => {
        try {
            const users = await functions.searchAllUsers()
            return users
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error desactivando usuario`
        }
    }
    
}

