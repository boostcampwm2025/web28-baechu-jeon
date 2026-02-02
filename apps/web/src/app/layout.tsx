import "./globals.css";
import { cookies } from "next/headers";
import Header from "../components/layout/Header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  const isLight = theme === "light";

  return (
    <html lang="en" className={isLight ? "light" : ""} suppressHydrationWarning>
      <body className="bg-page text-body flex h-screen flex-col overflow-hidden">
        <Header />
        <main className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
