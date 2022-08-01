import { logger } from '../server'
import { changeStateOfTerritoryService, getStateOfTerritoryService, setResetDate } from './state-of-territory-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { sendAlertOfTerritoriesEmailService } from './email-services'
import { generalError, stateOfTerritoryChange, territoryChange } from './log-services'
import { HouseholdDb } from '../services-db/householdDbConnection'
import * as types from '../models/household'
import { typeStateOfTerritory, typeUser } from '../models'

const householdDbConnection: HouseholdDb = new HouseholdDb()

export const isTerritoryAssignedToUser = (user: typeUser, territory: string): boolean => {
    if (user.asign?.some(assignedTerritory => assignedTerritory.toString() === territory)) return true
    return false
}

export const resetTerritoryService = async (token: string, territory: string, option: number): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territory || !option) return false
    let success: boolean = await householdDbConnection.ResetTerritory(territory, option)
    if (success) {
        logger.Add(`Admin ${user.email} reseteó territorio ${territory} con la opción ${option}`, stateOfTerritoryChange)
    } else {
        console.log("Something failed in reset territory", territory);
        logger.Add(`Admin ${user.email} no pudo resetear territorio ${territory} opción ${option}`, stateOfTerritoryChange)
        return false
    }
    await changeStateOfTerritoryService(token, territory, false)
    const success1 = await setResetDate(territory, option)
    if (!success1)
        logger.Add(`Admin ${user.email} no pudo setear fecha de reseteo de territorio ${territory} opción ${option}`, stateOfTerritoryChange)
    return success
}

// export const getBlocksService = async (token: string, territory: string): Promise<string[]|null> => {
//     const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
//     if (!user || !territory) return null
//     if (!isTerritoryAssignedToUser(user, territory)) return null
//     const blocks: string[]|null = await householdDbConnection.GetBlocks(territory)
//     return blocks
// }

export const getHouseholdsByTerritoryService = async (token: string,
    territory: types.typeTerritoryNumber): Promise<[types.typeHousehold[], typeStateOfTerritory]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory) return null
    if (user.role !== 1 && !isTerritoryAssignedToUser(user, territory)) return null
    const households: types.typeHousehold[]|null = await householdDbConnection.GetTerritory(territory)
    const stateOfTerritory: typeStateOfTerritory|null = await getStateOfTerritoryService(token, territory)  // token <==
    if (!households || !stateOfTerritory) return null
    return [households, stateOfTerritory]
}

export const getAllHouseholdsService = async (): Promise<types.typeHousehold[]|null> => {
    // without permission filter / 
    const households: types.typeHousehold[]|null = await householdDbConnection.GetAllHouseholds()
    return households
}

export const modifyHouseholdService = async (token: string,
     inner_id: string, estado: string, noAbonado: boolean, asignado: boolean): Promise<types.typeHousehold|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    noAbonado = !noAbonado ? false : true
    asignado = !asignado ? false : true
    if (!user || !inner_id || !estado) return null
    if (!isHouseholdAssignedToUser) return null
    const success: boolean = await householdDbConnection.UpdateHouseholdState(inner_id, estado, noAbonado, asignado)
    if (!success) return null
    const updatedHousehold: types.typeHousehold|null = await householdDbConnection.GetHouseholdById(inner_id)
    if (!updatedHousehold) return null
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} modificó una vivienda: territorio ${updatedHousehold.territorio}, vivienda ${updatedHousehold.inner_id}, estado ${updatedHousehold.estado}, no abonado ${updatedHousehold.noAbonado}, asignado ${updatedHousehold.asignado}`, territoryChange)
    sendAlertOfTerritoriesEmailService()
    return updatedHousehold
}

const isHouseholdAssignedToUser = async (user: typeUser, inner_id: string): Promise<boolean> => {
    const household: types.typeHousehold|null = await householdDbConnection.GetHouseholdById(inner_id)
    if (!household || !household.territorio || !user || !user.asign || !user.asign.length) return false
    try {
        const territoryNumber: number = parseInt(household.territorio)
        const success: boolean = user.asign.includes(territoryNumber)
        return success
    } catch (error) {
        logger.Add(`Falló isHouseholdAssignedToUser(): ${error}`, generalError)
        return false
    }
}

export const getTerritoryStreetsService = async (territory: types.typeTerritoryNumber): Promise<string[]|null> => {
    // without permission filter / used by hth services
    const households: types.typeHousehold[]|null = await householdDbConnection.GetTerritory(territory)
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
