"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string) => void;
  userId: string;
  bucketName?: string;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelectImage,
  userId,
  bucketName = "community-images",
}: MediaLibraryDialogProps) {
  const supabase = createClient();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user's images from Supabase
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      // Get media records from database
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open, userId]);

  // Upload using dropzone
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Insert into media_library table
      const { error: insertError } = await supabase
        .from("media_library")
        .insert({
          user_id: userId,
          url: urlData.publicUrl,
          filename: file.name,
          size: file.size,
          mime_type: file.type,
        });

      if (insertError) throw insertError;

      toast.success("Image uploaded successfully!");
      await fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onOpenChange(false);
      setSelectedImage(null);
    }
  };

  const handleDeleteImage = async (item: MediaItem) => {
    const confirm = window.confirm(
      "This action is irreversible and will delete this image from all posts you have made. Are you sure you want to delete?",
    );
    if (!confirm) return;

    // Extract file path from URL
    const urlParts = item.url.split("/");
    const filePath = urlParts
      .slice(urlParts.indexOf("community-images") + 1)
      .join("/");

    try {
      // Delete from storage
      await supabase.storage.from(bucketName).remove([filePath]);

      // Delete from media_library table
      await supabase.from("media_library").delete().eq("id", item.id);

      toast.success("Image deleted");
      await fetchImages();
      if (selectedImage === item.url) setSelectedImage(null);
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const filteredItems = mediaItems.filter((item) =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "opacity-50 cursor-not-allowed",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : isDragActive ? (
                "Drop your image here"
              ) : (
                <>
                  Drag & drop an image here, or{" "}
                  <span className="text-primary underline underline-offset-4">
                    browse
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF, WEBP up to 10MB
            </p>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="shrink-0"
            >
              Clear
            </Button>
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "No images match your search"
                    : "No images uploaded yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                      selectedImage === item.url
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-primary/50",
                    )}
                    onClick={() => setSelectedImage(item.url)}
                  >
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(item);
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-white" />
                    </button>
                    {selectedImage === item.url && (
                      <div className="absolute inset-0 border-2 border-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-xs text-muted-foreground">
              {filteredItems.length} image
              {filteredItems.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSelectImage} disabled={!selectedImage}>
                Insert Image
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
