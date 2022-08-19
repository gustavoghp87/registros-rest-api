import { logger } from '../server'
import { deallocateMyTLPTerritoryService, getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { errorLogs, telephonicLogs, telephonicStateLogs } from './log-services'
import { TelephonicDb } from '../services-db/telephonicDbConnection'
import { typeCallingState, typeHousehold, typeLocalTelephonicStatistic, typeTelephonicStatistic, typeTelephonicTerritory, typeTerritoryNumber, typeUser } from '../models'

const telephonicDbConnection: TelephonicDb = new TelephonicDb()

const isTelephonicTerritoryAssignedToUser = async (user: typeUser, territoryNumber: typeTerritoryNumber, householdId: number): Promise<boolean> => {
    const household: typeHousehold|null = await telephonicDbConnection.GetHouseholdById(territoryNumber, householdId)
    if (!household || !territoryNumber || !user || !user.phoneAssignments.length) return false
    try {
        const success: boolean = user.phoneAssignments.includes(parseInt(territoryNumber))
        return success
    } catch (error) {
        logger.Add(`Falló isHouseholdAssignedToUser(): ${error}`, errorLogs)
        return false
    }
}

export const changeStateOfTerritoryService = async (token: string, territoryNumber: typeTerritoryNumber, isFinished: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territoryNumber) return false
    if (user.role !== 1 && !isTerritoryAssignedToUserService(user, territoryNumber)) return false
    isFinished = !!isFinished
    const success: boolean = await telephonicDbConnection.ChangeStateOfTerritory(territoryNumber, isFinished)
    if (!success) {
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} no pudo cambiar territorio ${territoryNumber} a ${isFinished ? 'terminado' : 'abierto'}`, errorLogs)
        return false
    }
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambia territorio ${territoryNumber} a ${isFinished ? 'terminado' : 'abierto'}`, telephonicStateLogs)
    if (isFinished) await deallocateMyTLPTerritoryService(token, territoryNumber)
    return true
}

export const isTerritoryAssignedToUserService = (user: typeUser, territory: string): boolean => {
    if (user.phoneAssignments?.some(assignedTerritory => assignedTerritory.toString() === territory)) return true
    return false
}

export const resetTerritoryService = async (token: string, territoryNumber: typeTerritoryNumber, option: number): Promise<number|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territoryNumber || !option) return null
    let modifiedCount: number|null = await telephonicDbConnection.ResetTerritory(territoryNumber, option)
    if (modifiedCount === null) {
        logger.Add(`Admin ${user.email} no pudo resetear territorio ${territoryNumber} opción ${option}`, telephonicStateLogs)
        return null
    }
    logger.Add(`Admin ${user.email} reseteó territorio ${territoryNumber} con la opción ${option}: ${modifiedCount} viviendas reseteadas`, telephonicStateLogs)
    if (modifiedCount) {
        await setResetDate(territoryNumber, option, user.email)
        await changeStateOfTerritoryService(token, territoryNumber, false)
    }
    return modifiedCount
}

export const getAllTelephonicTerritoriesService = async (): Promise<typeTelephonicTerritory[]|null> => {
    // without permission filter / 
    const phoneTerritories: typeTelephonicTerritory[]|null = await telephonicDbConnection.GetAllTelephonicTerritories()
    return phoneTerritories
}

export const getTelephonicGlobalStatisticsService = async (token: string): Promise<typeTelephonicStatistic|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const telephonicGlobalStatistics: typeTelephonicStatistic = {
        numberOf_ADejarCarta: 0,
        numberOf_Contesto: 0,
        numberOf_NoAbonado: 0,
        numberOf_NoContesto: 0,
        numberOf_NoLlamar: 0,
        numberOf_FreePhones: 0,
        numberOfHouseholds: 0
    }
    const telephonicTerritories: typeTelephonicTerritory[]|null = await telephonicDbConnection.GetAllTelephonicTerritories()
    if (!telephonicTerritories) return null
    telephonicTerritories.forEach(x => {
        x.households.forEach(y => {
            telephonicGlobalStatistics.numberOfHouseholds++
            if (y.callingState === 'No predicado' && !y.notSubscribed) telephonicGlobalStatistics.numberOf_FreePhones++
            else if (y.callingState === 'A dejar carta' && !y.notSubscribed) telephonicGlobalStatistics.numberOf_ADejarCarta++
            else if (y.callingState === 'Contestó' && !y.notSubscribed) telephonicGlobalStatistics.numberOf_Contesto++
            else if (y.callingState === 'No contestó' && !y.notSubscribed) telephonicGlobalStatistics.numberOf_NoContesto++
            else if (y.callingState === 'No llamar' && !y.notSubscribed) telephonicGlobalStatistics.numberOf_NoLlamar++
            if (y.notSubscribed) telephonicGlobalStatistics.numberOf_NoAbonado++
        })
    })
    return telephonicGlobalStatistics
}

export const getTelephonicLocalStatisticsService = async (token: string): Promise<typeLocalTelephonicStatistic[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const telephonicTerritories: typeTelephonicTerritory[]|null = await telephonicDbConnection.GetAllTelephonicTerritories()
    if (!telephonicTerritories) return null
    const telephonicLocalStatistics: typeLocalTelephonicStatistic[] = []
    for (let i = 0; i < telephonicTerritories.length; i++) {
        const localStatistics: typeLocalTelephonicStatistic = {
            isFinished: telephonicTerritories[i].stateOfTerritory.isFinished,
            numberOf_ADejarCarta: 0,
            numberOf_Contesto: 0,
            numberOf_NoAbonado: 0,
            numberOf_NoContesto: 0,
            numberOf_NoLlamar: 0,
            numberOf_FreePhones: 0,
            numberOfHouseholds: 0,
            territoryNumber: (i + 1).toString() as typeTerritoryNumber
        }
        telephonicTerritories[i].households.forEach(x => {
            localStatistics.numberOfHouseholds++
            if (x.callingState === 'No predicado' && !x.notSubscribed) localStatistics.numberOf_FreePhones++
            else if (x.callingState === 'A dejar carta' && !x.notSubscribed) localStatistics.numberOf_ADejarCarta++
            else if (x.callingState === 'Contestó' && !x.notSubscribed) localStatistics.numberOf_Contesto++
            else if (x.callingState === 'No contestó' && !x.notSubscribed) localStatistics.numberOf_NoContesto++
            else if (x.callingState === 'No llamar' && !x.notSubscribed) localStatistics.numberOf_NoLlamar++
            if (x.notSubscribed) localStatistics.numberOf_NoAbonado++
        })
        telephonicLocalStatistics.push(localStatistics)
    }
    return telephonicLocalStatistics
}

export const getTelephonicTerritoryService = async (token: string, territory: typeTerritoryNumber): Promise<typeTelephonicTerritory|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory) return null
    if (user.role !== 1 && !isTerritoryAssignedToUserService(user, territory)) return null
    const telephonicTerritory: typeTelephonicTerritory|null = await telephonicDbConnection.GetTerritory(territory)
    return telephonicTerritory
}

export const getTerritoryStreetsService = async (territoryNumber: typeTerritoryNumber): Promise<string[]|null> => {
    // without permission filter / used by hth services
    const telephonicTerritory: typeTelephonicTerritory|null = await telephonicDbConnection.GetTerritory(territoryNumber)
    if (!telephonicTerritory) return null
    const households: typeHousehold[]|null = telephonicTerritory.households
    const payload: string[] = []
    if (!households || !households.length) return null
    households.forEach((household: typeHousehold) => {
        if (!payload.includes(household.address)) payload.push(household.address)
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

export const modifyHouseholdService = async (token: string, territoryNumber: typeTerritoryNumber,
 householdId: number, callingState: typeCallingState, notSubscribed: boolean, asignado: boolean): Promise<typeHousehold|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    notSubscribed = !!notSubscribed
    asignado = !!asignado
    if (!user || !householdId || !callingState) return null
    if (!await isTelephonicTerritoryAssignedToUser(user, territoryNumber, householdId)) return null
    const success: boolean = await telephonicDbConnection.UpdateHouseholdState(territoryNumber, householdId, callingState, notSubscribed, asignado)
    if (!success) return null
    const updatedHousehold: typeHousehold|null = await telephonicDbConnection.GetHouseholdById(territoryNumber, householdId)
    if (!updatedHousehold) return null
    logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} modificó una vivienda: territorio ${territoryNumber}, vivienda ${updatedHousehold.householdId}, estado ${updatedHousehold.callingState}, no abonado ${updatedHousehold.notSubscribed}, asignado ${updatedHousehold.isAssigned}`, telephonicLogs)
    //sendAlertOfTerritoriesEmailService()
    return updatedHousehold
}

export const setResetDate = async (territory: string, option: number, email: string): Promise<boolean> => {
    // without permission filter / just admins
    const success: boolean = await telephonicDbConnection.SetResetDate(territory, option)
    if (!success) logger.Add(`Admin ${email} no pudo setear fecha de reseteo de territorio ${territory} opción ${option}`, errorLogs)
    return success
}
