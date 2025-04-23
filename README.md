# Remote VAST Extension

This VS Code extension automatically updates your ssh config file for the details of your currently running instances on vast.

## Installation

1. Download latest release from https://github.com/BorisTheBrave/remote-ssh-autoconfig/releases/latest
1. Open VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the command palette
3. Type "Install from VSIX" and select "Extensions: Install from VSIX..."
4. Select the downloaded .vsix file

## Setup

* Install this extension
* Install Remote-SSH extension
* Open settings and set `remoteSshAutoconfig.apiKey` to your vast API key (from https://cloud.vast.ai/manage-keys/)
* (optional) Also set the path of your private key `remoteSshAutoconfig.privateSshKeyPath` if needed.
* (optional) Configure vast.ai to automatically setup instances your public key.
* Run "Regen vast.ai ssh config" from the command palette
* Run "Remote-SSH: Connect to Host.." and select your vast instance.

## Release Notes

### 0.0.1

Initial release

## Development

1. Clone the repository
2. Run `npm install`
3. Run `npm run compile`
3. Open `out/extension.js` in VS Code
4. Press F5 and select "VS Code Extension Development" to start debugging

## Deployment

1. Install Node.js if you haven't already
2. Open a terminal in the extension directory
3. Run `npm install` to install dependencies
4. Run `npm install -g @vscode/vsce` to install the VS Code Extension Manager
5. Run `vsce package --allow-missing-repository` to create the .vsix file
6. Create a github release