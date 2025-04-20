import * as vscode from "vscode";
import { VastApi, VastInstance } from "./vastApi";
import { updateSshConfig } from "./utils";

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

  async function getPrivateSshKeyPath(): Promise<string | null> {
    const privateSshKeyPath: string | undefined = vscode.workspace
      .getConfiguration("remoteSshAutoconfig")
      .get("privateSshKeyPath");

    if (!privateSshKeyPath) {
      vscode.window
        .showErrorMessage(
          "SSH key pair is required to connect to VAST.ai instances.",
          "Open settings"
        )
        .then(() => {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "remoteSshAutoconfig.privateSshKeyPath"
          );
        });

      return null;
    }

    return privateSshKeyPath;
  }

  let disposable = vscode.commands.registerCommand(
    "remote-ssh-autoconfig.connectToVast",
    async () => {
      try {
        const privateSshKeyPath = await getPrivateSshKeyPath();
        if (!privateSshKeyPath) {
          return;
        }

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

        // Update SSH config with all instances
        await updateSshConfig(context, instances, privateSshKeyPath);
      } catch (error) {
        vscode.window.showErrorMessage((error as Error).message);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
