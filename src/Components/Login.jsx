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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      navigate("/profile ");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center my-10'>
      <div className='card bg-base-300 w-96 shadow-xl'>
        <div className='card-body'>
          <h2 className='card-title justify-center'>
            {isLoginForm ? "Login" : "Sign Up"}
          </h2>

          <form onSubmit={isLoginForm ? handleLogin : handleSignup}>
            {!isLoginForm && (
              <>
                <label className='form-control w-full max-w-xs py-2'>
                  <div className='label'>
                    <span className='label-text'>First Name</span>
                  </div>
                  <input
                    type='text'
                    value={firstName}
                    required
                    className='input input-bordered w-full max-w-xs'
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>
                <label className='form-control w-full max-w-xs py-2'>
                  <div className='label'>
                    <span className='label-text'>Last Name</span>
                  </div>
                  <input
                    type='text'
                    value={lastName}
                    required
                    className='input input-bordered w-full max-w-xs'
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </label>
              </>
            )}

            <label className='form-control w-full max-w-xs py-2'>
              <div className='label'>
                <span className='label-text'>Email ID</span>
              </div>
              <input
                type='email'
                value={emailId}
                required
                className='input input-bordered w-full max-w-xs'
                onChange={(e) => setEmailID(e.target.value)}
              />
            </label>

            <label className='form-control w-full max-w-xs py-2'>
              <div className='label'>
                <span className='label-text'>Password</span>
              </div>
              <input
                type='password'
                value={password}
                required
                className='input input-bordered w-full max-w-xs'
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}

            <div className='card-actions justify-center mt-4'>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={loading}>
                {loading ? "Processing..." : isLoginForm ? "Login" : "Sign Up"}
              </button>
            </div>
          </form>

          <p
            className='cursor-pointer text-blue-500 mt-4 text-center'
            onClick={() => setIsLoginForm((prev) => !prev)}>
            {isLoginForm
              ? "New user? Sign up here"
              : "Existing user? Login here"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
