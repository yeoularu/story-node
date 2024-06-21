"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LoginBtn() {
  const pathname = usePathname();

  return (
    <Button asChild variant="outline">
      <Link href={`/login?next=${pathname}`}>Sign in</Link>
    </Button>
  );
}
