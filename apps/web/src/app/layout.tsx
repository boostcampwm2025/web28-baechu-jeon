import "./globals.css";
import Header from "../components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col overflow-hidden">
        <Header />
        <main className="no-scrollbar w-full flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
