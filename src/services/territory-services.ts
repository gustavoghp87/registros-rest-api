import { statistic, localStatistic } from '../models/statistic'
import { dbClient } from '../server'
import * as userServices from './user-services'


export const getBlocks = async (terr: string) => {
    //if (!userServices.checkAuthByToken(token)) return null
    const blocks = await dbClient.GetBlocks(terr)
    console.log("Blocks array:", blocks)
    return blocks
}

export const searchTerritoryByNumber = async (
    terr: string, manzana: string, todo: boolean, traidos: number, traerTodos: boolean
) => {
    console.log("Searching households in", terr, ", block", manzana)
    //if (!userServices.checkAuthByToken(token)) return null
    const households = await dbClient.SearchTerritoryByNumber(terr, manzana, todo, traidos, traerTodos)
    return households
}

export const searchBuildingByNumber = async (num: string) => {
    //if (!userServices.checkAuthByToken(token)) return null
    const household = await dbClient.SearchHouseholdByNumber(num)
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
    const response = await dbClient.ResetTerritory(option, territorio)
    if (!response) {
        console.log("Something failed in reset territory", territorio)
        return false
    }
    console.log("Territory reseted")
    return true
}

export const getLocalStatistics = async (token: string, territorio: string) => {
    if (!userServices.checkAdminByToken(token)) return null
    const localStat: statistic|null = await dbClient.GetLocalStatistics(territorio)
    if (!localStat) return null
    const localStatistics: localStatistic = {...localStat, territorio}
    return localStatistics
}

export const getGlobalStatistics = async (token: string) => {
    if (!userServices.checkAdminByToken(token)) return null
    const globalStatistics: statistic|null = await dbClient.GetGlobalStatistics()
    if (!globalStatistics) return null
    return globalStatistics
}

export const updateHouseholdState = async (input: any) => {
    if (!userServices.checkAuthByToken(input.token)) return null
    const household = await dbClient.UpdateHouseholdState(input)
    if (!household) return null
    return household
}

