import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequestById } from "../utils/requestSlice";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import Avatar from "./Avatar";
import { CheckIcon, CloseIcon, InboxIcon } from "./Icons";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // { id, status } while a review is in flight

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      dispatch(addRequests(res?.data?.data || []));
    } catch (err) {
      console.error(err);
      dispatch(addRequests([]));
    } finally {
      setLoading(false);
    }
  };

  const reviewRequest = async (status, requestId) => {
    setReviewing({ id: requestId, status });
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequestById(requestId));
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // UI: skeleton rows while requests are loading (avoids flashing the empty state)
  if (loading) {
    return (
      <div className='max-w-3xl mx-auto my-10'>
        <PageHeader title='Pending Requests' />
        <div className='flex flex-col gap-4'>
          {[1, 2].map((n) => (
            <div key={n} className='card bg-base-300 shadow-xl'>
              <div className='card-body flex-row items-center gap-4'>
                <div className='skeleton w-20 h-20 rounded-full shrink-0'></div>
                <div className='flex-1 flex flex-col gap-2'>
                  <div className='skeleton h-5 w-1/2'></div>
                  <div className='skeleton h-4 w-1/4'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className='max-w-3xl mx-auto my-10'>
        <PageHeader title='Requests' />
        <EmptyState
          icon={<InboxIcon className='w-7 h-7' />}
          title='No Requests Found'
          message="When someone is interested in you, they'll show up here."
          actionText='Go to feed'
          actionTo='/'
        />
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto my-10'>
      <PageHeader
        title='Pending Requests'
        subtitle={`${requests.length} waiting for your response`}
      />

      {/* UI: list of cards styled like the login card; stacks on mobile */}
      <div className='flex flex-col gap-4'>
        {requests.map((req, i) => {
          const user = req.fromUserId;
          const isReviewing = reviewing?.id === req._id;

          return (
            <div
              key={req._id}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              className='card bg-base-300 shadow-xl animate-card-in'>
              <div className='card-body flex-col sm:flex-row items-center gap-4 text-center sm:text-left'>
                <Avatar
                  src={user.photoURL}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  className='w-20 h-20 ring-2 ring-primary ring-offset-2 ring-offset-base-300'
                />
                <div className='flex-1 min-w-0'>
                  <h2 className='text-lg font-semibold'>
                    {user.firstName} {user.lastName}
                  </h2>
                  {(user.age || user.gender) && (
                    <p className='text-sm opacity-70 capitalize'>
                      {[user.age, user.gender].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {user.about && (
                    <p className='text-sm opacity-80 line-clamp-2 mt-1'>
                      {user.about}
                    </p>
                  )}
                </div>
                {/* UI: Reject = outlined/red, Accept = primary; disabled + spinner while reviewing */}
                <div className='card-actions justify-center shrink-0'>
                  <button
                    className='btn btn-outline btn-error gap-2 transition-transform active:scale-95'
                    disabled={isReviewing}
                    onClick={() => reviewRequest("rejected", req._id)}>
                    {isReviewing && reviewing.status === "rejected" ? (
                      <span className='loading loading-spinner loading-sm'></span>
                    ) : (
                      <CloseIcon className='w-4 h-4' />
                    )}
                    Reject
                  </button>
                  <button
                    className='btn btn-primary gap-2 transition-transform active:scale-95'
                    disabled={isReviewing}
                    onClick={() => reviewRequest("accepted", req._id)}>
                    {isReviewing && reviewing.status === "accepted" ? (
                      <span className='loading loading-spinner loading-sm'></span>
                    ) : (
                      <CheckIcon className='w-4 h-4' />
                    )}
                    Accept
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
