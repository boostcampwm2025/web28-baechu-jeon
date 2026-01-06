import "./globals.css";
import Header from "../components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
