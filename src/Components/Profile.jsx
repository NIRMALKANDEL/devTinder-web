import React from "react";
import EditProfile from "./EditProfile";
import { useSelector } from "react-redux";

const Profile = () => {
  const user = useSelector((store) => store.user);
  // UI: spinner while the logged-in user is still being loaded (was: render nothing)
  if (!user)
    return (
      <div className='flex justify-center my-20'>
        <span className='loading loading-spinner loading-lg text-primary'></span>
      </div>
    );

  return (
    user && (
      <div>
        <EditProfile user={user} />
      </div>
    )
  );
};

export default Profile;
