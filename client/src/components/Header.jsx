import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';
import { cn } from '@/lib/utils';
import TrophyIcon from './icons/TrophyIcon';
import ProfileIcon from './icons/ProfileIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import SwordIcon from './icons/SwordIcon';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b",
      "bg-primary dark:bg-primary-dark",
      "border-primary-dark dark:border-primary"
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold text-white flex items-center gap-2">
              <SwordIcon className="w-6 h-6" color="white" />
              TaskQuest
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link
                to="/dashboard"
                className="text-white hover:text-primary-light transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className="text-white hover:text-primary-light transition-colors"
              >
                History
              </Link>
              <Link
                to="/achievements"
                className="text-white hover:text-primary-light transition-colors"
              >
                Achievements
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:block w-48">
                <ProgressBar
                  currentXP={user.total_xp}
                  currentLevel={user.current_level}
                />
              </div>
            )}
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-primary-light transition-colors p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {/* Desktop Profile Dropdown */}
            <div className="hidden md:block relative group">
              <button className="text-white hover:text-primary-light transition-colors flex items-center gap-2">
                <ProfileIcon className="w-4 h-4" color="white" />
                Profile
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-primary-dark border border-primary dark:border-primary-light rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-primary dark:text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-t-lg flex items-center gap-2"
                >
                  <ProfileIcon className="w-4 h-4" color="currentColor" />
                  Profile
                </Link>
                <Link
                  to="/achievements"
                  className="block px-4 py-3 text-primary dark:text-white hover:bg-primary-light dark:hover:bg-primary transition-colors flex items-center gap-2"
                >
                  <TrophyIcon className="w-4 h-4" color="currentColor" />
                  Achievements
                </Link>
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-4 py-3 text-primary dark:text-white hover:bg-primary-light dark:hover:bg-primary transition-colors flex items-center gap-2"
                >
                  {theme === 'light' ? (
                    <>
                      <MoonIcon className="w-4 h-4" color="currentColor" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <SunIcon className="w-4 h-4" color="currentColor" />
                      Light Mode
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-primary dark:text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-b-lg"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          />
          {/* Menu */}
          <div className="md:hidden fixed top-[73px] left-0 right-0 border-t border-primary-dark dark:border-primary bg-primary dark:bg-primary-dark z-50 max-h-[calc(100vh-73px)] overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-2">
            {user && (
              <div className="mb-4 pb-4 border-b border-primary-dark dark:border-primary">
                <ProgressBar
                  currentXP={user.total_xp}
                  currentLevel={user.current_level}
                />
              </div>
            )}
            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-lg flex items-center gap-2"
            >
              Dashboard
            </Link>
            <Link
              to="/history"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-lg flex items-center gap-2"
            >
              History
            </Link>
            <Link
              to="/achievements"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-lg flex items-center gap-2"
            >
              <TrophyIcon className="w-4 h-4" color="white" />
              Achievements
            </Link>
            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-lg flex items-center gap-2"
            >
              <ProfileIcon className="w-4 h-4" color="white" />
              Profile
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                closeMobileMenu();
              }}
              className="w-full text-left px-4 py-3 text-white hover:bg-primary-light dark:hover:bg-primary transition-colors rounded-lg flex items-center gap-2"
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className="w-4 h-4" color="white" />
                  Dark Mode
                </>
              ) : (
                <>
                  <SunIcon className="w-4 h-4" color="white" />
                  Light Mode
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors rounded-lg mt-2"
            >
              Log Out
            </button>
          </div>
        </div>
        </>
      )}
    </header>
  );
}


