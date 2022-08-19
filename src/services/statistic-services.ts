import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { getAllHouseholdsService, isTerritoryAssignedToUser } from './territory-services'
import { HouseholdDb } from '../services-db/householdDbConnection'
import * as types from '../models'
import { statistic, localStatistic, typeUser } from '../models'

const householdDbConnection: HouseholdDb = new HouseholdDb()

export const getNumberOfFreePhonesService = async (token: string, territory: string): Promise<number|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory) return null
    if (user.role !== 1 && !isTerritoryAssignedToUser(user, territory)) return null
    const numberOfFreePhones: number|null = await householdDbConnection.GetNumbreOfFreePhonesOfTerritoryByNumber(territory)
    return numberOfFreePhones
}

export const getLocalStatisticsService = async (token: string, territorio: string): Promise<localStatistic|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territorio) return null
    const localStatistics: localStatistic|null = await householdDbConnection.GetLocalStatistics(territorio)
    if (!localStatistics) return null
    const count: number = localStatistics.count || 0
    const countContesto: number = localStatistics.countContesto || 0
    const countNoContesto: number = localStatistics.countNoContesto || 0
    const countDejarCarta: number = localStatistics.countDejarCarta || 0
    const countNoLlamar: number = localStatistics.countNoLlamar || 0
    const countNoAbonado: number = localStatistics.countNoAbonado || 0
    const libres: number = localStatistics.libres || 0
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

export const getAllLocalStatisticsService = async (token: string): Promise<localStatistic[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const households: types.typeHousehold[]|null = await getAllHouseholdsService()
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
        if (households[i].estado === types.contesto) actualObject.countContesto += 1
        else if (households[i].estado === types.noContesto) actualObject.countNoContesto += 1
        else if (households[i].estado === types.aDejarCarta) actualObject.countDejarCarta += 1
        else if (households[i].estado === types.noLlamar) actualObject.countNoLlamar += 1
        else if (households[i].noAbonado === true) actualObject.countNoAbonado += 1
        else if (households[i].estado === types.noPredicado && !households[i].noAbonado) actualObject.libres += 1
        else console.log("Error, ningún tipo //////////////////////////////////////////// *****************************");
    }
    return localStatisticsArray
}

export const getGlobalStatisticsService = async (token: string): Promise<statistic|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const statistics: statistic|null = await householdDbConnection.GetGlobalStatistics()
    if (!statistics) return null
    const count: number = statistics.count || 0
    const countContesto: number = statistics.countContesto || 0
    const countNoContesto: number = statistics.countNoContesto || 0
    const countDejarCarta: number = statistics.countDejarCarta || 0
    const countNoLlamar: number = statistics.countNoLlamar || 0
    const countNoAbonado: number = statistics.countNoAbonado || 0
    const libres: number = statistics.libres || 0
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
