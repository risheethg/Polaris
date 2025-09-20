import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};