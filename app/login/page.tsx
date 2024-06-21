import LoginBG from "./_components/LoginBG";
import LoginCard from "./_components/LoginCard";

export default async function Login({
  searchParams,
}: Readonly<{
  searchParams: { message: string; next: string };
}>) {
  return (
    <div className="dark relative h-dvh w-dvw overflow-hidden bg-black">
      <LoginBG />
      <LoginCard searchParams={searchParams} />
    </div>
  );
}
