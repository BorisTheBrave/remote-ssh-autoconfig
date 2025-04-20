import axios from "axios";
import * as vscode from "vscode";

export interface VastInstance {
  id: number;
  ssh_host: string;
  ssh_port: number;
  actual_status: string;
  intended_status: string;
  cur_state: string;
  label: string;
  gpu_util: number;
  gpu_arch: string;
  cpu_util: number;
  mem_usage: number;
  mem_limit: number;
  public_ipaddr: string;
  ports: Record<string, { HostIp: string; HostPort: string }[]>;
  template_name: string;
  gpu_name: string;
  // Add other fields as needed
}

export class VastApi {
  private baseUrl = "https://console.vast.ai/api/v0";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = vscode.workspace
      .getConfiguration("remoteSshAutoconfig")
      .get("apiKey");
  }

  /**
   * Sets the API key for VAST.ai authentication
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    vscode.workspace
      .getConfiguration("remoteSshAutoconfig")
      .update("apiKey", apiKey, vscode.ConfigurationTarget.Global);
  }

  /**
   * Gets the API key for VAST.ai authentication
   */
  getApiKey(): string | undefined {
    return this.apiKey;
  }

  /**
   * Fetches all available instances from VAST.ai
   */
  async getInstances(): Promise<VastInstance[]> {
    try {
      if (!this.apiKey) {
        throw new Error(
          "API key is not set. Please set it in the extension settings or when prompted."
        );
      }

      const response = await axios.get(`${this.baseUrl}/instances/`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.instances;
    } catch (error) {
      throw new Error(
        `Failed to fetch VAST.ai instances: ${(error as Error).message}`
      );
    }
  }

  /**
   * Fetches detailed information for a specific instance
   */
  async getInstanceDetails(instanceId: number): Promise<VastInstance> {
    try {
      if (!this.apiKey) {
        throw new Error(
          "API key is not set. Please set it in the extension settings or when prompted."
        );
      }

      const response = await axios.get(
        `${this.baseUrl}/instances/${instanceId}/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.instances;
    } catch (error) {
      throw new Error(
        `Failed to fetch instance details: ${(error as Error).message}`
      );
    }
  }

  async attachSshKey(instanceId: number, publicSshKey: string): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error(
          "API key is not set. Please set it in the extension settings or when prompted."
        );
      }

      const response = await axios.post(
        `${this.baseUrl}/instances/${instanceId}/ssh/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          data: {
            body: {
              ssh_key: publicSshKey,
            },
          },
        }
      );

      return response.data.instances;
    } catch (error) {
      throw new Error(`Failed to attach SSH key: ${(error as Error).message}`);
    }
  }
}
