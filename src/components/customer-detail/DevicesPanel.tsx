import * as React from "react";
import { Smartphone } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { DataTable, type Column } from "@/components/ui/table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeviceManagementDialog } from "./DeviceManagementDialog";
import type { Device } from "@/data/mock";

export function DevicesPanel({ data }: { data: Device[] }) {
  const [selected, setSelected] = React.useState<Device | null>(null);
  const [open, setOpen] = React.useState(false);

  const columns: Column<Device>[] = [
    {
      key: "device",
      header: "Device",
      render: (d) => (
        <span className="text-xs font-medium text-primary underline-offset-2 hover:underline">
          {d.name}
        </span>
      ),
    },
    {
      key: "makemodel",
      header: "Make / Model",
      // Pulse devices have no separate make/model — surface type + serial as the
      // closest equivalent to project-files' "Make Model" cell.
      render: (d) => (
        <span className="text-xs">
          {d.type} <span className="font-mono text-muted-foreground">{d.serialNumber}</span>
        </span>
      ),
    },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
    {
      key: "installment",
      header: "Installment",
      // No installment plan data in pulse mock.
      render: () => <span className="text-xs font-mono">—</span>,
    },
    {
      key: "warranty",
      header: "Warranty",
      // No warranty-end data in pulse mock; show last-seen as the nearest
      // available device-lifecycle signal.
      render: (d) => <span className="text-xs">{d.lastSeen}</span>,
    },
  ];

  return (
    <>
      <CollapsiblePanel title="Device Management" icon={Smartphone} count={data.length}>
        <DataTable
          columns={columns}
          data={data}
          getRowKey={(d) => d.id}
          emptyMessage="No devices"
          onRowClick={(d) => {
            setSelected(d);
            setOpen(true);
          }}
        />
      </CollapsiblePanel>
      <DeviceManagementDialog device={selected} open={open} onOpenChange={setOpen} />
    </>
  );
}
