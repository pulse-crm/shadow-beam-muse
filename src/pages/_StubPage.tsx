import * as React from "react";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";

interface StubPageProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  primaryAction?: { label: string; onClick?: () => void };
  sections?: { title: string; description?: string; body?: React.ReactNode }[];
  children?: React.ReactNode;
}

export function StubPage({ title, description, icon: Icon, primaryAction, sections = [], children }: StubPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        description={description}
        action={
          primaryAction ? (
            <Button onClick={primaryAction.onClick}>
              <Plus className="h-3.5 w-3.5" /> {primaryAction.label}
            </Button>
          ) : null
        }
      />
      {Icon && (
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {sections.map((s, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
            {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
          </CardHeader>
          <CardContent>{s.body}</CardContent>
        </Card>
      ))}
      {children}
    </div>
  );
}
