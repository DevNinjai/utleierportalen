import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Budsy | Privatøkonomi',
  description: 'Budsjettering for Kenneth og Katarina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className="dark">
      <body className="bg-[#0f172a] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
