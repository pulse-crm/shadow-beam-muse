import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderTracker } from "./OrderTracker";
import type { Order } from "@/data/mock";
import { formatCurrency } from "@/lib/format";

export function OrdersPanel({ data }: { data: Order[] }) {
  return (
    <CollapsiblePanel title="Orders" icon={ShoppingCart} count={data.length}>
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Order ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <tr>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No orders
              </TableCell>
            </tr>
          )}
          {data.map((o) => (
            <React.Fragment key={o.id}>
              <TableRow>
                <TableCell className="py-2 font-mono text-xs">{o.id}</TableCell>
                <TableCell className="py-2 text-xs">{o.type}</TableCell>
                <TableCell className="py-2">
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="py-2 text-xs">{o.items.join(", ")}</TableCell>
                <TableCell className="py-2 text-right font-mono text-xs">
                  {formatCurrency(o.totalValue)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-accent/10">
                <TableCell colSpan={5} className="py-2 px-3">
                  <OrderTracker order={o} />
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </CollapsiblePanel>
  );
}
