import { ipcMain } from 'electron'

import * as plugins from './plugins'
import * as beakerAPIs from './beaker-apis'

// exported api
// =

export function setup () {
  // register a message-handler for setting up the client
  // - see lib/fg/import-web-apis.js
  ipcMain.on('get-web-api-manifests', (event, scheme) => {
    // hardcode the beaker: scheme, since that's purely for internal use
    if (scheme == 'beaker:') {
      event.returnValue = beakerAPIs.getAPIs(scheme)
      return
    }

    // for everything else, we'll use the plugins
    event.returnValue = plugins.getWebAPIManifests(scheme)
  })
}