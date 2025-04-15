import * as vscode from "vscode";
import { VastApi, VastInstance } from "./vastApi";
import { saveSshConfig, connectToInstance } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  console.log("Remote VAST Extension is now active!");

  const vastApi = new VastApi();

  async function ensureVastApiKeyUI() {
    if (!vastApi.getApiKey()) {
      const apiKey = await vscode.window.showInputBox({
        prompt: "Enter your VAST.ai API key",
        password: true,
        placeHolder: "API key for VAST.ai authentication",
      });

      if (apiKey) {
        vastApi.setApiKey(apiKey);
      } else {
        vscode.window.showErrorMessage(
          "API key is required to connect to VAST.ai instances."
        );
        return false;
      }
    }
    return true;
  }

  async function getSshKeyPairUI(): Promise<[string, string] | null> {
    const publicSshKeyPath: string | undefined = vscode.workspace
      .getConfiguration("remoteVast")
      .get("publicSshKeyPath");
    const privateSshKeyPath: string | undefined = vscode.workspace
      .getConfiguration("remoteVast")
      .get("privateSshKeyPath");

    if (!publicSshKeyPath || !privateSshKeyPath) {
      vscode.window
        .showErrorMessage(
          "SSH key pair is required to connect to VAST.ai instances.",
          "Open settings"
        )
        .then(() => {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "remoteVast.publicSshKeyPath"
          );
        });

      return null;
    }

    return [publicSshKeyPath, privateSshKeyPath];
  }

  let disposable = vscode.commands.registerCommand(
    "remote-vast-extension.connectToVast",
    async () => {
      try {
        const keyPair = await getSshKeyPairUI();
        if (!keyPair) {
          return;
        }
        const [publicSshKeyPath, privateSshKeyPath] = keyPair;

        // Read the public key
        const publicSshKey = await vscode.workspace.fs.readFile(
          vscode.Uri.file(publicSshKeyPath)
        );

        vscode.window.showInformationMessage(
          `Public SSH key: ${publicSshKey.toString()}`
        );

        if (!(await ensureVastApiKeyUI())) {
          return;
        }

        // Fetch instances from VAST.ai
        const instances = await vastApi.getInstances();

        if (instances.length === 0) {
          vscode.window.showInformationMessage(
            "No available VAST.ai instances found."
          );
          return;
        }

        // Create quick pick items from instances
        const items = instances.map((instance) => ({
          label: instance.label || `Instance ${instance.id}`,
          description: `${instance.ssh_host}:${instance.ssh_port} (${
            instance.gpu_arch
          }, GPU: ${Math.round(instance.gpu_util * 100)}%, CPU: ${Math.round(
            instance.cpu_util * 100
          )}%)`,
          instance: instance,
        }));

        // Show quick pick
        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: "Select a VAST.ai instance to connect to",
        });

        if (selected) {
          try {
            // Get detailed instance information
            const instanceDetails = await vastApi.getInstanceDetails(
              selected.instance.id
            );

            // Save SSH config
            await saveSshConfig(context, instanceDetails, privateSshKeyPath);

            // Connect to the instance
            await connectToInstance(instanceDetails);
          } catch (error) {
            vscode.window.showErrorMessage((error as Error).message);
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage((error as Error).message);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
