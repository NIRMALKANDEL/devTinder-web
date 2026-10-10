import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "../Icons";

// Added: accessible dialog built on the native <dialog> element (focus trap, Esc to
// close and focus return come from the browser). Styled with daisyUI's modal classes.
// Rendered into <body> so it never sits inside a draggable card or another dialog.
const Modal = ({ open, onClose, title, description, children, actions }) => {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return createPortal(
    <dialog
      ref={ref}
      className='modal modal-bottom sm:modal-middle'
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}>
      <div className='modal-box liquid-glass rounded-3xl p-6'>
        <div className='flex items-start gap-3'>
          <div className='flex-1 min-w-0'>
            <h2 id={titleId} className='text-lg font-bold'>
              {title}
            </h2>
            {description && <p className='text-sm opacity-70 mt-1'>{description}</p>}
          </div>
          <button type='button' className='btn btn-ghost btn-sm btn-circle' aria-label='Close' onClick={onClose}>
            <CloseIcon className='w-4 h-4' />
          </button>
        </div>
        <div className='mt-4'>{children}</div>
        {actions && <div className='modal-action mt-6'>{actions}</div>}
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button type='button' aria-label='Close' onClick={onClose}>
          close
        </button>
      </form>
    </dialog>,
    document.body
  );
};

export default Modal;
