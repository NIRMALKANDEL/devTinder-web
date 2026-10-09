import React from "react";
import { FlameIcon } from "./Icons";

const Footer = () => {
  return (
    // UI: no longer position:fixed (it was covering page content); Body keeps it at the bottom
    <footer className='border-t border-hairline'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-70'>
        <p className='flex items-center gap-2 font-medium'>
          <FlameIcon className='w-4 h-4 text-primary' />
          DevTinder
        </p>
        <p>
          Copyright © {new Date().getFullYear()} DevTinder - All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
