import * as functions from '../controllers/functions'


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

