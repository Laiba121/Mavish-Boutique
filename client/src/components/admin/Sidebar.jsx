import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Grid2X2,
  ShoppingBag,
  Users,
  Image,
  Mail,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: Package,
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: Grid2X2,
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Banners',
      path: '/admin/banners',
      icon: Image,
    },
    {
      name: 'Contacts',
      path: '/admin/contacts',
      icon: Mail,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.avif"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />

          <div>
            <h2 className="text-black text-lg font-serif tracking-[0.25em] leading-none">
              MAVISH
            </h2>

            <p className="text-[10px] text-gray-500 mt-1">
              ADMIN PANEL
            </p>
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="text-black"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-full w-72 sm:w-64
          bg-white text-black
          border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >

        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/images/logo1.png"
              alt="Logo"
              className="w-11 h-11 object-contain border border-gray-300"
            />

            <div>
              <h2 className="text-lg text-black font-serif tracking-[0.25em] leading-none">
                MAVISH
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-black"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3
                  px-4 py-3 rounded-xl
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    active
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }
                `}
              >
                <Icon size={18} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-100 rounded-xl p-3">
            <p className="text-xs text-gray-500">
              Logged in as
            </p>

            <p className="text-sm font-semibold mt-1 text-black">
              Administrator
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}