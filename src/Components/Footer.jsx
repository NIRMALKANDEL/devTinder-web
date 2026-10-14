import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FlameIcon } from "./Icons";
import { isLoginPath } from "../utils/theme";

// Added: policy / information links (pages are public, see App.jsx)
const FOOTER_LINKS = [
  { to: "/terms-and-conditions", label: "Terms and Conditions" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/refund-and-cancellation", label: "Refund and Cancellation Policy" },
  { to: "/shipping-and-delivery", label: "Shipping and Delivery Policy" },
  { to: "/contact", label: "Contact Us" },
  { to: "/premium", label: "Premium" },
];

const Footer = () => {
  // Added: on phones the fixed bottom dock (shown when logged in) would cover the links,
  // so leave room for it — same condition Body uses to show MobileDock
  const userData = useSelector((store) => store.user);
  const { pathname } = useLocation();
  const dockVisible = userData && !isLoginPath(pathname);

  return (
    // UI: no longer position:fixed (it was covering page content); Body keeps it at the bottom
    <footer className={`border-t border-hairline ${dockVisible ? "pb-24 md:pb-0" : ""}`}>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4 text-sm opacity-70'>
        <nav aria-label='Policies and information'>
          <ul className='flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2'>
            {FOOTER_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className='hover:text-primary hover:underline underline-offset-4 transition-colors'>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-2'>
          <p className='flex items-center gap-2 font-medium'>
            <FlameIcon className='w-4 h-4 text-primary' />
            DevTinder
          </p>
          <p>
            Copyright © {new Date().getFullYear()} DevTinder - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
