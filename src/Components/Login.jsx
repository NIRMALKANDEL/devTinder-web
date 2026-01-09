import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

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
        `${BASE_URL}/login`,
        { emailId, password },
        { withCredentials: true }
      );

      // ✅ ALWAYS dispatch actual user object
      dispatch(addUser(res?.data?.payload));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
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
        `${BASE_URL}/signup`,
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );

      dispatch(addUser(res?.data?.data));
      navigate("/profile");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
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
                <input
                  className='input input-bordered w-full my-2'
                  placeholder='First Name'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  className='input input-bordered w-full my-2'
                  placeholder='Last Name'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </>
            )}

            <input
              type='email'
              className='input input-bordered w-full my-2'
              placeholder='Email'
              value={emailId}
              onChange={(e) => setEmailID(e.target.value)}
            />

            <input
              type='password'
              className='input input-bordered w-full my-2'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className='text-red-500 text-sm'>{error}</p>}

            <button className='btn btn-primary w-full mt-4' disabled={loading}>
              {loading ? "Please wait..." : isLoginForm ? "Login" : "Sign Up"}
            </button>
          </form>

          <p
            className='text-blue-500 text-center mt-4 cursor-pointer'
            onClick={() => setIsLoginForm(!isLoginForm)}>
            {isLoginForm ? "New user? Sign up" : "Existing user? Login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
