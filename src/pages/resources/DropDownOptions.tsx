import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kanban, Pencil, Globe, Share2, Trash } from "lucide-react";
import { useRedirect } from "react-admin";

export default function DropDownOptions({ resource }: { resource: any }) {
  const redirect = useRedirect();

  const shareData = {
    title: `Resource: ${resource?.title}`,
    text: `Check out this latest publication by ${resource?.author?.author_name} on Nurexi. It explores key insights into ${resource?.title}.`,
    url: `https://nurexi.com/resources/${resource?.slug}`,
  };

  async function onShare() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          alert(`Error: ${err.message}`);
        }
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Kanban
          className="p-1 cursor-pointer rounded-full text-white"
          size={24}
        />
      </DropdownMenuTrigger>

      {/* The dropdown content */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => redirect("edit", "resources", resource.id)}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </DropdownMenuItem>

        {resource.status === "published" && (
          <DropdownMenuItem className="cursor-pointer gap-2">
            <a
              href={`https://nurexi.com/resources/${resource.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 items-center"
            >
              <Globe className="h-3 w-3" />
              View live
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {resource.status === "published" && (
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-primary focus:text-primary"
            onClick={() => onShare()}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        )}

        {/* <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
          <Trash className="h-4 w-4 text-destructive" />
          <span>Delete</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
