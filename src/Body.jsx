import React from "react";
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";

const Body = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

export default Body;
