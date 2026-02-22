import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — sin padding-left ya que el sidebar es drawer */}
      <div style={{ paddingTop: '64px' }}>
        <main
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
          className="p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;