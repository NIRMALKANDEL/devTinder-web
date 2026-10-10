import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";
import { showToast } from "../utils/toastSlice";
import { removeUser } from "../utils/userSlice";
import { removeFeed } from "../utils/feedSlice";
import { removeConnections } from "../utils/connectionSlice";
import { removeRequests } from "../utils/requestSlice";
import { resetChat } from "../utils/chatSlice";
import { disconnectSocket } from "../utils/socket";
import PageHeader from "./PageHeader";
import Avatar from "./Avatar";
import Modal from "./ui/Modal";
import { ThemePanel } from "./ThemePicker";
import { BanIcon, EyeIcon, EyeOffIcon, PaletteIcon, SettingsIcon, TrashIcon } from "./Icons";

const tile = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, type: "spring", stiffness: 260, damping: 26 } }),
};

const PasswordInput = ({ id, label, value, onChange, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <label htmlFor={id} className='flex flex-col gap-1.5'>
      <span className='text-sm font-medium opacity-80'>{label}</span>
      <span className='relative'>
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className='input w-full rounded-xl pr-11'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type='button'
          className='absolute right-1 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle'
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}>
          {show ? <EyeOffIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
        </button>
      </span>
    </label>
  );
};

// Added: settings page — theme, password, blocked users, delete account
const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/blocked`, { withCredentials: true })
      .then((res) => setBlocked(res.data.data))
      .catch(() => setBlocked([]));
  }, []);

  const unblock = async (user) => {
    try {
      await axios.delete(`${BASE_URL}/user/block/${user._id}`, { withCredentials: true });
      setBlocked((list) => list.filter((u) => u._id !== user._id));
      // Unblocked people may show up in the feed again
      dispatch(removeFeed());
      dispatch(showToast(`${user.firstName} is unblocked.`));
    } catch (err) {
      dispatch(showToast(getErrorMessage(err, "Couldn't unblock."), "error"));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (!oldPassword || !newPassword) {
      setPwError("Enter your current and new password.");
      return;
    }
    setPwBusy(true);
    try {
      await axios.put(`${BASE_URL}/profile/password`, { oldPassword, newPassword }, { withCredentials: true });
      setOldPassword("");
      setNewPassword("");
      dispatch(showToast("Password changed. Other devices have been logged out."));
    } catch (err) {
      setPwError(getErrorMessage(err, "Couldn't change the password."));
    } finally {
      setPwBusy(false);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await axios.delete(`${BASE_URL}/profile`, { data: { password: deletePassword }, withCredentials: true });
      disconnectSocket();
      dispatch(removeUser());
      dispatch(removeFeed());
      dispatch(removeConnections());
      dispatch(removeRequests());
      dispatch(resetChat());
      dispatch(showToast("Your account has been deleted."));
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Couldn't delete the account."));
      setDeleteBusy(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto'>
      <PageHeader title='Settings' subtitle='Theme, security and privacy' />

      <div className='grid gap-5'>
        <motion.section custom={0} variants={tile} initial='hidden' animate='show' className='bento-tile' aria-labelledby='theme-title'>
          <h2 id='theme-title' className='flex items-center gap-2 font-semibold text-lg'>
            <PaletteIcon className='w-5 h-5 text-primary' />
            Theme
          </h2>
          <p className='text-sm opacity-60 -mt-1'>Changes apply to the whole app right away.</p>
          <ThemePanel />
        </motion.section>

        <motion.section custom={1} variants={tile} initial='hidden' animate='show' className='bento-tile' aria-labelledby='pw-title'>
          <h2 id='pw-title' className='flex items-center gap-2 font-semibold text-lg'>
            <SettingsIcon className='w-5 h-5 text-primary' />
            Change password
          </h2>
          <form onSubmit={changePassword} className='grid sm:grid-cols-2 gap-4' noValidate>
            <PasswordInput id='old-pw' label='Current password' value={oldPassword} onChange={setOldPassword} autoComplete='current-password' />
            <PasswordInput id='new-pw' label='New password' value={newPassword} onChange={setNewPassword} autoComplete='new-password' />
            <p className='text-xs opacity-60 sm:col-span-2 -mt-2'>
              8+ characters with an uppercase letter, a number and a symbol. Other devices will be logged out.
            </p>
            {pwError && (
              <p role='alert' className='text-sm text-error sm:col-span-2'>
                {pwError}
              </p>
            )}
            <div className='sm:col-span-2'>
              <button type='submit' className='btn btn-primary rounded-xl' disabled={pwBusy}>
                {pwBusy && <span className='loading loading-spinner loading-xs'></span>}
                Update password
              </button>
            </div>
          </form>
        </motion.section>

        <motion.section custom={2} variants={tile} initial='hidden' animate='show' className='bento-tile' aria-labelledby='blocked-title'>
          <h2 id='blocked-title' className='flex items-center gap-2 font-semibold text-lg'>
            <BanIcon className='w-5 h-5 text-primary' />
            Blocked users
          </h2>
          {!blocked ? (
            <div className='skeleton h-12 w-full'></div>
          ) : blocked.length === 0 ? (
            <p className='text-sm opacity-60'>You haven't blocked anyone.</p>
          ) : (
            <ul className='flex flex-col divide-y divide-[var(--hairline)]'>
              {blocked.map((u) => (
                <li key={u._id} className='flex items-center gap-3 py-2.5'>
                  <Avatar src={u.photoURL} firstName={u.firstName} lastName={u.lastName} className='w-10 h-10' textClass='text-sm' />
                  <span className='flex-1 font-medium truncate'>
                    {u.firstName} {u.lastName}
                  </span>
                  <button type='button' className='btn btn-sm btn-ghost rounded-xl' onClick={() => unblock(u)}>
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        <motion.section
          custom={3}
          variants={tile}
          initial='hidden'
          animate='show'
          className='bento-tile !border-[color-mix(in_oklab,var(--color-error)_40%,transparent)]'
          aria-labelledby='danger-title'>
          <h2 id='danger-title' className='flex items-center gap-2 font-semibold text-lg text-error'>
            <TrashIcon className='w-5 h-5' />
            Delete account
          </h2>
          <p className='text-sm opacity-70'>
            Permanently deletes your profile, connections, requests and messages. This can't be undone.
          </p>
          <div>
            <button type='button' className='btn btn-error btn-outline rounded-xl' onClick={() => setDeleteOpen(true)}>
              Delete my account
            </button>
          </div>
        </motion.section>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => !deleteBusy && setDeleteOpen(false)}
        title='Delete your account?'
        description='Enter your password to confirm. Everything will be removed and you will be logged out.'>
        <form onSubmit={deleteAccount} className='flex flex-col gap-4'>
          <PasswordInput id='delete-pw' label='Password' value={deletePassword} onChange={setDeletePassword} autoComplete='current-password' />
          {deleteError && (
            <p role='alert' className='text-sm text-error'>
              {deleteError}
            </p>
          )}
          <div className='flex justify-end gap-2'>
            <button type='button' className='btn btn-ghost rounded-xl' onClick={() => setDeleteOpen(false)} disabled={deleteBusy}>
              Cancel
            </button>
            <button type='submit' className='btn btn-error rounded-xl' disabled={deleteBusy || !deletePassword}>
              {deleteBusy && <span className='loading loading-spinner loading-xs'></span>}
              Delete forever
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
