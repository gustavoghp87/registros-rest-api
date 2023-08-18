import { deallocateMyTLPTerritoryService, getUsersNotAuthService } from './user-services'
import { errorLogs, telephonicLogs, telephonicStateLogs } from './log-services'
import { filterHouses, isTerritoryAssignedToUserService } from './helpers'
import { logger } from '../server'
import { TelephonicDb } from '../services-db/telephonicDbConnection'
import { typeCallingState, typeHousehold, typeLocalTelephonicStatistic, typeTelephonicStatistic, typeTelephonicTerritory, typeTerritoryNumber, typeTerritoryRow, typeUser } from '../models'

const telephonicDbConnection: TelephonicDb = new TelephonicDb()

export const changeStateOfTerritoryService = async (requesterUser: typeUser,
 territoryNumber: typeTerritoryNumber, isFinished: boolean): Promise<boolean> => {
    if (!requesterUser || !territoryNumber) return false
    if (requesterUser.role !== 1 && !isTerritoryAssignedToUserService(requesterUser, territoryNumber)) return false
    isFinished = !!isFinished
    const success: boolean = await telephonicDbConnection.ChangeStateOfTerritory(requesterUser.congregation, territoryNumber, isFinished)
    if (!success) {
        logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo cambiar territorio ${territoryNumber} a ${isFinished ? 'terminado' : 'abierto'}`, errorLogs)
        return false
    }
    logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cambia territorio ${territoryNumber} a ${isFinished ? 'terminado' : 'abierto'}`, telephonicStateLogs)
    if (isFinished) await deallocateMyTLPTerritoryService(requesterUser, territoryNumber)
    return true
}

const getAllTelephonicTerritoriesNotAuthService = async (congregation: number): Promise<typeTelephonicTerritory[]|null> => {
    // without permission filter / 
    const phoneTerritories: typeTelephonicTerritory[]|null = await telephonicDbConnection.GetAllTelephonicTerritories(congregation)
    return phoneTerritories
}

export const getTelephonicGlobalStatisticsService = async (requesterUser: typeUser): Promise<typeTelephonicStatistic|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    const telephonicTerritories: typeTelephonicTerritory[]|null = await telephonicDbConnection.GetAllTelephonicTerritories(requesterUser.congregation)
    if (!telephonicTerritories) return null
    telephonicTerritories.forEach(x => x.households = filterHouses(x.households))
    const telephonicGlobalStatistics: typeTelephonicStatistic = {
        numberOf_ADejarCarta: 0,
        numberOf_Contesto: 0,
        numberOf_NoAbonado: 0,
        numberOf_NoContesto: 0,
        numberOf_NoLlamar: 0,
        numberOf_FreePhones: 0,
        numberOfHouseholds: 0
    }
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

export const getTelephonicLocalStatisticsService = async (requesterUser: typeUser): Promise<typeLocalTelephonicStatistic[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    const telephonicTerritories: typeTelephonicTerritory[]|null = await telephonicDbConnection.GetAllTelephonicTerritories(requesterUser.congregation)
    if (!telephonicTerritories) return null
    telephonicTerritories.forEach(x => x.households = filterHouses(x.households))
    const telephonicLocalStatistics: typeLocalTelephonicStatistic[] = []
    for (let i = 0; i < telephonicTerritories.length; i++) {
        const localStatistics: typeLocalTelephonicStatistic = {
            congregation: requesterUser.congregation,
            isFinished: telephonicTerritories[i].stateOfTerritory.isFinished,
            numberOf_ADejarCarta: 0,
            numberOf_Contesto: 0,
            numberOf_NoAbonado: 0,
            numberOf_NoContesto: 0,
            numberOf_NoLlamar: 0,
            numberOf_FreePhones: 0,
            numberOfHouseholds: 0,
            stateOfTerritory: { isFinished: false, resetDates: [] },
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
        localStatistics.stateOfTerritory = telephonicTerritories[i].stateOfTerritory
        telephonicLocalStatistics.push(localStatistics)
    }
    return telephonicLocalStatistics
}

export const getTelephonicStatisticsTableDataService = async (requesterUser: typeUser): Promise<typeTerritoryRow[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    const territories = await getAllTelephonicTerritoriesNotAuthService(requesterUser.congregation)
    const users = await getUsersNotAuthService(requesterUser.congregation)
    if (!territories || !users) return null
    let territoriesTableData: typeTerritoryRow[] = []
    territories.forEach(t => {
        const left = { ...t }.households.filter(x => x.doorBell && x.callingState === 'No predicado' && !x.notSubscribed).length
        const total = { ...t }.households.filter(x => x.doorBell).length
        const leftRel = total === 0 ? '-' : (left/total * 100).toFixed(1) + '%'
        const lastDate = new Date({ ...t }.households.reduce((a, b) => a.dateOfLastCall > b.dateOfLastCall ? a : b)?.dateOfLastCall)
        const last = `${lastDate.getFullYear()}-${('0' + (lastDate.getMonth() + 1)).slice(-2)}-${('0' + lastDate.getDate()).slice(-2)}`
        const row: typeTerritoryRow = {
            congregation: requesterUser.congregation,
            territoryNumber: parseInt(t.territoryNumber),
            assigned: [],
            opened: !t.stateOfTerritory.isFinished,
            left,
            total,
            leftRel,
            last
        }
        territoriesTableData.push(row)
    })
    const territoriesTableData1 = [...territoriesTableData].sort((a, b) => a.territoryNumber - b.territoryNumber)
    users.forEach(u => {
        if (u.phoneAssignments?.length) {
            u.phoneAssignments.forEach(a => {
                territoriesTableData1.find(x => x.territoryNumber === a)?.assigned.push(u.email)
            })
        }
    })
    return territoriesTableData1
}

export const getTerritoryStreetsService = async (congregation: number, territoryNumber: typeTerritoryNumber): Promise<string[]|null> => {
    // without permission filter / used by hth services
    const telephonicTerritory: typeTelephonicTerritory|null = await telephonicDbConnection.GetTerritory(congregation, territoryNumber)
    if (!telephonicTerritory || !telephonicTerritory.households) return null
    const streets: string[] = []
    telephonicTerritory.households.forEach(x => {
        if (!streets.includes(x.street)) streets.push(x.street)
    })
    return streets
}

export const getTelephonicTerritoryService = async (requesterUser: typeUser, territory: typeTerritoryNumber): Promise<typeTelephonicTerritory|null> => {
    if (!requesterUser || !territory) return null
    if (requesterUser.role !== 1 && !isTerritoryAssignedToUserService(requesterUser, territory)) return null
    const telephonicTerritory: typeTelephonicTerritory|null = await telephonicDbConnection.GetTerritory(requesterUser.congregation, territory)
    if (!telephonicTerritory) return null
    telephonicTerritory.households = filterHouses(telephonicTerritory.households)
    return telephonicTerritory
}

export const modifyHouseholdService = async (requesterUser: typeUser, territoryNumber: typeTerritoryNumber,
 householdId: number, callingState: typeCallingState, notSubscribed: boolean, asignado: boolean): Promise<typeHousehold|null> => {
    notSubscribed = !!notSubscribed
    asignado = !!asignado
    if (!requesterUser || !householdId || !callingState) return null
    const isTelephonicTerritoryAssignedToUser = async (user: typeUser, territoryNumber: typeTerritoryNumber, householdId: number): Promise<boolean> => {
        if (!territoryNumber || !user || !user.phoneAssignments.length) return false
        const household: typeHousehold|null = await telephonicDbConnection.GetHouseholdById(requesterUser.congregation, territoryNumber, householdId)
        if (!household) return false
        try {
            const success: boolean = user.phoneAssignments.includes(parseInt(territoryNumber))
            return success
        } catch (error) {
            logger.Add(requesterUser.congregation, `Falló isHouseholdAssignedToUser(): ${error}`, errorLogs)
            return false
        }
    }
    if (!await isTelephonicTerritoryAssignedToUser(requesterUser, territoryNumber, householdId)) return null
    const success: boolean = await telephonicDbConnection.UpdateHouseholdState(requesterUser.congregation, territoryNumber, householdId, callingState, notSubscribed, asignado)
    if (!success) return null
    const updatedHousehold: typeHousehold|null = await telephonicDbConnection.GetHouseholdById(requesterUser.congregation, territoryNumber, householdId)
    if (!updatedHousehold) return null
    logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} modificó una vivienda: territorio ${territoryNumber}, vivienda ${updatedHousehold.householdId}, estado ${updatedHousehold.callingState}, no abonado ${updatedHousehold.notSubscribed}, asignado ${updatedHousehold.isAssigned}`, telephonicLogs)
    //sendAlertOfTerritoriesEmailService()
    return updatedHousehold
}

export const resetTerritoryService = async (requesterUser: typeUser, territoryNumber: typeTerritoryNumber, option: number): Promise<number|null> => {
    if (!requesterUser || requesterUser.role !== 1 || !territoryNumber || !option) return null
    let modifiedCount: number|null = await telephonicDbConnection.ResetTerritory(requesterUser.congregation, territoryNumber, option)
    if (modifiedCount === null) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} no pudo resetear territorio ${territoryNumber} opción ${option}`, telephonicStateLogs)
        return null
    }
    logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} reseteó territorio ${territoryNumber} con la opción ${option}`, telephonicStateLogs)
    if (modifiedCount) {
        const success: boolean = await telephonicDbConnection.SetResetDate(requesterUser.congregation, territoryNumber, option)
        if (!success) logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} no pudo setear fecha de reseteo de territorio ${territoryNumber} opción ${option}`, errorLogs)
        await changeStateOfTerritoryService(requesterUser, territoryNumber, false)
    }
    return modifiedCount
}
