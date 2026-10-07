import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { FlameIcon, InboxIcon, LogoutIcon, UserIcon, UsersIcon } from "./Icons";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handelLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/login");
    } catch (err) {
      // navigate("/login");
      console.error(err);
    }
  };

  // UI: closes the focus-based daisyUI dropdown after a menu item is clicked
  const closeMenu = () => document.activeElement?.blur();

  // UI: highlight the link for the current page
  const navLinkClass = ({ isActive }) =>
    `btn btn-ghost btn-sm gap-2 ${isActive ? "btn-active text-primary" : ""}`;
  const menuLinkClass = ({ isActive }) =>
    `rounded-lg p-2 gap-3 ${isActive ? "menu-active" : ""}`;

  return (
    // UI: sticky navbar so navigation is always reachable
    <div className='navbar bg-base-300 shadow-sm sticky top-0 z-30 px-2 sm:px-4'>
      <div className='flex-1'>
        <Link to='/' className='btn btn-ghost text-xl gap-2'>
          <FlameIcon className='w-6 h-6 text-primary' />
          DevTinder
        </Link>
      </div>

      {user && (
        <div className='flex items-center gap-2 sm:gap-4'>
          {/* UI: quick links to existing pages on larger screens */}
          <nav className='hidden md:flex items-center gap-1'>
            <NavLink to='/' end className={navLinkClass}>
              <FlameIcon className='w-4 h-4' />
              Feed
            </NavLink>
            <NavLink to='/connections' className={navLinkClass}>
              <UsersIcon className='w-4 h-4' />
              Connections
            </NavLink>
            <NavLink to='/requests' className={navLinkClass}>
              <InboxIcon className='w-4 h-4' />
              Requests
            </NavLink>
          </nav>

          {/* Welcome Message */}
          <div className='hidden sm:block text-sm'>
            Welcome <span className='font-semibold'>{user.firstName}</span>
          </div>

          {/* Profile Dropdown */}
          <div className='dropdown dropdown-end mr-2'>
            <div
              tabIndex={0}
              role='button'
              aria-label='User menu'
              className='btn btn-ghost btn-circle avatar transition-transform hover:scale-105'>
              <Avatar
                src={user.photoURL}
                firstName={user.firstName}
                lastName={user.lastName}
                className='w-10 h-10 ring-2 ring-primary ring-offset-2 ring-offset-base-300'
                textClass='text-sm'
              />
            </div>
            <ul
              tabIndex={0}
              onClick={closeMenu}
              className='menu menu-sm dropdown-content bg-base-100 rounded-box z-40 mt-3 w-56 p-2 shadow-xl'>
              <li className='menu-title sm:hidden'>
                Hi, {user.firstName}
              </li>
              <li>
                <NavLink to='/profile' className={menuLinkClass}>
                  <UserIcon className='w-4 h-4' />
                  Profile <span className='badge badge-primary badge-sm ml-auto'>New</span>
                </NavLink>
              </li>
              {/* UI: Feed link only needed in the dropdown on small screens */}
              <li className='md:hidden'>
                <NavLink to='/' end className={menuLinkClass}>
                  <FlameIcon className='w-4 h-4' />
                  Feed
                </NavLink>
              </li>
              <li>
                <NavLink to='/connections' className={menuLinkClass}>
                  <UsersIcon className='w-4 h-4' />
                  Connections
                </NavLink>
              </li>
              <li>
                <NavLink to='/requests' className={menuLinkClass}>
                  <InboxIcon className='w-4 h-4' />
                  Requests
                </NavLink>
              </li>
              <li aria-hidden='true' className='border-t border-base-300 my-1'></li>
              <li>
                <button
                  type='button'
                  className='rounded-lg p-2 gap-3 text-error'
                  onClick={handelLogout}>
                  <LogoutIcon className='w-4 h-4' />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
