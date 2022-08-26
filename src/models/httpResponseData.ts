import { Credentials } from 'google-auth-library'
import { typeAllLogsObj, typeCampaignPack, typeCongregationItem, typeCoords, typeHousehold, typeHTHTerritory, typeLocalTelephonicStatistic, typeTelephonicStatistic, typeTelephonicTerritory, typeUser } from '.'

export type typeResponseData = {
    success: boolean
    //
    address: string
    allLogsObj: typeAllLogsObj
    alreadyExists: boolean
    campaignAssignments: number[]
    campaignPack: typeCampaignPack
    campaignPacks: typeCampaignPack[]
    congregationItems: typeCongregationItem[]
    coordinates: typeCoords
    dataError: boolean
    email: string
    emailSuccess: boolean
    expired: boolean
    globalStatistics: typeTelephonicStatistic,
    gmailKeys: Credentials
    household: typeHousehold
    hthTerritory: typeHTHTerritory
    isDisabled: boolean
    localStatistics: typeLocalTelephonicStatistic[]
    modifiedCount: number
    newPassword: string
    newToken: string,
    recaptchaFails: boolean
    streets: string[]
    telephonicTerritory: typeTelephonicTerritory
    url: string
    used: boolean
    user: typeUser
    userExists: boolean
    users: typeUser[]
    wrongPassword: boolean
}
