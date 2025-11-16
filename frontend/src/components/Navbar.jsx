import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiShield } from 'react-icons/fi';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full px-8 py-5 flex justify-between items-center z-50 glass-blue border-b-2 border-cyan-500/40 shadow-lg">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 glow-blue shadow-lg">
          <FiShield className="text-white text-2xl" />
        </div>
        <span className="text-white font-bold text-3xl ml-2 tracking-tight">NeuroScan</span>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-10">
        <Link to="/" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
          Home
        </Link>
        <Link to="/dashboard" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
          Dashboard
        </Link>
        <Link to="/detection-modules" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
          Detection Modules
        </Link>
        <Link to="/test-suite" className="text-white hover:text-cyan-400 transition-colors font-medium text-lg">
          Test Suite
        </Link>

        {user ? (
          <button
            onClick={signOut}
            className="ml-4 btn-blue-outline px-5 py-2.5"
          >
            Sign Out
          </button>
        ) : (
          <Link
            to="/auth"
            className="ml-4 btn-blue-primary px-5 py-2.5"
          >
            Try Now
          </Link>
        )}
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 glass-blue border-b-2 border-cyan-500/40 py-5 px-8 shadow-xl">
          <div className="flex flex-col gap-5">
            <Link 
              to="/" 
              className="text-white hover:text-cyan-400 transition-colors py-2.5 font-medium text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className="text-white hover:text-cyan-400 transition-colors py-2.5 font-medium text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/detection-modules" 
              className="text-white hover:text-cyan-400 transition-colors py-2.5 font-medium text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Detection Modules
            </Link>
            <Link 
              to="/test-suite" 
              className="text-white hover:text-cyan-400 transition-colors py-2.5 font-medium text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Test Suite
            </Link>
            
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="mt-3 btn-blue-outline px-5 py-2.5"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="mt-3 btn-blue-outline px-5 py-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Try Now
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 