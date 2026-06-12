import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">

      <img
        src={product.image}
        alt={product.name}
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/300x300.png?text=No+Image";
        }}
        className="w-full h-64 object-contain bg-white"
      />

      <div className="p-4">
        <h2 className="font-bold text-lg">
          {product.name}
        </h2>

        <p className="text-gray-600 mt-2">
          {product.description}
        </p>

        <p className="text-blue-700 text-2xl font-bold mt-3">
          ₹{product.price}
        </p>

        <Link
          to={`/product/${product._id}`}
          className="block text-center mt-4 bg-yellow-400 hover:bg-yellow-500 py-2 rounded-md font-semibold"
        >
          View Product
        </Link>
      </div>

    </div>
  );
}

export default ProductCard;