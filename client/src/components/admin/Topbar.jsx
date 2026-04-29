import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

export default function Topbar() {
  const dispatch = useDispatch();

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-700">
        Admin Panel
      </h2>

      <button
        onClick={() => dispatch(logout())}
        className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}