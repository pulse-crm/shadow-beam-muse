export interface CsvColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | undefined | null;
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = columns.map((c) => escape(c.header)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = c.accessor(row);
          return escape(raw === null || raw === undefined ? "" : String(raw));
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
