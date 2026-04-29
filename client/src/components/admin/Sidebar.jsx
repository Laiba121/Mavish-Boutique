import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#1a1208] text-white flex flex-col">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-serif tracking-widest">MEHRMA</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/admin/dashboard" className="block px-3 py-2 rounded hover:bg-white/10">
          Dashboard
        </Link>

        <Link to="/admin/products" className="block px-3 py-2 rounded hover:bg-white/10">
          Products
        </Link>

        <Link to="/admin/orders" className="block px-3 py-2 rounded hover:bg-white/10">
          Orders
        </Link>

        <Link to="/admin/users" className="block px-3 py-2 rounded hover:bg-white/10">
          Users
        </Link>
      </nav>
    </div>
  );
}