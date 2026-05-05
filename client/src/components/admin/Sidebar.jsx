import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#1a1208] text-white flex flex-col">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-serif tracking-widest">MAVISH</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/admin/dashboard" className="block px-3 py-2 rounded hover:bg-white/10">
          Dashboard
        </Link>

        <Link to="/admin/products" className="block px-3 py-2 rounded hover:bg-white/10">
          Products
        </Link>

        <Link to="/admin/categories" className="block px-3 py-2 rounded hover:bg-white/10">
          Categories
        </Link>

        <Link to="/admin/orders" className="block px-3 py-2 rounded hover:bg-white/10">
          Orders
        </Link>

        <Link to="/admin/customers" className="block px-3 py-2 rounded hover:bg-white/10">
          Customers
        </Link>

        <Link to="/admin/banners" className="block px-3 py-2 rounded hover:bg-white/10">
          Banners
        </Link>

        <Link to="/admin/contacts" className="block px-3 py-2 rounded hover:bg-white/10">
          Contacts
        </Link>

        <Link to="/admin/settings" className="block px-3 py-2 rounded hover:bg-white/10">
          Settings
        </Link>
      </nav>
    </div>
  );
}