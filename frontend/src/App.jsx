import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// 🌐 Pages
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import FindMaid from "./Pages/FindMaid";
import CreateJob from "./Pages/CreateJob";
import EmployerPostJob from "./Pages/EmployerPostJob";
import AdminDashboard from "./Pages/AdminDashboard";
import MaidManagement from "./Pages/MaidManagement";
import JobManagement from "./Pages/JobManagement";
import RegisterMaid from "./Pages/RegisterMaid";
import MaidJobs from "./Pages/MaidJobs";
import ViewProfile from "./Pages/ViewProfile";
import UserRegister from "./Pages/UserRegister";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";

// 🌟 Components
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* ✅ All main pages (with Navbar & Footer) */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
              <Footer />
            </>
          }
        />
        <Route
          path="/search-maid"
          element={
            <>
              <Navbar />
              <FindMaid />
              <Footer />
            </>
          }
        />
        <Route
          path="/create-job"
          element={
            <>
              <Navbar />
              <CreateJob />
              <Footer />
            </>
          }
        />
        <Route
          path="/post-jobs"
          element={
            <>
              <Navbar />
              <EmployerPostJob />
              <Footer />
            </>
          }
        />

        {/* ✅ Dashboard pages (also with Navbar & Footer) */}
        <Route
          path="/maid-manage"
          element={
            <>
              <Navbar />
              <MaidManagement />
              <Footer />
            </>
          }
        />
        <Route
          path="/job-manage"
          element={
            <>
              <Navbar />
              <JobManagement />
              <Footer />
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              <Navbar />
              <AdminDashboard />
              <Footer />
            </>
          }
        />
        <Route
          path="/admin-dash"
          element={
            <>
              <Navbar />
              <AdminDashboard />
              <Footer />
            </>
          }
        />

        {/* ✅ Register & Profile pages */}
        <Route
          path="/register-maid"
          element={
            <>
              <Navbar />
              <RegisterMaid />
              <Footer />
            </>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <>
              <Navbar />
              <MaidJobs />
              <Footer />
            </>
          }
        />
        <Route
          path="/view-profile/:wallet"
          element={
            <>
              <Navbar />
              <ViewProfile role="employer" />
              <Footer />
            </>
          }
        />
        <Route
          path="/employ-register"
          element={
            <>
              <Navbar />
              <UserRegister />
              <Footer />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          }
        />

        {/* 🚫 404 Page — No Navbar or Footer */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
