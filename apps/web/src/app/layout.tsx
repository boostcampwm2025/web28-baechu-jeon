import "./globals.css";
import Header from "../components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(new RegExp('(^|;)\\s*theme\\s*=\\s*([^;]+)'));var t=m?decodeURIComponent(m[2]):null;if(t==='light')document.documentElement.classList.add('light')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-page text-body flex h-screen flex-col overflow-hidden">
        <Header />
        <main className="no-scrollbar w-full flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
