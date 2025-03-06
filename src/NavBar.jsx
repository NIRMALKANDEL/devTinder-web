import React from "react";

const NavBar = () => {
  return (
    <div className='navbar bg-base-300 shadow-sm'>
      <div className='flex-1'>
        <a className='btn btn-ghost text-xl'>DevTinder</a>
      </div>
      <div className='flex gap-2'>
        <div className='dropdown dropdown-end mx-6'>
          <div
            tabIndex={0}
            role='button'
            aria-label='User menu'
            className='btn btn-ghost btn-circle avatar'>
            <div className='w-10 rounded-full'>
              <img
                alt='User Avatar'
                src='https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className='menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow'>
            <li>
              <a className='justify-between hover:bg-gray-100 rounded-lg p-2'>
                Profile <span className='badge'>New</span>
              </a>
            </li>
            <li>
              <a className='hover:bg-gray-100 rounded-lg p-2'>Settings</a>
            </li>
            <li>
              <a className='hover:bg-gray-100 rounded-lg p-2'>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
