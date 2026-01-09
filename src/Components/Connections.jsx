import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });

      dispatch(addConnections(res?.data?.data || []));
    } catch (err) {
      console.error("Error fetching connections:", err);
      dispatch(addConnections([]));
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections || connections.length === 0) {
    return (
      <h1 className='font-bold text-2xl text-center my-10'>
        No Connections Found
      </h1>
    );
  }

  return (
    <div className='flex flex-col items-center my-10 space-y-4'>
      <h1 className='font-bold text-2xl'>Connections</h1>

      {connections.map((connection) => (
        <div
          key={connection._id}
          className='p-4 border rounded-lg shadow-sm w-80 text-center'>
          <img
            src={connection.photoURL}
            alt={`${connection.firstName} ${connection.lastName}`}
            className='w-20 h-20 mx-auto rounded-full object-cover mb-2'
          />
          <h2 className='text-lg font-semibold'>
            {connection.firstName} {connection.lastName}
          </h2>
          <p className='text-sm text-gray-600 mb-1'>
            {connection.age} {connection.gender}
          </p>
          <p className='text-sm text-gray-600 mb-2'>{connection.about}</p>

          {connection.skills?.length > 0 && (
            <div className='flex flex-wrap justify-center gap-2 mt-2'>
              {connection.skills.map((skill, i) => (
                <span
                  key={i}
                  className='px-2 py-1 bg-gray-200 text-sm rounded-full'>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Connections;
