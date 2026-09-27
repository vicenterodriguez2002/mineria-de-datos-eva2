import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Minería de Datos | Santo Tomás',
  description: 'Presentación del proyecto de Minería de Datos — Santo Tomás',
  icons: {
    icon: '/logo-st.svg',
    apple: '/logo-st.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-st-darker"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
