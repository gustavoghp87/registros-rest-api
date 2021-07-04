import { statistic, localStatistic } from '../models/statistic'
import { HouseholdDb } from './database-services/householdDbConnection'
import * as userServices from './user-services'

export const getBlocks = async (terr: string) => {
    //if (!userServices.checkAuthByToken(token)) return null
    const blocks = await new HouseholdDb().GetBlocks(terr)
    console.log("Blocks array:", blocks)
    return blocks
}

export const searchTerritoryByNumber = async (
    terr: string, manzana: string, todo: boolean, traidos: number, traerTodos: boolean
) => {
    console.log("Searching households in", terr, ", block", manzana)
    //if (!userServices.checkAuthByToken(token)) return null
    const households = await new HouseholdDb().SearchTerritoryByNumber(terr, manzana, todo, traidos, traerTodos)
    return households
}

export const searchBuildingByNumber = async (num: string) => {
    //if (!userServices.checkAuthByToken(token)) return null
    const household = await new HouseholdDb().SearchHouseholdByNumber(num)
    console.log("Searching household by inner_id", num)
    if (!household) {
        console.log("Household did not found or something failed");
        return null
    }
    console.log("Household found:", household)
    return household
}

export const resetTerritory = async (token: string, option: number, territorio: string) => {
    if (!userServices.checkAdminByToken(token)) return false
    const response = await new HouseholdDb().ResetTerritory(option, territorio)
    if (!response) {
        console.log("Something failed in reset territory", territorio)
        return false
    }
    console.log("Territory reseted")
    return true
}

export const getLocalStatistics = async (token: string, territorio: string) => {
    if (!userServices.checkAdminByToken(token)) return null
    const localStat: statistic|null = await new HouseholdDb().GetLocalStatistics(territorio)
    if (!localStat) return null
    const localStatistics: localStatistic = {...localStat, territorio}
    return localStatistics
}

export const getGlobalStatistics = async (token: string) => {
    if (!userServices.checkAdminByToken(token)) return null
    const globalStatistics: statistic|null = await new HouseholdDb().GetGlobalStatistics()
    if (!globalStatistics) return null
    return globalStatistics
}

export const updateHouseholdState = async (input: any) => {
    if (!userServices.checkAuthByToken(input.token)) return null
    const household = await new HouseholdDb().UpdateHouseholdState(input)
    if (!household) return null
    return household
}

