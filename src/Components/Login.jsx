import axios from "axios";
import { useState } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils /userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils /constants";

const Login = () => {
  const [emailId, setEmailID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // calling Login API
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailId,
          password,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(addUser(res.data));
      return navigate("/");
    } catch (err) {
      setError(err?.response?.data || "something went wrong ");
      console.error(err);
    }
  };

  return (
    <div className='flex justify-center my-10'>
      <div className='card bg-base-300 w-96 shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title justify-center'>Login</h2>
          <div>
            <label className='form-control w-full max-w-xs py-4'>
              <div className='label'>
                <span className='label-text'>Email ID</span>
              </div>
              <input
                type='text'
                value={emailId}
                className='input input-bordered w-full max-w-xs'
                onChange={(e) => setEmailID(e.target.value)}
              />
            </label>
            <label className='form-control w-full max-w-xs py-4 mt-5'>
              <div className='label'>
                <span className='label-text'>Password</span>
              </div>
              <input
                type='password'
                value={password}
                className='input input-bordered w-full max-w-xs'
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <p className='text-red-500'>{error}</p>
          <div className='card-actions justify-center mt-4'>
            <button className='btn btn-primary' onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
