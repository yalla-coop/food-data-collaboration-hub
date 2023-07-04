/*
import { LocalStorage } from 'node-localstorage'

let storage = new LocalStorage('./db/storage')

export { storage }
*/

import storage from 'node-persist'

await storage.init({
  dir: './db/storage'
})

export { storage }