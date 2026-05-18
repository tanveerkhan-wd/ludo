import { ReactNode } from 'react';
import AdminLayoutWrapper from './components/AdminLayoutWrapper';

export const metadata = {
  title: 'Admin Panel | Bajiger Ludo',
  description: 'Manage players, battles, and financial transactions for Bajiger Ludo.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
