import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, 
  FiLayout, 
  FiShield, 
  FiActivity, 
  FiMenu, 
  FiX,
  FiLogOut,
  FiLogIn,
  FiUser
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/', icon: FiHome, label: 'Overview' },
    { path: '/dashboard', icon: FiLayout, label: 'Dashboard' },
    { path: '/detection-modules', icon: FiShield, label: 'Detection' },
    { path: '/test-suite', icon: FiActivity, label: 'Test Suite' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 glass-purple rounded-xl text-white hover:bg-purple-500/20 transition-all"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-70 sidebar-glass z-40 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-10 mt-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center glow-purple group-hover:scale-110 transition-transform">
                <FiShield className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  NeuroScan
                </h1>
                <p className="text-xs text-purple-300/60 font-mono">v2.0</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/50 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
                  }`}
                >
                  <Icon
                    className={`text-xl ${
                      active ? 'text-purple-400' : 'group-hover:text-purple-400'
                    } transition-colors`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="mt-auto pt-6 border-t border-purple-500/20">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-4 py-3 glass-purple rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <FiUser className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.email || 'User'}
                    </p>
                    <p className="text-xs text-purple-300/60">Logged in</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
                >
                  <FiLogOut className="text-xl group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 btn-purple-primary w-full justify-center"
              >
                <FiLogIn className="text-xl" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </aside>
    </>
  );
};

export default Sidebar;

