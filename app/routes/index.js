import loadMap from './loadMap.js'
import saveMap from './saveMap.js'

import temp from './temp.js'


/**
@param { import('fastify').FastifyInstance } fastify
*/
export default async function routes(fastify) {
  fastify.register(loadMap, { prefix: '/api' })
  fastify.register(saveMap, { prefix: '/api' })
  fastify.register(temp, { prefix: '/api' })

  fastify.get('/api', (req, res) => {
    res.send(
      {
        status: 'online',
        env: process.env.NODE_ENV
      }
    )
  })
}