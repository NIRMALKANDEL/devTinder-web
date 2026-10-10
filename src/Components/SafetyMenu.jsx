import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";
import { showToast } from "../utils/toastSlice";
import Modal from "./ui/Modal";
import { BanIcon, FlagIcon, MoreIcon } from "./Icons";

const REASONS = [
  { id: "spam", label: "Spam or scam" },
  { id: "harassment", label: "Harassment or hate" },
  { id: "fake_profile", label: "Fake profile" },
  { id: "inappropriate_content", label: "Inappropriate photo or content" },
  { id: "other", label: "Something else" },
];

// Added: "..." menu with Block and Report for another user's profile.
// onBlocked lets the parent remove the user from its list right away.
const SafetyMenu = ({ user, onBlocked, className = "" }) => {
  const dispatch = useDispatch();
  const [dialog, setDialog] = useState(null); // "block" | "report" | null
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const name = user.firstName || "this user";

  const close = () => {
    if (busy) return;
    setDialog(null);
    setError("");
  };

  const block = async () => {
    setBusy(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/user/block/${user._id}`, {}, { withCredentials: true });
      dispatch(showToast(`${name} is blocked.`));
      setDialog(null);
      onBlocked?.(user);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't block. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const report = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await axios.post(
        `${BASE_URL}/user/report/${user._id}`,
        { reason, details: details.trim(), block: alsoBlock },
        { withCredentials: true }
      );
      dispatch(showToast("Thanks, we've received your report."));
      setDialog(null);
      setReason("");
      setDetails("");
      if (alsoBlock) onBlocked?.(user);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't send the report. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={`dropdown dropdown-end ${className}`}>
        <div
          tabIndex={0}
          role='button'
          aria-label={`More options for ${name}`}
          onPointerDown={(e) => e.stopPropagation()}
          className='btn btn-circle liquid-glass border-0'>
          <MoreIcon className='w-4 h-4' />
        </div>
        <ul tabIndex={0} className='dropdown-content menu menu-sm bg-base-100 border border-hairline shadow-2xl rounded-2xl z-50 mt-2 w-48 p-2'>
          <li>
            <button type='button' className='rounded-lg gap-3' onClick={() => setDialog("report")}>
              <FlagIcon className='w-4 h-4' />
              Report
            </button>
          </li>
          <li>
            <button type='button' className='rounded-lg gap-3 text-error' onClick={() => setDialog("block")}>
              <BanIcon className='w-4 h-4' />
              Block
            </button>
          </li>
        </ul>
      </div>

      <Modal
        open={dialog === "block"}
        onClose={close}
        title={`Block ${name}?`}
        description="You won't see each other in the feed, requests, connections or chat. You can unblock them later in Settings."
        actions={
          <>
            <button type='button' className='btn btn-ghost rounded-xl' onClick={close} disabled={busy}>
              Cancel
            </button>
            <button type='button' className='btn btn-error rounded-xl' onClick={block} disabled={busy}>
              {busy && <span className='loading loading-spinner loading-xs'></span>}
              Block
            </button>
          </>
        }>
        {error && <p role='alert' className='text-sm text-error'>{error}</p>}
      </Modal>

      <Modal
        open={dialog === "report"}
        onClose={close}
        title={`Report ${name}`}
        description="Reports are private. We review every one.">
        <form onSubmit={report} className='flex flex-col gap-4'>
          <fieldset className='flex flex-col gap-2'>
            <legend className='text-sm font-medium mb-2'>What's wrong?</legend>
            {REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                  reason === r.id ? "border-primary tint-primary" : "border-hairline"
                }`}>
                <input
                  type='radio'
                  name='reason'
                  className='radio radio-primary radio-sm'
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                />
                <span className='text-sm'>{r.label}</span>
              </label>
            ))}
          </fieldset>
          <label className='flex flex-col gap-1.5'>
            <span className='text-sm font-medium'>Details (optional)</span>
            <textarea
              rows={3}
              maxLength={1000}
              className='textarea w-full rounded-xl'
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </label>
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='checkbox'
              className='checkbox checkbox-primary checkbox-sm'
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
            />
            <span className='text-sm'>Also block {name}</span>
          </label>
          {error && <p role='alert' className='text-sm text-error'>{error}</p>}
          <div className='flex justify-end gap-2'>
            <button type='button' className='btn btn-ghost rounded-xl' onClick={close} disabled={busy}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary rounded-xl' disabled={busy}>
              {busy && <span className='loading loading-spinner loading-xs'></span>}
              Send report
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SafetyMenu;
