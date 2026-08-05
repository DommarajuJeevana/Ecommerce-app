import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const USERS_KEY = "users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [loading, setLoading] = useState(false);

  const register = async ({ name, email, phone, password }) => {
    setLoading(true);

    const users =
      JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    // Check if email already exists
    const exists = users.find(
      (u) => u.email === email
    );

    if (exists) {
      setLoading(false);
      throw new Error("User already exists");
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      password,
      role: "customer",
    };

    users.push(newUser);

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(users)
    );

    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    setUser(newUser);

    setLoading(false);

    return newUser;
  };

  const login = async ({ email, password }) => {
    setLoading(true);

    const users =
      JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const found = users.find(
      (u) =>
        u.email === email &&
        u.password === password
    );

    if (!found) {
      setLoading(false);
      throw new Error("Invalid credentials");
    }

    localStorage.setItem(
      "user",
      JSON.stringify(found)
    );

    setUser(found);

    setLoading(false);

    return found;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};