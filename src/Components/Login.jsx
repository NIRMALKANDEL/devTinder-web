import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import { addUser } from "../utils/userSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";
import { EyeIcon, EyeOffIcon, FlameIcon, HeartIcon, InboxIcon, UsersIcon } from "./Icons";

// UI: password input with a show/hide toggle
export const PasswordInput = ({ value, onChange, placeholder, autoComplete, id }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className='relative'>
      <input
        id={id}
        type={visible ? "text" : "password"}
        className='input w-full rounded-xl pr-11'
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={onChange}
      />
      <button
        type='button'
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className='absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100'>
        {visible ? <EyeOffIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
      </button>
    </div>
  );
};

const FEATURES = [
  { Icon: HeartIcon, text: "Swipe through developers who aren't in your network yet" },
  { Icon: InboxIcon, text: "Get an email when someone is interested in you" },
  { Icon: UsersIcon, text: "Keep every connection, skill and portfolio in one place" },
];

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
      setSuccess("Email verified. You can now login.");
    } else if (verified === "false") {
      setIsLoginForm(true);
      setError("Verification link is invalid or already used.");
    }
  }, [verified]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
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
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
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
    if (loading) return;
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

  const formKey = isForgotForm ? "forgot" : isLoginForm ? "login" : "signup";
  const title = isForgotForm ? "Forgot Password" : isLoginForm ? "Login" : "Sign Up";
  const subtitle = isForgotForm
    ? "We'll email you a link to reset it."
    : isLoginForm
    ? "Welcome back. Pick up where you left off."
    : "Create your developer profile in a minute.";
  const labelClass = "text-sm font-medium opacity-80";

  return (
    // UI: split layout on wide screens — brand panel + glass auth card
    <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[calc(100dvh-14rem)] py-4'>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className='hidden lg:flex flex-col gap-8 text-left'>
        <div>
          <p className='inline-flex items-center gap-2 rounded-full tint-primary text-primary text-xs font-semibold px-3 py-1.5'>
            <FlameIcon className='w-3.5 h-3.5' />
            For developers
          </p>
          <h1 className='text-5xl xl:text-[3.5rem] font-extrabold tracking-tight leading-[1.04] mt-5 max-w-lg'>
            Meet developers <span className='text-gradient'>worth building with.</span>
          </h1>
          <p className='text-lg opacity-70 mt-5 max-w-md'>
            Share your skills, swipe through people, and turn a mutual interest into a connection.
          </p>
        </div>
        <ul className='flex flex-col gap-3 max-w-md'>
          {FEATURES.map(({ Icon, text }, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 260, damping: 26 }}
              className='surface flex items-center gap-3 px-4 py-3 rounded-2xl'>
              <span className='w-9 h-9 rounded-xl tint-primary text-primary flex items-center justify-center shrink-0'>
                <Icon className='w-[18px] h-[18px]' />
              </span>
              <span className='text-sm font-medium'>{text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* UI: w-full max-w-md so the card fits small phones */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className='w-full max-w-md mx-auto relative'>
        <div
          className='glow-backdrop -inset-6'
          aria-hidden='true'></div>
        <div className='liquid-glass relative rounded-3xl p-6 sm:p-8'>
          <AnimatePresence mode='wait' initial={false}>
            <motion.div
              key={formKey}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}>
              <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
              <p className='text-sm opacity-60 mt-1'>{subtitle}</p>

              <form
                className='flex flex-col gap-4 mt-6'
                onSubmit={
                  isForgotForm
                    ? handleForgotPassword
                    : isLoginForm
                    ? handleLogin
                    : handleSignup
                }>
                {!isLoginForm && !isForgotForm && (
                  <div className='grid grid-cols-2 gap-3'>
                    <label className='flex flex-col gap-1.5'>
                      <span className={labelClass}>First Name</span>
                      <input
                        className='input w-full rounded-xl'
                        autoComplete='given-name'
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </label>
                    <label className='flex flex-col gap-1.5'>
                      <span className={labelClass}>Last Name</span>
                      <input
                        className='input w-full rounded-xl'
                        autoComplete='family-name'
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </label>
                  </div>
                )}

                <label className='flex flex-col gap-1.5'>
                  <span className={labelClass}>Email</span>
                  <input
                    type='email'
                    className='input w-full rounded-xl'
                    placeholder='you@example.com'
                    autoComplete='email'
                    required
                    value={emailId}
                    onChange={(e) => setEmailID(e.target.value)}
                  />
                </label>

                {!isForgotForm && (
                  <div className='flex flex-col gap-1.5'>
                    <div className='flex items-center justify-between'>
                      <label htmlFor='password' className={labelClass}>
                        Password
                      </label>
                      {isLoginForm && (
                        <button
                          type='button'
                          className='link link-primary link-hover text-sm'
                          onClick={() => switchForm(true, true)}>
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <PasswordInput
                      id='password'
                      autoComplete={isLoginForm ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {!isLoginForm && (
                      <span className='text-xs opacity-60'>
                        8+ characters with an uppercase letter, a number and a symbol.
                      </span>
                    )}
                  </div>
                )}

                {!isLoginForm && !isForgotForm && (
                  <div className='flex flex-col gap-1.5'>
                    <label htmlFor='confirm-password' className={labelClass}>
                      Retype Password
                    </label>
                    <PasswordInput
                      id='confirm-password'
                      autoComplete='new-password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}

                {error && (
                  <div role='alert' className='alert alert-error alert-soft text-sm rounded-xl py-2.5'>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div role='status' className='alert alert-success alert-soft text-sm rounded-xl py-2.5'>
                    <span>{success}</span>
                  </div>
                )}

                <button
                  className='btn btn-primary w-full rounded-xl mt-1 shadow-lg transition-transform active:scale-[0.98]'
                  disabled={loading}>
                  {loading && <span className='loading loading-spinner loading-sm'></span>}
                  {loading
                    ? "Please wait..."
                    : isForgotForm
                    ? "Send Reset Link"
                    : isLoginForm
                    ? "Login"
                    : "Sign Up"}
                </button>
              </form>

              <p className='text-sm text-center mt-6 opacity-80'>
                {isForgotForm ? "Remembered it? " : isLoginForm ? "New user? " : "Existing user? "}
                <button
                  type='button'
                  className='link link-primary link-hover font-medium'
                  onClick={() =>
                    isForgotForm ? switchForm(true) : switchForm(!isLoginForm)
                  }>
                  {isForgotForm ? "Back to Login" : isLoginForm ? "Sign up" : "Login"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
