import React from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import Success from "./pages/Success";

import VendorLogin from "./Vendor_Page/VendorLogin";
import VendorRegister from "./Vendor_Page/VendorRegister";
import VendorRegister2 from "./Vendor_Page/VendorRegister2";
import VendorDashboard from "./Vendor_Page/VendorDashboard";
import VendorProducts from "./Vendor_Page/VendorProducts";
import Order from "./Vendor_Page/Order";
import VendorProfile from "./Vendor_Page/VendorProfile";
import AddProduct from "./Vendor_Page/AddProduct"; 
import EditProduct from "./Vendor_Page/EditProduct";
import ViewProduct from "./Vendor_Page/ViewProduct";
import ViewOrder from "./Vendor_Page/ViewOrder";
import VendorClothes from "./Vendor_Page/VendorClothes";
import VendorMenApparel from "./Vendor_Page/VendorMenApparel";
import VendorWomenApparel from "./Vendor_Page/VendorWomenApparel";
import VendorMenAccessories from "./Vendor_Page/VendorMenAccessories";
import VendorMobile from "./Vendor_Page/VendorMobile";
import VendorHomeAppliance from "./Vendor_Page/VendorHomeAppliance";
import VendorWomenAccessories from "./Vendor_Page/VendorWomenAccessories";
import VendorGaming from "./Vendor_Page/VendorGaming";

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
        <Route path="/payment-success" element={<Success />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ThemeContextProvider>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                <Route path="/vendor-products" element={<VendorProducts />} />
                <Route path="/vendor-products/clothes" element={<VendorClothes />} />
                <Route path="/vendor-men-apparel" element={<VendorMenApparel />} />
                <Route path="/vendor-women-apparel" element={<VendorWomenApparel />} />
                <Route path="/vendor-products/mens-accessories" element={<VendorMenAccessories />} />
                <Route path="/vendor-products/mobiles-gadgets" element={<VendorMobile />} />
                <Route path="/vendor-products/home-appliances" element={<VendorHomeAppliance />} />
                <Route path="/vendor-products/womens-accessories" element={<VendorWomenAccessories />} />
                <Route path="/vendor-products/gaming" element={<VendorGaming />} />
                <Route path="/vendor-orders" element={<Order />} />
                <Route path="/vendor-profile" element={<VendorProfile />} />
                <Route path="/vendor-add-product" element={<AddProduct />} /> 
                <Route path="/vendor-edit-product" element={<EditProduct />} />
                <Route path="/vendor-view-product" element={<ViewProduct />} />
                <Route path="/vendor-view-order" element={<ViewOrder />} /> 
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
      <ToastContainer autoClose={3000} />
    </Router>
  );
};

export default App;
