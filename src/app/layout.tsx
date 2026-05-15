import './globals.css';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased dark">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
