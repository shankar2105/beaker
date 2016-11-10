const { protocol } = require('electron')
var request = require('request');

var registerProtocol = function() {
	protocol.registerBufferProtocol('shankar', (req, callback) => {
        var resData = new Buffer(`<div>
            <h3>SAFE Authoriser</h3>
            <h5>URL :: ${req.url}</h5>
        </div>`);
        callback({mimeType: 'text/html', data: resData})
	}, (error) => {
	  if (error) console.error('Failed to register protocol')
	})
};

var scheme = {
    scheme: 'shankar',
    label: 'SHANKAR Network',
    isStandardURL: true,
    isInternal: true,
    register: registerProtocol
}

module.exports = {
    configure (opts) {},
    homePages: [{
        label: 'SHANKAR Network',
        href: 'https://safenetforum.org/t/safe-network-alpha-release/10687/1'
    }],
    protocols: [ scheme ],
    webAPIs: [{}]
};