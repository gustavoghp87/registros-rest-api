import { logger } from '../server'
import { deallocateMyTerritoryService, getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { stateOfTerritoryChange } from './log-services'
import { StateOfTerritoryDb } from '../services-db/stateOfTerritoryDbConnection'
import { typeStateOfTerritory, typeUser } from '../models'

const stateOfTerritoryDbConnection: StateOfTerritoryDb = new StateOfTerritoryDb()

export const getStateOfTerritoryService = async (token: string, territory: string): Promise<typeStateOfTerritory|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territory) return null
    // assigned ?
    const stateOfTerritory: typeStateOfTerritory|null = await stateOfTerritoryDbConnection.GetStateOfTerritory(territory)
    return stateOfTerritory
}

export const getStateOfTerritoriesService = async (token: string): Promise<typeStateOfTerritory[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const stateOfTerritories: typeStateOfTerritory[]|null = await stateOfTerritoryDbConnection.GetStateOfTerritories()
    return stateOfTerritories
}

export const changeStateOfTerritoryService = async (token: string, territory: string, isFinished: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    // check this user is allowed to change this territory
    if (!user || !territory) return false
    isFinished = !!isFinished
    const success: boolean = await stateOfTerritoryDbConnection.ChangeStateOfTerritory(territory, isFinished)
    if (success) {
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambia territorio ${territory} a ${isFinished ? 'terminado' : 'abierto'}`, stateOfTerritoryChange)
        // if I am not an Admin
        if (user.role !== 1) await deallocateMyTerritoryService(token, territory)
    } else
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} no pudo cambiar territorio ${territory} a ${isFinished ? 'terminado' : 'abierto'}`, stateOfTerritoryChange)
    return success
}

export const setResetDate = async (territory: string, option: number): Promise<boolean> => {
    // without permission filter / just admins
    const success: boolean = await stateOfTerritoryDbConnection.SetResetDate(territory, option)
    return success
}
