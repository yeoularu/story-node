import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookPlus, ChevronDown, FilePlus, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateNewMenu() {
  return (
    <DropdownMenu>
      <Button variant="outline" className="px-2" asChild>
        <DropdownMenuTrigger>
          <Plus className="mr-2 h-5 w-5" />
          <ChevronDown className="h-5 w-5" />
        </DropdownMenuTrigger>
      </Button>
      <DropdownMenuContent>
        <Link href="/compose/story">
          <DropdownMenuItem>
            <BookPlus className="mr-2 h-5 w-5" />
            New story
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <Link href="/compose/post">
          <DropdownMenuItem>
            <FilePlus className="mr-2 h-5 w-5" />
            New post
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
