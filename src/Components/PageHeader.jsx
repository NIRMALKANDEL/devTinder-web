import React from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon } from "./Icons";

// UI: consistent page title row with a back button.
// Goes back in history when possible, otherwise falls back to the feed ("/").
// Added: optional children render on the right (e.g. a search box).
const PageHeader = ({ title, subtitle, children }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  return (
    <div className='flex flex-col sm:flex-row sm:items-end gap-4 w-full mb-8'>
      <div className='flex items-center gap-3 flex-1 min-w-0'>
        <button
          type='button'
          onClick={goBack}
          aria-label='Go back'
          className='btn btn-circle btn-sm liquid-glass border-0 shrink-0 transition-transform hover:-translate-x-0.5'>
          <BackIcon className='w-4 h-4' />
        </button>
        <div className='text-left min-w-0'>
          <h1 className='font-bold text-3xl sm:text-4xl leading-tight tracking-tight'>{title}</h1>
          {subtitle && <p className='text-sm opacity-60 mt-0.5 tabular'>{subtitle}</p>}
        </div>
      </div>
      {children && <div className='w-full sm:w-auto'>{children}</div>}
    </div>
  );
};

export default PageHeader;
