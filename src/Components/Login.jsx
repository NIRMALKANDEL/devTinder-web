import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

// Added: backend sends some errors as plain text and some as { message }
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data) {
    return data.replace(/^(ERROR:=|Error)\s*/, "");
  }
  return data?.message || fallback;
};

const Login = () => {
  const [emailId, setEmailID] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(false);
  // Added: "Forgot password?" view inside the same card
  const [isForgotForm, setIsForgotForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Added: result of the email verification link (?verified=true|false)
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // open the login form when coming back from the verification link
    if (verified === "true") {
      setIsLoginForm(true);
      setSuccess("Email verified! You can now login.");
    } else if (verified === "false") {
      setIsLoginForm(true);
      setError("Verification link is invalid or already used.");
    }
  }, [verified]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/signup`,
        { firstName, lastName, emailId, password, confirmPassword },
        { withCredentials: true }
      );

      // Changed: user must verify their email before logging in
      setSuccess(res?.data?.message);
      setPassword("");
      setConfirmPassword("");
      setIsLoginForm(true);
    } catch (err) {
      setError(getErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${BASE_URL}/forgot-password`, { emailId });
      setSuccess(res?.data?.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send reset link"));
    } finally {
      setLoading(false);
    }
  };

  const switchForm = (toLogin, toForgot = false) => {
    setIsLoginForm(toLogin);
    setIsForgotForm(toForgot);
    setError("");
    setSuccess("");
  };

  return (
    <div className='flex justify-center my-10'>
      {/* UI: w-96 -> w-full max-w-sm so the card fits small phones; same look otherwise */}
      <div className='card bg-base-300 w-full max-w-sm shadow-xl animate-card-in'>
        <div className='card-body'>
          <h2 className='card-title justify-center'>
            {isForgotForm ? "Forgot Password" : isLoginForm ? "Login" : "Sign Up"}
          </h2>

          <form
            onSubmit={
              isForgotForm
                ? handleForgotPassword
                : isLoginForm
                ? handleLogin
                : handleSignup
            }>
            {!isLoginForm && !isForgotForm && (
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

            {!isForgotForm && (
              <input
                type='password'
                className='input input-bordered w-full my-2'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {!isLoginForm && !isForgotForm && (
              <input
                type='password'
                className='input input-bordered w-full my-2'
                placeholder='Retype Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {isLoginForm && !isForgotForm && (
              <p
                className='text-blue-500 text-sm text-right cursor-pointer hover:underline select-none'
                onClick={() => switchForm(true, true)}>
                Forgot password?
              </p>
            )}

            {error && <p className='text-red-500 text-sm'>{error}</p>}
            {success && <p className='text-green-500 text-sm'>{success}</p>}

            <button className='btn btn-primary w-full mt-4' disabled={loading}>
              {loading
                ? "Please wait..."
                : isForgotForm
                ? "Send Reset Link"
                : isLoginForm
                ? "Login"
                : "Sign Up"}
            </button>
          </form>

          <p
            className='text-blue-500 text-center mt-4 cursor-pointer hover:underline select-none'
            onClick={() =>
              isForgotForm ? switchForm(true) : switchForm(!isLoginForm)
            }>
            {isForgotForm
              ? "Back to Login"
              : isLoginForm
              ? "New user? Sign up"
              : "Existing user? Login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
