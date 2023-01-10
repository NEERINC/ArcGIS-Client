import console from 'console'
import { config } from 'dotenv'
import 'isomorphic-fetch'
import { resolve } from 'path'

// Load jest.env
config({
    path: resolve(__dirname, './jest.env')
})

// Begone, dense jest logging output!
global.console = console

jest.useRealTimers()
jest.setTimeout(60000)
