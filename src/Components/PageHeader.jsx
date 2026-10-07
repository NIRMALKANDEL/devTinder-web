import React from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon } from "./Icons";

// UI: consistent page title row with a back button.
// Goes back in history when possible, otherwise falls back to the feed ("/").
const PageHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  return (
    <div className='flex items-center gap-3 w-full mb-6'>
      <button
        type='button'
        onClick={goBack}
        aria-label='Go back'
        className='btn btn-ghost btn-circle btn-sm'>
        <BackIcon />
      </button>
      <div className='text-left'>
        <h1 className='font-bold text-2xl leading-tight'>{title}</h1>
        {subtitle && <p className='text-sm opacity-60'>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
