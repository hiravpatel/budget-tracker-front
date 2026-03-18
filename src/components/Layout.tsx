import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Target, BarChart2, Plus, LogOut, Lock, X } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { useAuthStore } from '../store/authStore';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch(e) {}
    logout();
    setProfileMenuOpen(false);
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axiosInstance.post('/auth/change-password', { newPassword });
      toast.success('Password changed! Logging out...');
      setTimeout(handleLogout, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={24} /> },
    { name: 'Transactions', path: '/transactions', icon: <List size={24} /> },
    { name: 'Budget', path: '/budget', icon: <Target size={24} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={24} /> },
  ];

  const currentPageName = navItems.find(i => i.path === location.pathname)?.name || 'SmartSpend';

  return (
    <div className="flex h-screen bg-navy-950 text-white font-sans overflow-hidden select-none">
      
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
          <button 
            onClick={() => setProfileMenuOpen(true)}
            className="flex items-center space-x-3 w-full p-2 mb-2 hover:bg-navy-800 rounded-2xl transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <span className="font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-sm truncate text-white">{user?.name}</span>
              <span className="text-xs text-gray-500 truncate">Settings</span>
            </div>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-red-900/20 text-gray-400 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 pt-safe bg-navy-950/80 backdrop-blur-xl border-b border-white/5 z-20">
          <div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider block">SmartSpend</span>
            <h1 className="text-xl font-bold text-white">{currentPageName}</h1>
          </div>
          <button 
            onClick={() => setProfileMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center p-[2px] shadow-lg shadow-primary-500/20"
          >
            <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
              <span className="font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto pb-24 md:pb-8 pt-4 md:pt-8 md:px-8 no-scrollbar scroll-smooth">
          <Outlet />
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-[88px] right-6 md:bottom-8 md:right-8 z-30 transition-transform active:scale-95 duration-200">
          <button 
            onClick={() => setIsTxModalOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-primary-600 to-purple-500 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(79,70,229,0.5)] transform"
          >
            <Plus className="text-white w-7 h-7 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Mobile Fixed Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-16 bg-navy-900/80 backdrop-blur-2xl border border-white/10 flex items-center justify-around px-4 rounded-3xl z-40 shadow-2xl">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeColor = isActive ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-gray-500';
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center h-full relative"
              >
                <div className={`transition-all duration-300 transform ${isActive ? '-translate-y-1' : ''} ${activeColor}`}>
                  {item.icon}
                </div>
                {isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(129,140,248,1)]"></span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Profile Sidebar/Modal Sheet */}
      {profileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:justify-center items-end md:items-center bg-navy-950/60 backdrop-blur-sm transition-opacity">
          <div className="w-full md:w-[400px] max-h-[80vh] bg-navy-900 border-t md:border border-white/10 rounded-t-[40px] md:rounded-[40px] p-8 pb-safe shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Profile</h2>
              <button onClick={() => { setProfileMenuOpen(false); setIsChangingPass(false); }} className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 p-[3px] mb-4">
                <div className="w-full h-full bg-navy-900 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">{user?.name}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>

            <div className="space-y-3">
              {!isChangingPass ? (
                <>
                  <button 
                    onClick={() => setIsChangingPass(true)}
                    className="flex items-center space-x-4 w-full p-4 bg-navy-850 hover:bg-navy-800 rounded-3xl transition-all"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center"><Lock size={20}/></div>
                    <span className="font-medium">Change Password</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-4 w-full p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-3xl transition-all"
                  >
                    <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center"><LogOut size={20}/></div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2 px-1">Enter New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-navy-850 border border-white/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsChangingPass(false)}
                      className="flex-1 py-4 bg-navy-850 rounded-3xl font-medium"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl font-bold shadow-lg shadow-primary-500/20"
                    >
                      Update & Logout
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal Slide-Up Sheet */}
      <AddTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />
    </div>
  );
};

export default Layout;
