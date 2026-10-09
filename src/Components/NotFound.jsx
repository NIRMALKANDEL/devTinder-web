import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CompassIcon } from "./Icons";

// Added: shown for any URL that doesn't match a route (was a blank page)
const NotFound = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const canGoBack = window.history.state?.idx > 0;

  return (
    <div className='flex items-center justify-center min-h-[calc(100dvh-14rem)] py-8'>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className='surface w-full max-w-md px-8 py-12 flex flex-col items-center text-center'>
        <p className='font-mono text-sm text-primary font-medium tracking-widest'>404</p>
        <div className='relative my-6'>
          <div className='absolute inset-0 rounded-2xl bg-primary blur-xl opacity-25' aria-hidden='true'></div>
          <div className='relative w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center text-primary'>
            <CompassIcon className='w-8 h-8' />
          </div>
        </div>
        <h1 className='text-2xl font-bold'>This page doesn't exist</h1>
        <p className='text-sm opacity-70 mt-2 max-w-xs [overflow-wrap:anywhere]'>
          Nothing lives at <span className='font-mono'>{pathname}</span>. It may have moved, or the link is mistyped.
        </p>
        <div className='flex gap-3 mt-8'>
          {canGoBack && (
            <button type='button' onClick={() => navigate(-1)} className='btn rounded-full px-6 liquid-glass border-0'>
              Go back
            </button>
          )}
          <Link to='/' className='btn btn-primary rounded-full px-6'>
            Go to feed
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
