import * as React from "react";
import { cn } from "@/lib/cn";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  emptyMessage?: React.ReactNode;
}

export function DataTable<T>({ columns, data, getRowKey, onRowClick, emptyMessage = "No data" }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <tr>
          {columns.map((c) => (
            <TableHead
              key={c.key}
              className={cn(
                c.align === "right" && "text-right",
                c.align === "center" && "text-center",
                c.headerClassName
              )}
            >
              {c.header}
            </TableHead>
          ))}
        </tr>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <tr>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
              {emptyMessage}
            </TableCell>
          </tr>
        ) : (
          data.map((row, i) => (
            <TableRow
              key={getRowKey ? getRowKey(row, i) : i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? "cursor-pointer" : undefined}
            >
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  className={cn(
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className
                  )}
                >
                  {c.render
                    ? c.render(row)
                    : c.accessor
                      ? c.accessor(row)
                      : ((row as Record<string, React.ReactNode>)[c.key] ?? null)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
