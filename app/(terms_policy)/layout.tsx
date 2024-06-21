import Link from "next/link";
import Logo from "../_components/Logo";

export default function TermsPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-white p-2">
      <Link href="/">
        <Logo fillColor="black" />
      </Link>
      <main className="revert-tailwind">{children}</main>
    </div>
  );
}
