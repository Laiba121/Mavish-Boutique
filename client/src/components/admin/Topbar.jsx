import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Bell, Search } from 'lucide-react';

export default function Topbar() {
  const dispatch = useDispatch();

  return (
    <header
      className="
        bg-white border-b border-gray-200
        px-4 sm:px-6
        py-3 sm:py-4
        flex items-center justify-between
        sticky top-0 z-30
        mt-[73px] lg:mt-0
      "
    >

      {/* Left */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Admin Panel
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Welcome back, Admin
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Search */}
        <button
          className="
            hidden sm:flex
            items-center justify-center
            w-10 h-10 rounded-full
            hover:bg-gray-100 transition
          "
        >
          <Search size={18} className="text-gray-600" />
        </button>

        {/* Notifications */}
        <button
          className="
            relative
            flex items-center justify-center
            w-10 h-10 rounded-full
            hover:bg-gray-100 transition
          "
        >
          <Bell size={18} className="text-gray-600" />

          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Logout */}
        <button
          onClick={() => dispatch(logout())}
          className="
            bg-black hover:bg-gray-800
            text-white
            px-3 sm:px-4
            py-2
            rounded-lg
            text-sm font-medium
            transition
          "
        >
          Logout
        </button>
      </div>
    </header>
  );
}