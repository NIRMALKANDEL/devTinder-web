import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils /constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequests } from "../utils /requestSlice";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      console.log(res.data.data);
      dispatch(addRequests(res?.data?.data));
    } catch (err) {
      console.error("Error occurred while fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return null;

  if (requests.length === 0) {
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
        const {
          _id,
          firstName,
          lastName,
          photoURL,
          gender,
          skills,
          age,
          about,
        } = req.fromUserId; // ✅ populated sender details

        return (
          <div
            key={_id}
            className='p-4 border rounded-lg shadow-sm w-80 text-center'>
            <img
              src={photoURL}
              alt={`${firstName} ${lastName}`}
              className='w-20 h-20 mx-auto rounded-full object-cover mb-2'
            />
            <h2 className='text-lg font-semibold'>
              {firstName} {lastName}
            </h2>
            <p className='text-sm text-gray-600 mb-1'>
              {age} {gender}
            </p>
            <p className='text-sm text-gray-600 mb-2'>{about}</p>
            {skills && skills.length > 0 && (
              <div className='flex flex-wrap justify-center gap-2 mt-2'>
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className='px-2 py-1 bg-gray-200 text-sm rounded-full'>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className='flex justify-center gap-4 mt-4'>
              <button className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600'>
                Accept
              </button>
              <button className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'>
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
