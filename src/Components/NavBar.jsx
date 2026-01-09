import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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

  return (
    <div className='navbar bg-base-300 shadow-sm'>
      <div className='flex-1'>
        <Link to='/' className='btn btn-ghost text-xl'>
          DevTinder
        </Link>
      </div>

      {user && (
        <div className='flex items-center gap-4'>
          {/* Welcome Message */}
          <div className='form-control'>Welcome {user.firstName}</div>

          {/* Profile Dropdown */}
          <div className='dropdown dropdown-end mx-6'>
            <div
              tabIndex={0}
              role='button'
              aria-label='User menu'
              className='btn btn-ghost btn-circle avatar'>
              <div className='w-10 rounded-full'>
                <img alt='User Avatar' src={user.photoURL} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className='menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow'>
              <li>
                <Link
                  to='/profile'
                  className='justify-between hover:bg-gray-100 rounded-lg p-2'>
                  Profile <span className='badge'>New</span>
                </Link>
              </li>
              <li>
                <Link
                  to='/connections'
                  className='hover:bg-gray-100 rounded-lg p-2'>
                  Connections
                </Link>
              </li>
              <li>
                <Link
                  to='/requests'
                  className='hover:bg-gray-100 rounded-lg p-2'>
                  Requests
                </Link>
              </li>
              <li>
                <a
                  className='hover:bg-gray-100 rounded-lg p-2'
                  onClick={handelLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
