import * as vscode from "vscode";
import { VastInstance } from "./vastApi";

/**
 * Creates an SSH config for a VAST instance
 */
export function createSshConfig(
  instance: VastInstance,
  privateKeyPath: string
): string {
  return `Host vast-${instance.id}
HostName ${instance.ssh_host}
Port ${instance.ssh_port}
User root
IdentityFile ${privateKeyPath}
StrictHostKeyChecking no`;
}

/**
 * Saves SSH configuration for a VAST instance
 */
export async function saveSshConfig(
  context: vscode.ExtensionContext,
  instance: VastInstance,
  privateKeyPath: string
): Promise<void> {
  const sshConfig = createSshConfig(instance, privateKeyPath);

  // Save SSH config
  const sshConfigPath = vscode.Uri.joinPath(
    context.globalStorageUri,
    "vast-ssh-config"
  );
  await vscode.workspace.fs.writeFile(sshConfigPath, Buffer.from(sshConfig));
}

/**
 * Connects to a VAST instance using Remote-SSH
 */
export async function connectToInstance(instance: VastInstance): Promise<void> {
  await vscode.commands.executeCommand(
    "remote-ssh.connectToHost",
    `vast-${instance.id}`
  );
}
