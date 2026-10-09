import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeRequestById } from "../utils/requestSlice";
import { removeConnections } from "../utils/connectionSlice";
import { showToast } from "../utils/toastSlice";
import { fetchRequests, getErrorMessage } from "../utils/api";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import Avatar from "./Avatar";
import SkillChips from "./SkillChips";
import { AlertIcon, CheckIcon, CloseIcon, InboxIcon } from "./Icons";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null); // { id, status } while a review is in flight
  const requested = useRef(false);

  // Changed: cached requests show instantly while a fresh copy loads in the background
  const loadRequests = useCallback(async () => {
    setError("");
    try {
      await fetchRequests(dispatch);
    } catch (err) {
      console.error(err);
      // Fixed: a failed request used to show "No Requests Found"
      setError(getErrorMessage(err, "Couldn't load your requests."));
    }
  }, [dispatch]);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (error && requests) dispatch(showToast(error, "error"));
  }, [error, requests, dispatch]);

  const reviewRequest = async (status, req) => {
    if (reviewing) return; // one review at a time (no double submits)
    setReviewing({ id: req._id, status });
    const name = req.fromUserId?.firstName || "them";
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${req._id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequestById(req._id));
      if (status === "accepted") {
        // Connections changed — reload them next time they are shown
        dispatch(removeConnections());
        dispatch(showToast(`You're now connected with ${name}.`));
      } else {
        dispatch(showToast(`Request from ${name} rejected.`));
      }
    } catch (err) {
      console.error(err);
      // Added: request already handled elsewhere — drop it from the list
      if (err?.response?.status === 404) {
        dispatch(removeRequestById(req._id));
        dispatch(showToast("That request is no longer available.", "error"));
      } else {
        dispatch(showToast(getErrorMessage(err, "Couldn't update the request."), "error"));
      }
    } finally {
      setReviewing(null);
    }
  };

  // UI: skeleton rows while requests are loading (avoids flashing the empty state)
  if (!requests && !error) {
    return (
      <div className='max-w-3xl mx-auto'>
        <PageHeader title='Pending Requests' />
        <div className='flex flex-col gap-4'>
          {[1, 2].map((n) => (
            <div key={n} className='bento-tile flex-row items-center gap-4'>
              <div className='skeleton w-16 h-16 rounded-2xl shrink-0'></div>
              <div className='flex-1 flex flex-col gap-2'>
                <div className='skeleton h-5 w-1/2'></div>
                <div className='skeleton h-4 w-1/4'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!requests) {
    return (
      <div className='max-w-3xl mx-auto'>
        <PageHeader title='Requests' />
        <EmptyState
          icon={<AlertIcon className='w-7 h-7' />}
          title="Couldn't load your requests"
          message={error}
          actionText='Try again'
          onAction={loadRequests}
        />
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <PageHeader
        title={requests.length ? "Pending Requests" : "Requests"}
        subtitle={requests.length ? `${requests.length} waiting for your response` : undefined}
      />

      <AnimatePresence mode='popLayout' initial={false}>
        {requests.length === 0 ? (
          <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState
              icon={<InboxIcon className='w-7 h-7' />}
              title='No requests right now'
              message="When someone is interested in you, they'll show up here."
              actionText='Go to feed'
              actionTo='/'
            />
          </motion.div>
        ) : (
          // UI: list of glass-edged rows; stacks on mobile, rows collapse smoothly when handled
          <motion.ul key='list' className='flex flex-col gap-4'>
            <AnimatePresence initial={true}>
              {requests.map((req, i) => {
                const user = req.fromUserId;
                const isReviewing = reviewing?.id === req._id;
                const meta = [user.age, user.gender].filter(Boolean).join(" · ");

                return (
                  <motion.li
                    key={req._id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: Math.min(i, 8) * 0.05, type: "spring", stiffness: 260, damping: 26 },
                    }}
                    exit={{
                      opacity: 0,
                      x: reviewing?.status === "rejected" ? -40 : 40,
                      transition: { duration: 0.22 },
                    }}
                    className='bento-tile sm:flex-row sm:items-center gap-4 text-center sm:text-left'>
                    <Avatar
                      src={user.photoURL}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      rounded='rounded-2xl'
                      className='w-16 h-16 mx-auto sm:mx-0'
                      textClass='text-xl'
                    />
                    <div className='flex-1 min-w-0'>
                      <h2 className='text-lg font-semibold [overflow-wrap:anywhere]'>
                        {user.firstName} {user.lastName}
                      </h2>
                      {meta && <p className='text-sm opacity-60 capitalize tabular'>{meta}</p>}
                      {user.about && (
                        <p className='text-sm opacity-80 line-clamp-2 mt-1 [overflow-wrap:anywhere]'>
                          {user.about}
                        </p>
                      )}
                      <SkillChips skills={user.skills} className='justify-center sm:justify-start mt-2' />
                    </div>
                    {/* UI: Reject = outlined/red, Accept = primary; disabled + spinner while reviewing */}
                    <div className='grid grid-cols-2 sm:flex gap-2 shrink-0'>
                      <button
                        type='button'
                        className='btn btn-outline btn-error rounded-full gap-2 transition-transform active:scale-95'
                        disabled={!!reviewing}
                        onClick={() => reviewRequest("rejected", req)}>
                        {isReviewing && reviewing.status === "rejected" ? (
                          <span className='loading loading-spinner loading-sm'></span>
                        ) : (
                          <CloseIcon className='w-4 h-4' />
                        )}
                        Reject
                      </button>
                      <button
                        type='button'
                        className='btn btn-primary rounded-full gap-2 transition-transform active:scale-95'
                        disabled={!!reviewing}
                        onClick={() => reviewRequest("accepted", req)}>
                        {isReviewing && reviewing.status === "accepted" ? (
                          <span className='loading loading-spinner loading-sm'></span>
                        ) : (
                          <CheckIcon className='w-4 h-4' />
                        )}
                        Accept
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Requests;
