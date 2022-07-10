import config from 'config'
import jwt from 'jsonwebtoken'

const mkKey = config.get('token-key')


/**
@param { import('fastify').FastifyInstance } fastify
*/
export default async function routes(fastify) {
  fastify.get('/token', async (req, res) => {
    let payload = {
      iss: 'LZP5UN7552',
      iat: Date.now() / 1000,
      exp: (Date.now() / 1000) + 60 * 60 * 24 * 14,
    };

    let header = {
      kid: "PH934W6ZL7",
      typ: "JWT",
      alg: "ES256"
    };

    res.send(jwt.sign(payload, mkKey, { header }))

  })
}



