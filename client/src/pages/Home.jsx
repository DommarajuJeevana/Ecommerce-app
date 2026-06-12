import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard.jsx";

function Home() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchProducts(keyword, category);
  }, [keyword, category]);

  const fetchProducts = async (
    searchKeyword = "",
    searchCategory = ""
  ) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/products?keyword=${searchKeyword}&category=${searchCategory}`
      );

      setProducts(data.products);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white p-4 rounded shadow mb-8 flex flex-col md:flex-row gap-4">

        <input
          type="text"
          placeholder="Search Products..."
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
          className="border p-3 flex-1 rounded"
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="border p-3 rounded"
        >
          <option value="">
            All Categories
          </option>

          <option value="Flowers">
            Flowers
          </option>

          <option value="Bouquets">
            Bouquets
          </option>

          <option value="Plants">
            Plants
          </option>

          <option value="Gifts">
            Gifts
          </option>

          <option value="Mobiles">
            Mobiles
          </option>

          <option value="Electronics">
            Electronics
          </option>

          <option value="Fashion">
            Fashion
          </option>
        </select>

      </div>

      <h1 className="text-3xl font-bold mb-6">
        Latest Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;