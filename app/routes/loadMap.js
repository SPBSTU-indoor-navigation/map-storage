import { gzip } from 'node-gzip'

import { Map } from '../db/index.js'
import config from 'config'

const cacheTimeout = config.get('cache-timeout') || 60
let ceche = {}

function sendGziped(res, data) {
  res
    .header("Content-Type", "application/json")
    .header("Content-Encoding", "gzip")
    .send(data)
}

function sendMapNotFound(res, mapID) {
  res
    .code(404)
    .send(`Map with id ${mapID} not found`)
}

/**
@param { import('fastify').FastifyInstance } fastify
*/
export default async function routes(fastify) {
  fastify.get('/map/:id', async (req, res) => {
    const mapID = req.params.id
    let cachedMap = ceche[mapID]

    if (!cachedMap) {
      cachedMap = ceche[mapID] = {
        async load() {
          if (!this.loading) {
            this.loading = new Promise(async (resolve, reject) => {
              const delta = (Date.now() - (this.time || 0)) / 1000

              if (this.map) {
                if (delta < cacheTimeout) {
                  return resolve(this.map)
                }

                const mapVersion = await Map.findOne({ mapID: mapID }, { __v: true })

                if (!mapVersion) {
                  console.warn(`Map "${mapID}" not found in monogoDB, return from cache`)
                  this.time = Date.now()
                  return resolve(this.map)
                }

                if (this.version === mapVersion.__v) {
                  this.time = Date.now()
                  return resolve(this.map)
                }

              }

              if (!this.map && delta < cacheTimeout) {
                return resolve(null)
              }

              const map = await Map.findOne({ mapID: mapID })

              this.map = map ? await gzip(Buffer.from(JSON.stringify(map))) : null
              this.time = Date.now()

              if (!map) {
                return resolve(null)
              }

              this.version = map.__v
              resolve(this.map);
            })
          }

          const res = await this.loading
          this.loading = undefined
          return res
        }
      }
    }


    const map = await cachedMap.load()

    if (!map) {
      sendMapNotFound(res, mapID)
    } else {
      sendGziped(res, map)
    }

  })
}
