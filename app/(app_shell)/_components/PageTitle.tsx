export default function PageTitle({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <h1 className="text-3xl font-semibold tracking-tight text-muted-foreground m-4">
      {children}
    </h1>
  );
}
