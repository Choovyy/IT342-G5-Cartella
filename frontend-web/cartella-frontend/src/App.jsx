import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OAuthSuccess from "./pages/OAuthSuccess";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import MyPurchase from "./pages/MyPurchase";
import Notification from "./pages/Notification";
import Profile from "./pages/Profile";
import Clothes from "./pages/Clothes";
import HomeAppliance from "./pages/HomeAppliance";
import MenAccessories from "./pages/MenAccessories";
import WomenAccessories from "./pages/WomenAccessories";
import Mobile from "./pages/Mobile";
import Gaming from "./pages/Gaming";
import MenApparel from "./pages/MenApparel";
import WomenApparel from "./pages/WomenApparel";
import ThemeContextProvider from "./ThemeContext";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes (NO Theme Context) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated App Routes (With Theme Context) */}
        <Route
          path="/*"
          element={
            <ThemeContextProvider>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/category/clothes" element={<Clothes />} />
                <Route path="/category/home-appliances" element={<HomeAppliance />} />
                <Route path="/category/mens-accessories" element={<MenAccessories />} />
                <Route path="/category/womens-accessories" element={<WomenAccessories />} />
                <Route path="/category/mobiles-gadgets" element={<Mobile />} />
                <Route path="/category/gaming" element={<Gaming />} />
                <Route path="/category/clothes/mens-apparel" element={<MenApparel />} />
                <Route path="/category/clothes/womens-apparel" element={<WomenApparel />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/mypurchase" element={<MyPurchase />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </ThemeContextProvider>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
