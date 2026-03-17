import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Target, BarChart2, Plus, LogOut } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { useAuthStore } from '../store/authStore';
import axiosInstance from '../api/axios';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch(e) {}
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={24} /> },
    { name: 'Transactions', path: '/transactions', icon: <List size={24} /> },
    { name: 'Budget', path: '/budget', icon: <Target size={24} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={24} /> },
  ];

  return (
    <div className="flex h-screen bg-navy-950 text-white font-sans overflow-hidden">
      
      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-navy-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
            SmartSpend
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeClass = isActive 
              ? 'bg-primary-900/30 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
              : 'text-gray-400 hover:text-white hover:bg-navy-800 border border-transparent';
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${activeClass}`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <span className="font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-sm truncate text-white">{user?.name}</span>
              <span className="text-xs text-gray-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-red-900/20 text-gray-400 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto pb-24 md:pb-8 pt-4 md:pt-8 md:px-8 no-scrollbar">
          <Outlet />
        </main>

        {/* Global Floating Action Button */}
        <div className="absolute bottom-[88px] right-6 md:bottom-8 md:right-8 z-30">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-primary-600 to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] transform transition hover:scale-105 active:scale-95"
          >
            <Plus className="text-white w-7 h-7 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 w-full h-20 bg-navy-900/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-20 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeColor = isActive ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] -translate-y-1' : 'text-gray-500 hover:text-gray-400';
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-16 h-full space-y-1 relative"
              >
                <div className={`transition-all duration-300 ${activeColor}`}>
                  {item.icon}
                </div>
                {isActive && (
                  <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(129,140,248,1)]"></span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Mobile Safe Area Filler */}
        <div className="md:hidden absolute bottom-0 w-full h-2 bg-navy-900 z-10"></div>
      </div>

      {/* Add Transaction Modal Slide-Up Sheet */}
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Layout;
