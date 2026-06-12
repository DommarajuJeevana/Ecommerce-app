import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/reviews/${id}`);
      setReviews(data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const addToCart = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await API.post(
        "/cart",
        {
          productId: product._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      alert("Added To Cart");
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  const addToWishlist = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await API.post(
        "/wishlist",
        {
          productId: product._id,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      alert("Added To Wishlist");
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await API.post(
        `/reviews/${id}`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      alert("Review Added");

      setRating(5);
      setComment("");

      fetchReviews();
      fetchProduct();
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  if (!product) {
    return (
      <h2 className="text-center mt-10">
        Loading...
      </h2>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg bg-white"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>

          <p className="mt-5 text-gray-600">
            {product.description}
          </p>

          <p className="mt-5 text-3xl text-blue-700 font-bold">
            ₹{product.price}
          </p>

          <p className="mt-3">
            Category: {product.category}
          </p>

          <p className="mt-2">
            Stock: {product.stock}
          </p>

          <p className="mt-3 text-yellow-500 font-bold">
            ⭐ {product.rating?.toFixed(1)}
          </p>

          <p>{product.numReviews} Reviews</p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={addToCart}
              className="bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded font-semibold"
            >
              Add To Cart
            </button>

            <button
              onClick={addToWishlist}
              className="bg-blue-700 text-white px-6 py-3 rounded font-semibold"
            >
              Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">
          Add Review
        </h2>

        <form onSubmit={submitReview}>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="border p-3 w-full mb-3"
          >
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <textarea
            placeholder="Write Review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-3 w-full mb-3"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Submit Review
          </button>
        </form>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">
          Reviews
        </h2>

        {reviews.length === 0 ? (
          <p>No Reviews Yet</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white p-5 rounded shadow mb-4"
            >
              <h3 className="font-bold">
                {review.user?.name}
              </h3>

              <p className="text-yellow-500">
                ⭐ {review.rating}
              </p>

              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductDetails;