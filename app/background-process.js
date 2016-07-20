// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, protocol } from 'electron'
import env from './env'

import * as windows from './background-process/windows'
import buildMenu from './background-process/window-menu'
import * as sitedata from './background-process/sitedata'
import * as bookmarks from './background-process/bookmarks'
import * as history from './background-process/history'

// import * as ipfsNetwork from './background-process/networks/ipfs'

import * as beakerProtocol from './background-process/protocols/beaker'
import * as beakerFaviconProtocol from './background-process/protocols/beaker-favicon'
import * as datProtocol from './background-process/protocols/dat'
import * as viewDatProtocol from './background-process/protocols/view-dat'
// import * as ipfsProtocol from './background-process/protocols/ipfs'

import * as datDebug from './background-process/networks/dat/debug'
import url from 'url';

var mainWindow;

protocol.registerStandardSchemes(['dat', 'view-dat', 'safe']) // must be called before 'ready'
app.on('ready', function () {
  // ui
  Menu.setApplicationMenu(Menu.buildFromTemplate(buildMenu(env)));
  windows.setup()

    var _safeHandler = function(req, cb)
    {
        const parsed = url.parse(req.url);
        const tokens = parsed.host.split('.');
        // We pretend there are only 2 pieces
        // TODO: be more strict here

        const service = tokens.length === 2 ? tokens[0] : 'www';
        const domain = tokens.length === 2 ? tokens[1] : tokens[0];
        const path = parsed.pathname !== '/' ? parsed.pathname.split('/').slice(1).join('/') : 'index.html';
        const newUrl = `http://localhost:8100/dns/${service}/${domain}/${encodeURIComponent(decodeURIComponent(path))}`;

        console.log( "New SAFE url", newUrl );
        cb({ url: newUrl });
    }

    protocol.registerHttpProtocol('safe', _safeHandler, (err) => { console.log('Registered safe handler:', err); });
  // databases
  sitedata.setup()
  bookmarks.setup()
  history.setup()

  // networks
  // ipfsNetwork.setup()

  // protocols
  beakerProtocol.setup()
  beakerFaviconProtocol.setup()
  datProtocol.setup()
  viewDatProtocol.setup()
  // ipfsProtocol.setup()

  // debugging
  // datDebug.hostDebugDat()
})

app.on('window-all-closed', function () {
  // it's normal for OSX apps to stay open, even if all windows are closed
  // but, since we have an uncloseable tabs bar, let's close when they're all gone
  app.quit()
})

// app.once('will-quit', () => {
//   ipfsNetwork.shutdown()
// })
