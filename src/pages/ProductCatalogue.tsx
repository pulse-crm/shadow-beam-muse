import * as React from "react";
import { Search, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { cn } from "@/lib/cn";
import { products } from "@/data/mock";

const categories = ["Voice", "Broadband", "Bundle", "Equipment", "Add-on", "Enterprise"];

export default function ProductCatalogue() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Product Catalogue</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            className="pl-8 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    p.category === "Enterprise"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-white text-foreground border-border"
                  )}
                >
                  {p.category}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{p.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
              <p className="text-lg font-bold text-primary">
                £{p.price.toFixed(2)}
                <span className="text-xs text-muted-foreground font-normal">/mo</span>
              </p>
              {p.features && p.features.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                  {p.features.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{p.features.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No products match your search.
        </p>
      )}
    </div>
  );
}
