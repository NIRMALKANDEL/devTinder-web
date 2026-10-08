import axios from "axios";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

// Added: opened from the "Reset my password" link in the email
const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setSuccess(res?.data?.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center my-10'>
      <div className='card bg-base-300 w-full max-w-sm shadow-xl animate-card-in'>
        <div className='card-body'>
          <h2 className='card-title justify-center'>Reset Password</h2>

          <form onSubmit={handleReset}>
            <input
              type='password'
              className='input input-bordered w-full my-2'
              placeholder='New Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type='password'
              className='input input-bordered w-full my-2'
              placeholder='Retype New Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className='text-red-500 text-sm'>{error}</p>}
            {success && <p className='text-green-500 text-sm'>{success}</p>}

            <button className='btn btn-primary w-full mt-4' disabled={loading}>
              {loading ? "Please wait..." : "Reset Password"}
            </button>
          </form>

          <Link
            to='/login'
            className='text-blue-500 text-center mt-4 cursor-pointer hover:underline select-none'>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
