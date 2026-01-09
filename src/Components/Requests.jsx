import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests } from "../utils/requestSlice";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      dispatch(addRequests(res?.data?.data || []));
    } catch (err) {
      console.error(err);
      dispatch(addRequests([]));
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests || requests.length === 0) {
    return (
      <h1 className='font-bold text-2xl text-center my-10'>
        No Requests Found
      </h1>
    );
  }

  return (
    <div className='flex flex-col items-center my-10 space-y-4'>
      <h1 className='font-bold text-2xl'>Pending Requests</h1>

      {requests.map((req) => {
        const user = req.fromUserId;

        return (
          <div
            key={req._id}
            className='p-4 border rounded-lg shadow-sm w-80 text-center'>
            <img
              src={user.photoURL}
              className='w-20 h-20 mx-auto rounded-full mb-2'
            />
            <h2 className='text-lg font-semibold'>
              {user.firstName} {user.lastName}
            </h2>
            <p className='text-sm text-gray-600'>
              {user.age} {user.gender}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
