import { logger } from '../server'
import { deallocateMyTerritoryService, getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { stateOfTerritoryChange } from './log-services'
import { StateOfTerritoryDb } from '../services-db/stateOfTerritoryDbConnection'
import { isTerritoryAssignedToUser } from './territory-services'
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
    if (!user || !territory) return false
    if (user.role !== 1 && !isTerritoryAssignedToUser(user, territory)) return false
    isFinished = !!isFinished
    const success: boolean = await stateOfTerritoryDbConnection.ChangeStateOfTerritory(territory, isFinished)
    if (success) {
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambia territorio ${territory} a ${isFinished ? 'terminado' : 'abierto'}`, stateOfTerritoryChange)
        if (isFinished) {
            const success1: boolean = await deallocateMyTerritoryService(token, territory)
            if (!success1) logger.Add(`No se pudo desasignar territorio ${territory} a ${user.email} luego de cerrarlo`, stateOfTerritoryChange)
        }
    } else {
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} no pudo cambiar territorio ${territory} a ${isFinished ? 'terminado' : 'abierto'}`, stateOfTerritoryChange)
    }
    return success
}

export const setResetDate = async (territory: string, option: number): Promise<boolean> => {
    // without permission filter / just admins
    const success: boolean = await stateOfTerritoryDbConnection.SetResetDate(territory, option)
    return success
}
