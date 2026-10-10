import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Budsy - Økonomioversikt',
  description: 'Privatøkonomi for Kenneth og Katarina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="bg-[#0f172a] text-slate-100 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
