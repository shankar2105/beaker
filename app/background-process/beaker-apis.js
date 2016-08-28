import { app, protocol } from 'electron'
import path from 'path'
import fs from 'fs'
import log from 'loglevel'
import rpc from 'pauls-electron-rpc'
import emitStream from 'emit-stream'


// import standard issue db apis
import * as settings from './dbs/settings'
import * as sitedata from './dbs/sitedata'
import * as bookmarks from './dbs/bookmarks'
import * as history from './dbs/history'


import beakerBrowser from './api-manifests/browser'
import beakerBookmarks from './api-manifests/bookmarks'
import beakerDownloads from './api-manifests/downloads'
import beakerHistory from './api-manifests/history'
import beakerSitedata from './api-manifests/sitedata'
// globals
// =

const BEAKER_API_OVERRIDES_NODE_MODULES = path.join(__dirname, 'node_modules')
console.log('[API OVERRIDES] Loading from', BEAKER_API_OVERRIDES_NODE_MODULES)

// find all override plugins named beaker-api-*
var apiModuleNames = []
try { 
        apiModuleNames = fs.readdirSync(BEAKER_API_OVERRIDES_NODE_MODULES)
                        .filter(name => name.startsWith('beaker-api-'))
    }
catch (e) {}

// load the plugin modules
var apiModules = []
var apiPackageJsons = {}
apiModuleNames.forEach(name => {
  // load module
  try {
    // apiModules.push(require(path.join(BEAKER_API_OVERRIDES_NODE_MODULES, name)))
    apiModules[ name ] = require(path.join(BEAKER_API_OVERRIDES_NODE_MODULES, name))
  } catch (e) {
    log.error('[API OVERRIDES] Failed to load plugin', name, e)
    return
  }

  // load package.json
  loadPackageJson(name, apiPackageJsons)
})


// exported api
// =

// fetch a complete listing of the plugin info
// - each plugin module can export arrays of values. this is a helper to create 1 list of all of them
var caches = {}
export function getAllInfo (key) {
  // use cached
  if (caches[key])
    return caches[key]

  // construct
  caches[key] = []
  protocolModules.forEach(protocolModule => {
    if (!protocolModule[key])
      return

    // get the values from the module
    var values = protocolModule[key]
    if (!Array.isArray(values))
      values = [values]

    // add to list
    caches[key] = caches[key].concat(values)
  })
  return caches[key]
}

export function setupAPIs()
{
    
    console.log( "SETUP of APIs HAPPENS HERE", apiModuleNames );
    console.log( "APIs available", apiModules );
    // databases
    settings.setup()
    sitedata.setup()
    
    if( apiModuleNames.includes( 'beaker-api-bookmarks' ) )
    {
        console.log( "SETTING UP OUR BOOKMARKKKSSSSSSSSSSSS" );
        apiModules[ 'beaker-api-bookmarks' ].setup();
    }
    else
    {
        console.log( "lame. theirs" );
        bookmarks.setup()
    }
    history.setup()
    
}


export function getAPIs() 
{
    return {
        beakerBrowser,
        beakerBookmarks,
        beakerDownloads,
        beakerHistory,
        beakerSitedata
    }
}

// internal methods
// =

function loadPackageJson (name, packageObject) {
  var packageJson
  try { packageJson = extractPackageJsonAttrs(require(path.join(PLUGIN_NODE_MODULES, name, 'package.json'))) }
  catch (e) { packageJson = { name: name, status: 'installed' } }
  packageObject[name] = packageJson
}

function extractPackageJsonAttrs (packageJson) {
  return {
    name: packageJson.name,
    author: packageJson.author,
    description: packageJson.description,
    homepage: packageJson.homepage,
    version: packageJson.version,
    status: 'installed'
  }
}