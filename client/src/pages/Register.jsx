import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://ecommerce-app-otze.onrender.com/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      alert("Registered Successfully");

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <form
        onSubmit={submitHandler}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-3 mb-4 rounded"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 mb-4 rounded"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="w-full bg-blue-700 text-white py-3 rounded"
        >
          Register
        </button>

        <p className="mt-5 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-700"
          >
            Login
          </Link>
        </p>

      </form>

    </div>
  );
}

export default Register;