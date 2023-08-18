import { Credentials } from 'google-auth-library'
import * as type from '.'

export type typeResponseData = {
    success: boolean
    //
    address: string
    allLogsObj: type.typeAllLogsObj
    alreadyExists: boolean
    boardsItems: type.typeBoardItem[]
    campaignAssignments: number[]
    campaignPack: type.typeCampaignPack
    campaignPacks: type.typeCampaignPack[]
    coordinates: type.typeCoords
    dataError: boolean
    email: string
    emailSuccess: boolean
    expired: boolean
    forecast: type.typeForecastResponse
    globalStatistics: type.typeTelephonicStatistic,
    gmailKeys: Credentials
    household: type.typeHousehold
    hthTerritory: type.typeHTHTerritory
    isDisabled: boolean
    localStatistics: type.typeLocalTelephonicStatistic[]
    modifiedCount: number
    newPassword: string
    newToken: string,
    recaptchaFails: boolean
    streets: string[]
    telephonicTerritory: type.typeTelephonicTerritory
    url: string
    used: boolean
    user: type.typeUser
    userExists: boolean
    users: type.typeUser[]
    weather: type.typeWeatherResponse
    wrongPassword: boolean
}
