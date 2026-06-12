import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link
          to="/"
          className="text-2xl font-bold"
        >
          ShopSphere
        </Link>

        <div className="flex items-center gap-8">

          {/* ADMIN NAVBAR */}
          {userInfo?.role === "admin" && (
            <>
              <Link
                to="/admin/products"
                className="hover:text-yellow-300"
              >
                Products
              </Link>

              <Link
                to="/admin/orders"
                className="hover:text-yellow-300"
              >
                Orders
              </Link>

              <Link
                to="/admin/users"
                className="hover:text-yellow-300"
              >
                Users
              </Link>
            </>
          )}

          {/* USER NAVBAR */}
          {userInfo?.role === "user" && (
            <>
              <Link
                to="/wishlist"
                className="hover:text-yellow-300"
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="hover:text-yellow-300"
              >
                Cart
              </Link>

              <Link
                to="/orders"
                className="hover:text-yellow-300"
              >
                Orders
              </Link>
            </>
          )}

          {/* GUEST */}
          {!userInfo && (
            <>
              <Link
                to="/login"
                className="bg-green-500 px-4 py-2 rounded"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-yellow-500 px-4 py-2 rounded text-black"
              >
                Register
              </Link>
            </>
          )}

          {/* LOGGED IN */}
          {userInfo && (
            <>
              <span className="font-bold">
                {userInfo.name}
              </span>

              <button
                onClick={logoutHandler}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;