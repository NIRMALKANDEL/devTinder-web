import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils /constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils /connectionSlice";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      console.log(res.data.data);
      dispatch(addConnections(res?.data?.data));
    } catch (err) {
      console.error("Error occurred while fetching connections:", err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) {
    return (
      <h1 className='font-bold text-2xl text-center my-10'>
        No Connections Found
      </h1>
    );
  }

  return (
    <div className='flex flex-col items-center my-10 space-y-4'>
      <h1 className='font-bold text-2xl'>Connections</h1>
      {connections.map((connection) => {
        const {
          _id,
          firstName,
          lastName,
          photoURL,
          gender,
          skills,
          age,
          about,
        } = connection;

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
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
