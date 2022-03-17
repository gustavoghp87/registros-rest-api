import { HouseholdDb } from '../services-db/householdDbConnection'
import { logger } from '../server'
import { changeStateOfTerritoryService, setResetDate } from './state-territory-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { checkAlert } from './email-services'
import * as types from '../models/household'
import { statistic, localStatistic } from '../models/statistic'
import { typeUser } from '../models/user'

export const resetTerritoryService = async (token: string, territory: string, option: number): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territory || !option) return false
    let success: boolean = await new HouseholdDb().ResetTerritory(territory, option)
    if (!success) {
        console.log("Something failed in reset territory", territory);
        return false
    }
    await changeStateOfTerritoryService(token, territory, false)
    const success1 = await setResetDate(territory, option)
    if (!success1)
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} no pudo setear fecha de reseteo de territorio ${territory} opción ${option}`, "stateOfTerritoryChange")
    return success
}

export const getLocalStatisticsService = async (token: string, territorio: string): Promise<localStatistic|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territorio) return null
    const localStatistics: localStatistic|null = await new HouseholdDb().GetLocalStatistics(territorio)
    if (!localStatistics) return null
    const count: number = localStatistics.count || 0
    const countContesto: number = localStatistics.countContesto || 0
    const countNoContesto: number = localStatistics.countNoContesto || 0
    const countDejarCarta: number = localStatistics.countDejarCarta || 0
    const countNoLlamar: number = localStatistics.countNoLlamar || 0
    const countNoAbonado: number = localStatistics.countNoAbonado || 0
    const libres: number = localStatistics.libres || 0
    //console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, libres, "------------ local statistics---------")
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
    const statistics: statistic|null = await new HouseholdDb().GetGlobalStatistics()
    if (!statistics) return null
    const count: number = statistics.count || 0
    const countContesto: number = statistics.countContesto || 0
    const countNoContesto: number = statistics.countNoContesto || 0
    const countDejarCarta: number = statistics.countDejarCarta || 0
    const countNoLlamar: number = statistics.countNoLlamar || 0
    const countNoAbonado: number = statistics.countNoAbonado || 0
    const libres: number = statistics.libres || 0
    //console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar, libres, "------------ global statistics---------");
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

export const getBlocksService = async (token: string, territory: string): Promise<string[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory) return null
    if (!isTerritoryAssignedToUser(user, territory)) return null
    const blocks: string[]|null = await new HouseholdDb().GetBlocks(territory)
    return blocks
}

export const getHouseholdsByTerritoryService = async (token: string, territory: string,
     manzana: string, todo: boolean, traidos: number, traerTodos: boolean): Promise<types.typeHousehold[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory || !manzana || typeof todo !== 'boolean' || !traidos || typeof traerTodos !== 'boolean') return null;
    if (!isTerritoryAssignedToUser(user, territory)) return null
    console.log("Searching households by terr number", territory, manzana, todo, traidos, traerTodos)
    const households: types.typeHousehold[]|null =
        await new HouseholdDb().GetTerritoryByNumber(territory, manzana, todo, traidos, traerTodos)
    return households
}

const isTerritoryAssignedToUser = (user: typeUser, territory: string): boolean => {
    if (user.asign?.find(assignedTerritory => assignedTerritory.toString() === territory)) return true
    return false
}

export const getAllHouseholdsService = async (): Promise<types.typeHousehold[]|null> => {
    // without permission filter / 
    const households: types.typeHousehold[]|null = await new HouseholdDb().GetAllHouseholds()
    return households
}

export const modifyHouseholdService = async (token: string,
     inner_id: string, estado: string, noAbonado: boolean, asignado: boolean): Promise<types.typeHousehold|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !inner_id || !estado || typeof noAbonado !== 'boolean' || typeof asignado !== 'boolean') return null
    if (!isHouseholdAssignedToUser) return null
    console.log("1");
    
    const success: boolean = await new HouseholdDb().UpdateHouseholdState(inner_id, estado, noAbonado, asignado)
    console.log("2");
    if (!success) return null
    const updatedHousehold: types.typeHousehold|null = await new HouseholdDb().GetHouseholdById(inner_id)
    console.log("3");
    if (!updatedHousehold) return null
    console.log("4");
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} modificó una vivienda: territorio ${updatedHousehold.territorio}, vivienda ${updatedHousehold.inner_id}, estado ${updatedHousehold.estado}, no abonado ${updatedHousehold.noAbonado}, asignado ${updatedHousehold.asignado}`,
    "territoryChange")
    console.log("5");
    checkAlert()
    return updatedHousehold
}

const isHouseholdAssignedToUser = async (user: typeUser, inner_id: string): Promise<boolean> => {
    const household: types.typeHousehold|null = await new HouseholdDb().GetHouseholdById(inner_id)
    if (!household || !household.territorio || !user || !user.asign || !user.asign.length) return false
    try {
        const territoryNumber: number = parseInt(household.territorio)
        const success: boolean = user.asign.includes(territoryNumber)
        return success
    } catch (error) {
        logger.Add(`Falló isTerritoryAssignedToUser(): ${error}`, "error")
        return false
    }
}

export const getTerritoryStreetsService = async (territory: string): Promise<string[]|null> => {
    // without permission filter / users
    const households: types.typeHousehold[]|null = await new HouseholdDb().GetTerritory(territory)
    const payload: string[] = []
    if (!households || !households.length) return null
    households.forEach((household: types.typeHousehold) => {
        if (!payload.includes(household.direccion)) payload.push(household.direccion)
    })
    if (!payload.length) return null

    for (let i = 0; i < payload.length; i++) {
        const streetArray: string[] = payload[i].split(' ')

        const number1: number = parseInt(streetArray[1])
        if (number1 > 0) payload[i] = streetArray[0]
        else {
            const number2: number = parseInt(streetArray[2])
            if (number2 > 0) payload[i] = streetArray[0] + " " + streetArray[1]
            else {
                const number3: number = parseInt(streetArray[3])
                if (number3 > 0) payload[i] = streetArray[0] + " " + streetArray[1] + " " + streetArray[2]
                else {
                    const number4: number = parseInt(streetArray[4])
                    if (number4 > 0) payload[i] = streetArray[0] + " " + streetArray[1] + " " + streetArray[2] + " " + streetArray[3]
                    else {
                        const number5: number = parseInt(streetArray[5])
                        if (number5 > 0) payload[i] = streetArray[0] + " " + streetArray[1] + " " + streetArray[2] + " " + streetArray[3] + " " + streetArray[4]
                        else {
                            const number6: number = parseInt(streetArray[6])
                            if (number6 > 0) payload[i] = streetArray[0] + " " + streetArray[1] + " " + streetArray[2] + " " + streetArray[3] + " " + streetArray[4] + " " + streetArray[5]
                            else {
                                console.log("Nothing")
                            }
                        }
                    }
                }
            }
        }
    }

    const streets: string[] = []
    payload.forEach((street: string) => {
        if (!streets.includes(street)) streets.push(street)
    })

    return streets
}
