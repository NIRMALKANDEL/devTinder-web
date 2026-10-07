import React from "react";
import { Link } from "react-router-dom";

// UI: friendly empty state card, styled like the login card
const EmptyState = ({ icon, title, message, actionText, actionTo }) => (
  <div className='card bg-base-300 w-full max-w-sm shadow-xl mx-auto animate-card-in'>
    <div className='card-body items-center text-center'>
      {icon && (
        <div className='w-14 h-14 rounded-full bg-base-100 flex items-center justify-center text-primary mb-2'>
          {icon}
        </div>
      )}
      <h2 className='card-title'>{title}</h2>
      {message && <p className='opacity-70 text-sm'>{message}</p>}
      {actionText && actionTo && (
        <div className='card-actions mt-4'>
          <Link to={actionTo} className='btn btn-primary'>
            {actionText}
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default EmptyState;
