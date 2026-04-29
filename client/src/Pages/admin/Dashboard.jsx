import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Content Area */}
        <div className="p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-xl font-bold">120</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Products</h3>
              <p className="text-xl font-bold">45</p>
            </div>

            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-gray-500 text-sm">Users</h3>
              <p className="text-xl font-bold">80</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}