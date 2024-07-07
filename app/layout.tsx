import { GeistSans } from "geist/font/sans";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import Providers from "./providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "story-node",
  description: "Create and share stories with folder structures, graph views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="h-auto min-h-dvh">
        <Providers>
          <NextTopLoader color="#16a249" showSpinner={false} />
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
