"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibraryDialog } from "@/components/MedialibraryDialog";

interface CoverImageFieldProps {
  value?: string;
  onChange: (url: string) => void;
  userId: string;
  className?: string;
}

export function CoverImageField({
  value,
  onChange,
  userId,
  className,
}: CoverImageFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            Cover Image
          </p>
          <p className="text-xs text-muted-foreground">
            {value ? "Image selected" : "No image selected"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
          {value ? "Change" : "Select"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {value && (
        <div className="relative rounded-xl overflow-hidden border border-border h-40 group">
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <MediaLibraryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelectImage={(url: string) => {
          onChange(url);
          setDialogOpen(false);
        }}
        userId={userId}
      />
    </div>
  );
}
