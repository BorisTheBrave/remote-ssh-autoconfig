import * as vscode from "vscode";
import { VastInstance } from "./vastApi";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Gets the path to the user's SSH config file
 */
function getSshConfigPath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, ".ssh", "config");
}

/**
 * Creates an SSH config entry for a VAST instance
 */
export function createSshConfig(
  instance: VastInstance,
  privateKeyPath?: string
): string {
  console.log("Creating SSH config for instance:", instance);

  // For some reason, this is the wrong port?
  //const hostname = instance.ssh_host;
  //const port = instance.ssh_port;
  const hostname = instance.public_ipaddr;
  const port = instance.ports["22/tcp"][0].HostPort;

  // Sanitize the hostname to be legal
  const name =
    `vast-${instance.id}-${instance.template_name}-${instance.gpu_name}`
      .replace(/[^a-zA-Z0-9-]/g, "-") // Replace any non-alphanumeric characters with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  const nameEscaped = name.replace(/\\/g, "\\\\");

  let config = `Host "${nameEscaped}"
  HostName ${hostname}
  Port ${port}
  User root
  StrictHostKeyChecking no`;

  if (privateKeyPath) {
    // Escape backslashes and wrap in quotes
    const escapedPath = privateKeyPath.replace(/\\/g, "\\\\");
    config += `\n  IdentityFile "${escapedPath}"`;
  }

  return config;
}

/**
 * Updates the SSH config file with VAST instance configurations
 */
export async function updateSshConfig(
  context: vscode.ExtensionContext,
  instances: VastInstance[],
  privateKeyPath?: string
): Promise<void> {
  const sshConfigPath = getSshConfigPath();

  // Read existing config
  let existingConfig = "";
  if (fs.existsSync(sshConfigPath)) {
    existingConfig = fs.readFileSync(sshConfigPath, "utf8");
  }

  // Remove existing vast- entries and generated comments
  const lines = existingConfig.split("\n");
  const filteredLines = [];
  let skipNextLines = false;

  for (const line of lines) {
    if (
      line.trim().startsWith("Host vast-") ||
      line.includes("Generated by remote-ssh-autoconfig")
    ) {
      skipNextLines = true;
      continue;
    }
    if (skipNextLines) {
      if (line.trim() === "") {
        skipNextLines = false;
      }
      continue;
    }
    filteredLines.push(line);
  }

  const activeInstances = instances.filter((instance) => instance.ports);

  // Add new vast- entries
  const newConfig = filteredLines.join("\n").trim();
  const vastConfigs =
    activeInstances.length > 0
      ? "# Generated by remote-ssh-autoconfig\n" +
        activeInstances
          .map((instance) => createSshConfig(instance, privateKeyPath))
          .join("\n\n")
      : "";

  const finalConfig = newConfig + (newConfig ? "\n\n" : "") + vastConfigs;

  // Write updated config
  fs.writeFileSync(sshConfigPath, finalConfig);

  if (activeInstances.length > 0) {
    vscode.window.showInformationMessage("SSH config updated successfully");
  } else {
    vscode.window.showInformationMessage(
      "SSH config updated successfully but no active instances found"
    );
  }
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
