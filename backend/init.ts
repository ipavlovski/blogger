import { existsSync, mkdirSync } from 'node:fs'
import server from 'backend/server'

const SERVER_PORT = process.env.SERVER_PORT!
// existsSync(`${__dirname}/assets`) || mkdirSync(`${__dirname}/assets`)

server.listen(SERVER_PORT, () => {
  console.log(`Listening on ${SERVER_PORT} in dir ${__dirname}\n@ ${new Date().toISOString()}`)
})
