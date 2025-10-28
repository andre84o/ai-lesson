import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Motorcycle Repair Search',
  description: 'En enkel sökmotor för att hitta verkstäder som kan reparera motorcyklar i utvalda europeiska städer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
