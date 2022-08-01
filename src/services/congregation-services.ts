import { typeCongregationItem } from '../controllers/congregation-controller'
import { getActivatedUserByAccessTokenService } from './user-services'
import { typeUser } from '../models'
import Axios from 'axios'

export const getCongregationItems = async (token: string): Promise<typeCongregationItem[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const siteUrl: string = 'https://sites.google.com/view/tablerocongpm/'
    try {
        const { data } = await Axios.get(siteUrl)
        const items: string[] = []
        const urlElements: string[] = data.split('href="/view/tablerocongpm/')
        urlElements.shift()
        urlElements.forEach(x => {
            const item: string = x.split('"')[0]
            if (item !== 'inicio' && !items.includes(item)) items.push(item)
        })
        let congregationItems: typeCongregationItem[] = []
        const promisesArray: any[] = []
        for (let i = 0; i < items.length; i++) {
            promisesArray.push(new Promise(async (resolve, reject) => {
                try {
                    const { data } = await Axios.get(siteUrl + items[i])
                    const titleElements: string[] = data.split('</h2>')[0].split('>')
                    const title: string = titleElements[titleElements.length - 1]
                    let ids: string[] = data.split('data-embed-doc-id="')
                    ids.shift()
                    ids = ids.map(x => x.split('"')[0])
                    resolve({
                        ids,
                        title
                    })
                } catch (error) {
                    console.log(error)
                    reject()
                }
            }))
        }
        congregationItems = await Promise.all(promisesArray)
        return congregationItems
    } catch (error) {
        console.log(error)
        return null
    }
}
