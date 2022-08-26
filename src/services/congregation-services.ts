import Axios from 'axios'
import { logger } from '../server'
import { googleSiteUrl } from '../env-variables'
import { typeCongregationItem, typeUser } from '../models'

export const getCongregationItems = async (requesterUser: typeUser): Promise<typeCongregationItem[]|null> => {
    if (!requesterUser) return null
    const siteUrl: string = 'https://sites.google.com' + googleSiteUrl
    try {
        const { data } = await Axios.get(siteUrl)
        const items: string[] = []
        const urlElements: string[] = data.split('href="' + googleSiteUrl)
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
                    logger.Add(`No se pudo traer el identificador del PDF: ${error}`, 'ErrorLogs')
                    reject()
                }
            }))
        }
        congregationItems = await Promise.all(promisesArray)
        return congregationItems
    } catch (error) {
        console.log(error)
        logger.Add(`Falló la conexión con el sitio Google de los PDF: ${error}`, 'ErrorLogs')
        return null
    }
}
