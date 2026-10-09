import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import { dismissToast } from "../utils/toastSlice";
import { AlertIcon, CheckIcon, CloseIcon } from "./Icons";

const TOAST_MS = 3500;

// Added: one toast; dismisses itself after a few seconds
const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();
  const isError = toast.type === "error";

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), TOAST_MS);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      role={isError ? "alert" : "status"}
      className='liquid-glass pointer-events-auto flex items-center gap-3 rounded-2xl pl-3 pr-2 py-2.5 w-full max-w-sm text-sm'>
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isError ? "bg-error text-error-content" : "bg-success text-success-content"
        }`}>
        {isError ? <AlertIcon className='w-4 h-4' /> : <CheckIcon className='w-4 h-4' />}
      </span>
      <p className='flex-1 font-medium leading-snug'>{toast.message}</p>
      <button
        type='button'
        aria-label='Dismiss'
        onClick={() => dispatch(dismissToast(toast.id))}
        className='btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100'>
        <CloseIcon className='w-3.5 h-3.5' />
      </button>
    </motion.div>
  );
};

// Added: toast stack, top-center below the navbar
const Toast = () => {
  const toasts = useSelector((store) => store.toasts);

  return (
    <div
      aria-live='polite'
      className='fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none'>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
