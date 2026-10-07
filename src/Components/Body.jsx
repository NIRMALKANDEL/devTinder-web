import React, { useEffect } from "react";
import NavBar from "./NavBar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  // UI: used only to re-trigger the page entry animation on route change
  const location = useLocation();

  const fetchUser = async () => {
    if (userData) return;

    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });

      // ✅ FIX: store only payload
      if (res?.data?.payload) {
        dispatch(addUser(res.data.payload));
      }
    } catch (err) {
      // ✅ FIX: correct axios error handling
      if (err?.response?.status === 401) {
        navigate("/login");
      }
      console.error("Profile fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    // UI: full-height column so the footer sits at the bottom without covering content
    <div className='min-h-screen flex flex-col bg-base-100'>
      <NavBar />
      <main
        key={location.pathname}
        className='flex-1 w-full max-w-6xl mx-auto px-4 animate-page-in'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
