import { statistic, localStatistic } from '../models/statistic'
import { HouseholdDb } from '../services-db/householdDbConnection'
import { changeStateOfTerritory, setResetDate } from './state-territory-services'
import { getActivatedUserByAccessToken, verifyActivatedAdminByAccessToken, verifyActivatedUserByAccessToken } from './user-services'
import { checkAlert } from './email-services'
import { maintenanceMode } from '../server'
import { typeVivienda } from '../models/vivienda'
import { typeUser } from '../models/user'

export const resetTerritory = async (token: string, territory: string, option: number): Promise<boolean> => {
    if (!await verifyActivatedAdminByAccessToken(token)) return false
    let response: boolean = await new HouseholdDb().ResetTerritory(territory, option)
    if (!response) { console.log("Something failed in reset territory", territory); return false }
    response = await changeStateOfTerritory(token, territory, false)
    const response1 = await setResetDate(territory, option);
    console.log("Set reset date:", response1);
    return response
}

export const getLocalStatistics = async (token: string, territorio: string, all: boolean): Promise<localStatistic|null> => {
    if (!all && !await verifyActivatedAdminByAccessToken(token)) return null
    const localStatistics: localStatistic|null = await new HouseholdDb().GetLocalStatistics(territorio)
    if (!localStatistics) return null
    const count: number = localStatistics.count || 0
    const countContesto: number = localStatistics.countContesto || 0
    const countNoContesto: number = localStatistics.countNoContesto || 0
    const countDejarCarta: number = localStatistics.countDejarCarta || 0
    const countNoLlamar: number = localStatistics.countNoLlamar || 0
    const countNoAbonado: number = localStatistics.countNoAbonado || 0
    const libres: number = localStatistics.libres || 0
    console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, libres, "------------ local statistics---------")
    return {
        territorio,
        count,
        countContesto,
        countNoContesto,
        countDejarCarta,
        countNoLlamar,
        countNoAbonado,
        libres
    }
}

// export const getAllLocalStatistics = async (token: string): Promise<any[]|null|undefined> => {
//     if (!await verifyActivatedAdminByAccessToken(token)) return null
//     let promisesArray = []
//     let i = 1
//     while (i < 57) {
//         promisesArray.push(Promise.resolve(getLocalStatistics(token, i.toString(), true)))
//         i++
//     }
//     let localStatisticsArray = await Promise.all(promisesArray)
//     return localStatisticsArray
// }

export const getAllLocalStatistics = async (token: string): Promise<localStatistic[]|null> => {
    if (!await verifyActivatedAdminByAccessToken(token)) return null

    const dbConnection = new HouseholdDb()

    const households: typeVivienda[]|null = await dbConnection.GetAllHouseholds()
    if (!households) return null

    let localStatisticsArray: localStatistic[] = []

    let h = 0
    while (h < 56) {
        h++
        let localStatistic: localStatistic = {
            count: 0,
            countContesto: 0,
            countDejarCarta: 0,
            countNoAbonado: 0,
            countNoContesto: 0,
            countNoLlamar: 0,
            libres: 0,
            territorio: h.toString()
        }
        localStatisticsArray.push(localStatistic)
    }
    
    for (let i = 0; i < households.length; i++) {
        const actualObject = localStatisticsArray[parseInt(households[i].territorio)-1]
        actualObject.count += 1
        if (households[i].estado === dbConnection.Contesto) actualObject.countContesto += 1
        else if (households[i].estado === dbConnection.NoContesto) actualObject.countNoContesto += 1
        else if (households[i].estado === dbConnection.ADejarCarta) actualObject.countDejarCarta += 1
        else if (households[i].estado === dbConnection.NoLlamar) actualObject.countNoLlamar += 1
        else if (households[i].noAbonado === true) actualObject.countNoAbonado += 1
        else if (households[i].estado === dbConnection.NoPredicado && !households[i].noAbonado) actualObject.libres += 1
        else console.log("Error, ningún tipo //////////////////////////////////////////// *****************************");
    }

    return localStatisticsArray
}

export const getGlobalStatistics = async (token: string): Promise<statistic|null> => {
    if (!await verifyActivatedAdminByAccessToken(token)) return null
    const statistics: statistic|null = await new HouseholdDb().GetGlobalStatistics()
    if (!statistics) return null
    const count: number = statistics.count || 0
    const countContesto: number = statistics.countContesto || 0
    const countNoContesto: number = statistics.countNoContesto || 0
    const countDejarCarta: number = statistics.countDejarCarta || 0
    const countNoLlamar: number = statistics.countNoLlamar || 0
    const countNoAbonado: number = statistics.countNoAbonado || 0
    const libres: number = statistics.libres || 0
    console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, libres, "------------ global statistics---------");
    const response: statistic = {
        count,
        countContesto,
        countNoContesto,
        countDejarCarta,
        countNoLlamar,
        countNoAbonado,
        libres
    }
    return response
}

export const getBlocks = async (token: string, territory: string): Promise<string[]|null> => {
    if (!verifyActivatedUserByAccessToken(token)) return null
    const blocks: string[]|null = await new HouseholdDb().GetBlocks(territory)
    return blocks
}

export const getHouseholdsByTerritory = async (token: string, territory: string,
     manzana: string, todo: boolean, traidos: number, traerTodos: boolean): Promise<typeVivienda[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessToken(token)
    if (!user) return null;
    if (!checkTerritoryAssigned(user, territory)) return null
    console.log("Searching households by terr number", territory, manzana, todo, traidos, traerTodos)
    const households: typeVivienda[]|null =
        await new HouseholdDb().GetTerritoryByNumber(territory, manzana, todo, traidos, traerTodos)
    return households
}

const checkTerritoryAssigned = (user: typeUser, territory: string): boolean => {
    if (user.asign?.find(assignedTerritory => assignedTerritory.toString() === territory)) return true
    return false
}

export const modifyHousehold = async (token: string,
     inner_id: string, estado: string, noAbonado: boolean, asignado: boolean): Promise<typeVivienda|null> => {
    if (!await verifyActivatedUserByAccessToken(token)) return null
    console.log("Modifying household:", inner_id, estado, noAbonado, asignado)
    const household: typeVivienda|null = await new HouseholdDb().UpdateHouseholdState(inner_id, estado, noAbonado, asignado)
    if (!household) return null
    if (!maintenanceMode) checkAlert()
    return household
}
