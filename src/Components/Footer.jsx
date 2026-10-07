import React from "react";

const Footer = () => {
  return (
    // UI: no longer position:fixed (it was covering page content); Body keeps it at the bottom
    <footer className='footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4 mt-10'>
      <aside>
        <p className='text-sm opacity-70'>
          Copyright © {new Date().getFullYear()} DevTinder - All rights reserved
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
