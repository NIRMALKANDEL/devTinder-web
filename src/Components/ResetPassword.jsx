import axios from "axios";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";
import { PasswordInput } from "./Login";

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
    if (loading) return;
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
      setSuccess(res?.data?.message || "Password updated. You can now login.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset password"));
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-sm font-medium opacity-80";

  return (
    <div className='flex items-center justify-center min-h-[calc(100dvh-14rem)] py-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className='w-full max-w-md relative'>
        <div
          className='glow-backdrop -inset-6'
          aria-hidden='true'></div>
        <div className='liquid-glass relative rounded-3xl p-6 sm:p-8'>
          <h1 className='text-2xl font-bold tracking-tight'>Reset Password</h1>
          <p className='text-sm opacity-60 mt-1'>Choose a new password for your account.</p>

          {success ? (
            <div className='flex flex-col gap-4 mt-6'>
              <div role='status' className='alert alert-success alert-soft text-sm rounded-xl'>
                <span>{success}</span>
              </div>
              <Link to='/login' replace className='btn btn-primary w-full rounded-xl'>
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className='flex flex-col gap-4 mt-6'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='new-password' className={labelClass}>
                  New Password
                </label>
                <PasswordInput
                  id='new-password'
                  autoComplete='new-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className='text-xs opacity-60'>
                  8+ characters with an uppercase letter, a number and a symbol.
                </span>
              </div>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='confirm-new-password' className={labelClass}>
                  Retype New Password
                </label>
                <PasswordInput
                  id='confirm-new-password'
                  autoComplete='new-password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <div role='alert' className='alert alert-error alert-soft text-sm rounded-xl py-2.5'>
                  <span>{error}</span>
                </div>
              )}

              <button
                className='btn btn-primary w-full rounded-xl mt-1 shadow-lg transition-transform active:scale-[0.98]'
                disabled={loading}>
                {loading && <span className='loading loading-spinner loading-sm'></span>}
                {loading ? "Please wait..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className='text-sm text-center mt-6'>
            <Link to='/login' className='link link-primary link-hover font-medium'>
              Back to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
