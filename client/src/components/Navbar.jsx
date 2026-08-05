import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gradient-to-r from-ink-900 via-ink-700 to-brand-700 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-bold">
        🛒 E-Store
      </Link>

      <div className="flex gap-6 items-center">
        <Link className="hover:text-gray-300" to="/">
          Home
        </Link>

        <Link className="hover:text-gray-300" to="/cart">
          Cart
        </Link>

        {user && (
          <Link className="hover:text-gray-300" to="/orders">
            Orders
          </Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/admin-products">Products</Link>
            <Link to="/admin-orders">Admin</Link>
          </>
        )}

        {!user ? (
          <>
            <Link to="/login">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
                Register
              </button>
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-300">
              {user.name}
            </span>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;