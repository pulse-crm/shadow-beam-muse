import {
  Cpu,
  Monitor,
  RefreshCw,
  Zap,
  Wifi,
  Network,
  Shield,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toast/toaster";
import type { Device } from "@/data/mock";

interface DeviceManagementDialogProps {
  device: Device | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Synthetic numbers for telemetry — pulse mock doesn't carry them, but they make
// the demo look complete. Stable per device via the serial number.
function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

const connectedDevices = [
  { name: "iPhone 15 Pro", mac: "A4:B1:C2:D3:E4:F5", band: "5 GHz", ip: "192.168.1.10" },
  { name: "Samsung Smart TV", mac: "B2:C3:D4:E5:F6:A1", band: "5 GHz", ip: "192.168.1.11" },
  { name: "MacBook Air", mac: "C3:D4:E5:F6:A1:B2", band: "5 GHz", ip: "192.168.1.12" },
  { name: "Ring Doorbell", mac: "D4:E5:F6:A1:B2:C3", band: "2.4 GHz", ip: "192.168.1.20" },
  { name: "Echo Dot", mac: "E5:F6:A1:B2:C3:D4", band: "2.4 GHz", ip: "192.168.1.21" },
];

export function DeviceManagementDialog({ device, open, onOpenChange }: DeviceManagementDialogProps) {
  if (!device) return null;

  const isRouter = device.type === "Router" || device.type === "Modem";
  const seed = hash(device.serialNumber);
  const down = (74 + (seed % 30)).toFixed(1); // ~74-104 Mbps
  const up = (18 + (seed % 10)).toFixed(1);
  const latency = 8 + (seed % 8); // 8-16 ms
  const wifi24 = 50 + (seed % 30); // %
  const wifi5 = 35 + ((seed >> 2) % 30); // %
  const dev24 = 1 + (seed % 4);
  const dev5 = 3 + ((seed >> 2) % 6);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Device Management — {device.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Product Information */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              Product Information
            </h4>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 bg-muted/30">
              <div>
                <span className="text-xs text-muted-foreground">Make</span>
                <p className="text-sm font-medium">Pulse Networks</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Model</span>
                <p className="text-sm font-medium">{device.name.replace("Pulse ", "")}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Type</span>
                <p className="text-sm font-medium">{device.type}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Serial Number</span>
                <p className="text-sm font-medium font-mono">{device.serialNumber}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Assigned Service</span>
                <p className="text-sm font-medium">Fibre Broadband</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Warranty Expiry</span>
                <p className="text-sm font-medium">2027-08-14</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={device.status} />
                </div>
              </div>
              {device.ipAddress && (
                <div>
                  <span className="text-xs text-muted-foreground">IP Address</span>
                  <p className="text-sm font-medium font-mono">{device.ipAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Firmware Information */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              Firmware Information
            </h4>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 bg-muted/30">
              <div>
                <span className="text-xs text-muted-foreground">Current Firmware</span>
                <p className="text-sm font-medium font-mono">{device.firmware}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Latest Available</span>
                <p className="text-sm font-medium font-mono">v4.3.0-stable</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Last Updated</span>
                <p className="text-sm font-medium">2026-01-12 03:22</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Auto-Update</span>
                <p className="text-sm font-medium">Enabled (Maintenance Window)</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => toast({ title: "Checking for updates", description: `${device.name} is up to date.` })}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Check for Update
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => toast({ title: "Update queued", description: `${device.name} will update at next window.` })}
              >
                <Zap className="h-3 w-3 mr-1" /> Push Update
              </Button>
            </div>
          </div>

          {/* In-Home Telemetry (Router/Modem only) */}
          {isRouter && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                In-Home Telemetry
              </h4>
              <div className="space-y-3">
                {/* Connection Status */}
                <div className="rounded-lg border p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Connection Status</span>
                    <Badge variant="default" className="text-xs bg-green-600">
                      {device.status === "Online" ? "Online" : device.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Uptime</span>
                      <p className="text-sm font-medium">14d 7h 32m</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Last Reboot</span>
                      <p className="text-sm font-medium">2026-04-29</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">WAN IP</span>
                      <p className="text-sm font-medium font-mono">82.12.45.198</p>
                    </div>
                  </div>
                </div>

                {/* Wi-Fi Performance */}
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs font-medium block mb-2">Wi-Fi Performance</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">2.4 GHz Band</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${wifi24}%` }} />
                        </div>
                        <span className="text-xs font-mono">{wifi24}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{dev24} devices connected</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">5 GHz Band</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${wifi5}%` }} />
                        </div>
                        <span className="text-xs font-mono">{wifi5}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{dev5} devices connected</p>
                    </div>
                  </div>
                </div>

                {/* Line Stats */}
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs font-medium block mb-2">Line Statistics</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Download Speed</span>
                      <p className="text-sm font-medium">{down} Mbps</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Upload Speed</span>
                      <p className="text-sm font-medium">{up} Mbps</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Latency</span>
                      <p className="text-sm font-medium">{latency}ms</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">SNR Margin (Down)</span>
                      <p className="text-sm font-medium">8.2 dB</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">SNR Margin (Up)</span>
                      <p className="text-sm font-medium">12.4 dB</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Line Attenuation</span>
                      <p className="text-sm font-medium">22.5 dB</p>
                    </div>
                  </div>
                </div>

                {/* Connected Devices */}
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs font-medium block mb-2">Connected Devices (8)</span>
                  <div className="space-y-1.5">
                    {connectedDevices.map((cd) => (
                      <div key={cd.mac} className="flex items-center justify-between text-xs">
                        <span className="font-medium w-36">{cd.name}</span>
                        <span className="font-mono text-muted-foreground w-36">{cd.mac}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {cd.band}
                        </Badge>
                        <span className="font-mono text-muted-foreground">{cd.ip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => toast({ title: "Reboot queued", description: `${device.name} will reboot.` })}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Reboot Device
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => toast({ title: "Diagnostics running", description: "Results will appear shortly." })}
            >
              <Shield className="h-3 w-3 mr-1" /> Run Diagnostics
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => toast({ title: "Speed test started" })}
            >
              <Network className="h-3 w-3 mr-1" /> Speed Test
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs ml-auto"
              onClick={() => toast({ title: "Fault reported", description: `Ticket created for ${device.name}.`, variant: "destructive" })}
            >
              <XCircle className="h-3 w-3 mr-1" /> Report Fault
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
