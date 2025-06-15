
import React from 'react';

export const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
    <div className="text-center">
      <h1 className="text-2xl font-bold tracking-tight text-muted-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">Este módulo está en construcción.</p>
    </div>
  </div>
);
