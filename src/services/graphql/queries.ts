import * as userServices from '../user-services'
import * as territoryServices from '../territory-services'


type typeArgs0 = {
    terr: string
}

type typeArgs1 = {
    token: string
    terr: string
    manzana: string
    todo: boolean
    traidos: number
    traerTodos: boolean
}

type typeArgs2 = {
    token: string
    inner_id: string
}

type typeArgs3 = {
    token: string
}

type typeGlobalStatistics = {
    token: string
}

type typeLocalStatistics = {
    token: string
    territorio: string
}


module.exports = {
    countBlocks: async (root:any, args:typeArgs0) => {
        console.log("Searching blocks array")        
        try {
            const cantidad = await territoryServices.getBlocks(args.terr)      
            return {cantidad}
        } catch(error) {
            console.log(error)
            return null
        }
    },
    getApartmentsByTerritory: async (root:any, args:typeArgs1) => {
        const user = await userServices.userAuthForGraphQL(args.token)
        if (!user) return null
        console.log("Searching households by terr number", args.terr, args.manzana, args.todo, args.traidos, args.traerTodos)
        const viviendas = await territoryServices.searchTerritoryByNumber(
            args.terr, args.manzana, args.todo, args.traidos, args.traerTodos
        )
        return viviendas
    },
    getApartment: async (root:any, args:typeArgs2) => {
        const user = await userServices.userAuthForGraphQL(args.token)
        if (!user) return null
        const vivienda =  await territoryServices.searchBuildingByNumber(args.inner_id)
        return vivienda
    },
    getUsers: async (root:any, args:typeArgs3) => {
        try {
            console.log("Searching users")
            const user = await userServices.userAdminForGraphQL(args.token)
            if (!user) return null
            const users = await userServices.searchAllUsers()
            return users
        } catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`)
            return `Error searching users`
        }
    },
    getGlobalStatistics: async (root:any, args:typeGlobalStatistics) => {
        const userAuth = await userServices.userAdminForGraphQL(args.token)
        if (!userAuth) return null
        const statistics = await territoryServices.getGlobalStatistics(args.token)
        const count = statistics?.count
        const countContesto = statistics?.countContesto
        const countNoContesto = statistics?.countNoContesto
        const countDejarCarta = statistics?.countDejarCarta
        const countNoLlamar = statistics?.countNoLlamar
        const countNoAbonado = statistics?.countNoAbonado
        const libres = statistics?.libres
        console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, libres, "------------ global statistics---------");
        return {
            count,
            countContesto,
            countNoContesto,
            countDejarCarta,
            countNoLlamar,
            countNoAbonado,
            libres
        }
    },
    getLocalStatistics: async (root:any, args:typeLocalStatistics) => {
        const localStatistics = await territoryServices.getLocalStatistics(args.token, args.territorio)
        if (!localStatistics) return null
        const count = localStatistics?.count
        const countContesto = localStatistics?.countContesto
        const countNoContesto = localStatistics?.countNoContesto
        const countDejarCarta = localStatistics?.countDejarCarta
        const countNoLlamar = localStatistics?.countNoLlamar
        const countNoAbonado = localStatistics?.countNoAbonado
        const libres = localStatistics?.libres
        console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, libres, "------------ local statistics---------")
        return {
            territorio: args.territorio,
            count,
            countContesto,
            countNoContesto,
            countDejarCarta,
            countNoLlamar,
            countNoAbonado,
            libres
        }
    }
}

