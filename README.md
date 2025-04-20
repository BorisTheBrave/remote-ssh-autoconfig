# Remote VAST Extension

This VS Code extension automatically updates your ssh config file for the details of your currently running instances on vast.

## Setup

* Install this extension
* Install Remote-SSH extension
* Open settings and set `remoteVast.apiKey` to your vast API key (from https://cloud.vast.ai/manage-keys/)
* (optional) Also set the path of your private key `remoteVast.privateSshKeyPath` if needed.
* (optional) Configure vast.ai to automatically setup instances your public key.
* Run "Regen vast.ai ssh config" from the command palette
* Run "Remote-SSH: Connect to Host.." and select your vast instance.


## Extension Settings

This extension doesn't add any settings yet.

## Release Notes

### 0.0.1

Initial release

## Development

1. Clone the repository
2. Run `npm install`
3. Run `npm run compile`
3. Open `out/extension.js` in VS Code
4. Press F5 to start debugging