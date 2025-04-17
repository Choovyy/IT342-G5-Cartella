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
import Address from "./pages/Address";
import Clothes from "./pages/Clothes";
import HomeAppliance from "./pages/HomeAppliance";
import MenAccessories from "./pages/MenAccessories";
import WomenAccessories from "./pages/WomenAccessories";
import Mobile from "./pages/Mobile";
import Gaming from "./pages/Gaming";
import MenApparel from "./pages/MenApparel";
import WomenApparel from "./pages/WomenApparel";
import ThemeContextProvider from "./ThemeContext";

import VendorLogin from "./Vendor_Page/VendorLogin";
import VendorRegister from "./Vendor_Page/VendorRegister";
import VendorRegister2 from "./Vendor_Page/VendorRegister2";
import VendorDashboard from "./Vendor_Page/VendorDashboard";
import Product from "./Vendor_Page/Product";
import Inventory from "./Vendor_Page/Inventory";
import Order from "./Vendor_Page/Order";
import VendorProfile from "./Vendor_Page/VendorProfile";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-register" element={<VendorRegister />} />
        <Route path="/vendor-register-step2" element={<VendorRegister2 />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ThemeContextProvider>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                <Route path="/vendor-products" element={<Product />} />
                <Route path="/vendor-inventory" element={<Inventory />} />
                <Route path="/vendor-orders" element={<Order />} />
                <Route path="/vendor-profile" element={<VendorProfile />} />
                <Route path="/category/clothes" element={<Clothes />} />
                <Route path="/category/home-appliances" element={<HomeAppliance />} />
                <Route path="/category/mens-accessories" element={<MenAccessories />} />
                <Route path="/category/womens-accessories" element={<WomenAccessories />} />
                <Route path="/category/mobiles-gadgets" element={<Mobile />} />
                <Route path="/category/gaming" element={<Gaming />} />
                <Route path="/category/clothes/mens-apparel" element={<MenApparel />} />
                <Route path="/category/clothes/womens-apparel" element={<WomenApparel />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/mypurchase" element={<MyPurchase />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/address" element={<Address />} />
              </Routes>
            </ThemeContextProvider>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
