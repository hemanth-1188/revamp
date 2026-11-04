import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Upload,
  Compass,
  Scissors,
  Package,
  Heart,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  MapPin,
  Wand2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRoute, navigateTo, user, savedDesignIds, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Role-based navigation items without deprecated Virtual Try-On / AI Revamp
  const navItems = !user
    ? []
    : user.role === 'tailor'
    ? [
        { label: 'Dashboard', route: '/tailor/dashboard', icon: Scissors, highlight: true },
        { label: 'My Orders', route: '/orders', icon: Package },
      ]
    : user.role === 'admin'
    ? [
        { label: 'Admin Overview', route: '/admin', icon: ShieldCheck, highlight: true },
        { label: 'Tailors Directory', route: '/tailors', icon: Scissors },
      ]
    : [
        { label: 'Dashboard', route: '/dashboard', icon: Compass },
        { label: 'Upload Inspiration', route: '/upload', icon: Upload, highlight: true },
        { label: 'Explore Styles', route: '/recommendations', icon: Sparkles },
        { label: '3D Studio', route: '/preview', icon: Compass },
        { label: 'Nearby Tailors', route: '/tailors', icon: Scissors },
        { label: 'My Orders', route: '/orders', icon: Package },
      ];

  const handleNav = (route: string) => {
    navigateTo(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDFAF9]/90 backdrop-blur-md border-b border-[#ECDAD4] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#B5563E] text-white flex items-center justify-center font-editorial text-2xl font-bold tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                R
              </div>
              <div>
                <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#2E2926] leading-none block">
                  REWEAVE
                </span>
                <span className="text-[10px] tracking-widest text-[#766B65] uppercase block font-medium">
                  Inspiration • 3D Fit • Tailoring
                </span>
              </div>
            </button>

            {/* User Location Tag */}
            {user && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2C3B9]/20 border border-[#ECDAD4] text-xs text-[#766B65]">
                <MapPin className="w-3.5 h-3.5 text-[#B5563E]" />
                <span className="font-medium text-[#2E2926] truncate max-w-[140px]">
                  {user.location.split(',')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;

              if (item.highlight) {
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleNav(item.route)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-[#B5563E] text-white'
                        : 'bg-[#B5563E]/10 text-[#B5563E] hover:bg-[#B5563E] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNav(item.route)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#F2C3B9]/30 text-[#B5563E] font-semibold'
                      : 'text-[#4A433E] hover:text-[#2E2926] hover:bg-[#F2C3B9]/20'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#766B65]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Dashboard Link Based on Role */}
            {user?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  currentRoute === '/admin'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                }`}
                title="Admin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin Portal</span>
              </button>
            ) : user?.role === 'tailor' ? (
              <button
                type="button"
                onClick={() => handleNav('/tailor/dashboard')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  currentRoute.startsWith('/tailor')
                    ? 'bg-[#B5563E] text-white border-[#B5563E] shadow-xs'
                    : 'bg-[#FAF2EE] text-[#B5563E] border-[#ECDAD4] hover:bg-[#F2C3B9]/30'
                }`}
                title="Tailor Dashboard"
              >
                <Scissors className="w-3.5 h-3.5 text-[#B5563E]" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('/dashboard')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  currentRoute === '/dashboard'
                    ? 'bg-[#2E2926] text-white border-[#2E2926]'
                    : 'bg-white text-[#766B65] border-[#ECDAD4] hover:text-[#2E2926]'
                }`}
                title="Customer Dashboard"
              >
                <Compass className="w-3.5 h-3.5 text-[#B5563E]" />
                <span>Dashboard</span>
              </button>
            )}

            {/* Saved Designs Pill (Customer only) */}
            {user?.role === 'customer' && (
              <button
                type="button"
                onClick={() => handleNav('/dashboard')}
                className="relative p-2.5 rounded-xl border border-[#ECDAD4] bg-white text-[#2E2926] hover:bg-[#F2C3B9]/20 transition-colors cursor-pointer"
                title="Saved Kurti Designs"
              >
                <Heart className="w-4 h-4 text-[#B5563E]" />
                {savedDesignIds.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#B5563E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {savedDesignIds.length}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F2C3B9]/20 border border-transparent hover:border-[#ECDAD4] transition-all cursor-pointer"
                >
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#ECDAD4]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden lg:inline text-xs font-medium text-[#2E2926]">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#ECDAD4] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                    <div className="px-4 py-2 border-b border-[#ECDAD4] space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#2E2926] truncate">{user.name}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'tailor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#766B65] truncate font-mono">{user.email}</p>
                    </div>

                    {user.role === 'customer' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleNav('/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-[#2E2926] hover:bg-[#F8EDE9] flex items-center gap-2 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#B5563E]" />
                          Customer Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNav('/orders')}
                          className="w-full text-left px-4 py-2 text-xs text-[#2E2926] hover:bg-[#F8EDE9] flex items-center gap-2 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5 text-[#B5563E]" />
                          My Orders
                        </button>
                      </>
                    )}

                    {user.role === 'tailor' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleNav('/tailor/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-[#2E2926] hover:bg-[#F8EDE9] flex items-center gap-2 cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5 text-[#B5563E]" />
                          Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNav('/orders')}
                          className="w-full text-left px-4 py-2 text-xs text-[#2E2926] hover:bg-[#F8EDE9] flex items-center gap-2 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5 text-[#B5563E]" />
                          My Orders
                        </button>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleNav('/admin')}
                        className="w-full text-left px-4 py-2 text-xs text-[#2E2926] hover:bg-[#F8EDE9] flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-[#ECDAD4] mt-1 pt-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('/login')}
                className="px-4 py-2 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-colors shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#2E2926] hover:bg-[#F2C3B9]/20 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#ECDAD4] bg-[#FDFAF9] px-4 pt-3 pb-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNav(item.route)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#B5563E] text-white'
                      : 'text-[#2E2926] hover:bg-[#F2C3B9]/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#2E2926] hover:bg-[#F2C3B9]/20"
              >
                <ShieldCheck className="w-4 h-4 text-[#B5563E]" />
                <span>Admin Management</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFAF9]/95 backdrop-blur-lg border-t border-[#ECDAD4] px-2 py-2 flex items-center justify-around shadow-lg">
        {user?.role === 'tailor' ? (
          <>
            <button
              type="button"
              onClick={() => handleNav('/tailor/dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute.startsWith('/tailor') ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Scissors className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => handleNav('/orders')}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/orders' ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>My Orders</span>
            </button>
          </>
        ) : user?.role === 'admin' ? (
          <>
            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/admin' ? 'text-purple-700 font-bold' : 'text-[#766B65]'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleNav('/tailors')}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/tailors' ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Scissors className="w-5 h-5" />
              <span>Tailors</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                currentRoute === '/' ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/recommendations')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                currentRoute === '/recommendations' ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/upload')}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-[#B5563E] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-[#B5563E] mt-1">Upload</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/tailors')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                currentRoute === '/tailors' ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Tailors</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/orders')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                currentRoute.startsWith('/orders') ? 'text-[#B5563E] font-bold' : 'text-[#766B65]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
};
