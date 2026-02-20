import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout page="home" />} />
      <Route path="/menu" element={<Layout page="menu" />} />
      <Route path="/payment-failed" element={<Layout page="payment-failed" />} />
      <Route path="/orders" element={<Layout page="orders" />} />
      <Route path="*" element={<Layout page="home" />} />
    </Routes>
  );
};

export default App;
