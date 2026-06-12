import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <Link
          to="/admin/products"
          className="bg-white p-8 rounded-lg shadow text-center font-bold text-xl"
        >
          Products
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white p-8 rounded-lg shadow text-center font-bold text-xl"
        >
          Orders
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-8 rounded-lg shadow text-center font-bold text-xl"
        >
          Users
        </Link>

      </div>

    </div>
  );
}

export default AdminDashboard;