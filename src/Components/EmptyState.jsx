import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

// UI: friendly empty / error state card.
// Changed: also accepts onAction for a button (e.g. "Try again") instead of a link.
const EmptyState = ({ icon, title, message, actionText, actionTo, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 26 }}
    className='surface w-full max-w-md mx-auto px-8 py-10 flex flex-col items-center text-center'>
    {icon && (
      <div className='relative mb-5'>
        <div
          className='absolute inset-0 rounded-2xl bg-primary blur-xl opacity-25'
          aria-hidden='true'></div>
        <div className='relative w-14 h-14 rounded-2xl liquid-glass flex items-center justify-center text-primary'>
          {icon}
        </div>
      </div>
    )}
    <h2 className='text-xl font-semibold'>{title}</h2>
    {message && <p className='opacity-70 text-sm mt-2 max-w-xs'>{message}</p>}
    {actionText && actionTo && (
      <Link to={actionTo} className='btn btn-primary rounded-full px-6 mt-6'>
        {actionText}
      </Link>
    )}
    {actionText && onAction && !actionTo && (
      <button type='button' onClick={onAction} className='btn btn-primary rounded-full px-6 mt-6'>
        {actionText}
      </button>
    )}
  </motion.div>
);

export default EmptyState;
