import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import Avatar from "./Avatar";
import { UsersIcon } from "./Icons";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });

      dispatch(addConnections(res?.data?.data || []));
    } catch (err) {
      console.error("Error fetching connections:", err);
      dispatch(addConnections([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // UI: skeleton cards while connections are loading (avoids flashing the empty state)
  if (loading) {
    return (
      <div className='max-w-5xl mx-auto my-10'>
        <PageHeader title='Connections' />
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((n) => (
            <div key={n} className='card bg-base-300 shadow-xl'>
              <div className='card-body items-center gap-3'>
                <div className='skeleton w-24 h-24 rounded-full'></div>
                <div className='skeleton h-5 w-2/3'></div>
                <div className='skeleton h-4 w-1/3'></div>
                <div className='skeleton h-4 w-full'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className='max-w-5xl mx-auto my-10'>
        <PageHeader title='Connections' />
        <EmptyState
          icon={<UsersIcon className='w-7 h-7' />}
          title='No Connections Found'
          message='Start exploring the feed and connect with other developers.'
          actionText='Go to feed'
          actionTo='/'
        />
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto my-10'>
      <PageHeader
        title='Connections'
        subtitle={`${connections.length} ${
          connections.length === 1 ? "connection" : "connections"
        }`}
      />

      {/* UI: responsive grid of cards styled like the login card */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {connections.map((connection, i) => (
          <div
            key={connection._id}
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            className='card bg-base-300 shadow-xl min-w-0 animate-card-in transition-transform duration-200 hover:-translate-y-1'>
            <div className='card-body items-center text-center min-w-0'>
              <Avatar
                src={connection.photoURL}
                firstName={connection.firstName}
                lastName={connection.lastName}
                className='w-24 h-24 ring-2 ring-primary ring-offset-2 ring-offset-base-300'
              />
              <h2 className='card-title mt-2 justify-center [overflow-wrap:anywhere]'>
                {connection.firstName} {connection.lastName}
              </h2>
              {(connection.age || connection.gender) && (
                <p className='text-sm opacity-70 capitalize flex-none'>
                  {[connection.age, connection.gender].filter(Boolean).join(" · ")}
                </p>
              )}
              {connection.about && (
                <p className='text-sm opacity-80 line-clamp-3 w-full [overflow-wrap:anywhere]'>
                  {connection.about}
                </p>
              )}

              {connection.skills?.length > 0 && (
                <div className='flex flex-wrap justify-center gap-2 mt-2 w-full'>
                  {connection.skills.map((skill, i) => (
                    <span key={i} className='badge badge-primary badge-outline h-auto max-w-full whitespace-normal break-words'>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connections;
