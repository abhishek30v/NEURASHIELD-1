import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-slate-950 to-blue-950 backdrop-blur-xl py-12 px-8 border-t-2 border-cyan-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-3xl font-extrabold tracking-wide">
              <FiShield className="mr-3 h-7 w-7 text-cyan-400" />
              NeuroScan
            </Link>
            <p className="text-cyan-200 mt-3 text-lg font-medium">
              Advanced Cybersecurity Threat Detection
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8">
            <Link to="/about" className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium text-base">
              About
            </Link>
            <Link to="/how-it-works" className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium text-base">
              How It Works
            </Link>
            <Link to="/pricing" className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium text-base">
              Pricing
            </Link>
            <Link to="/blog" className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium text-base">
              Blog
            </Link>
            <Link to="/contact" className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium text-base">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cyan-300 text-base font-medium mb-4 md:mb-0">
            © {currentYear} NeuroScan. All rights reserved.
          </p>
          
          <div className="flex gap-5">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-125">
              <FiGithub size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-125">
              <FiTwitter size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-125">
              <FiLinkedin size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 