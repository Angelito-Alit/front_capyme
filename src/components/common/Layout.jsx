import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div
        style={{ paddingTop: '64px' }}
        className="lg:pl-64"
      >
        <main
          style={{
            padding: '28px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
          className="sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;