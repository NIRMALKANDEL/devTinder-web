import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";

import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { CloseIcon, HeartIcon } from "./Icons";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoURL, age, gender, about } = user;
  const dispatch = useDispatch();
  const [sending, setSending] = useState(null); // status being sent, or null

  const handleSendRequest = async (status, userId) => {
    setSending(status);
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error("Error sending request:", err);
    } finally {
      setSending(null);
    }
  };

  // UI: initials shown when there is no photo (e.g. live preview in Edit Profile)
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div className='card bg-base-300 w-full max-w-sm shadow-xl overflow-hidden'>
      {/* UI: fixed-height photo so every card is the same size */}
      <figure className='h-80 bg-base-200'>
        {photoURL ? (
          <img
            src={user.photoURL}
            alt={`${firstName || ""} ${lastName || ""}`.trim() || "photo"}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-6xl font-bold text-primary opacity-60'>
            {initials}
          </div>
        )}
      </figure>
      <div className='card-body'>
        <h2 className='card-title text-2xl'>
          {(firstName || "") + " " + (lastName || "")}
        </h2>
        {age && gender && (
          <p className='flex-none text-sm opacity-70 capitalize'>
            {age + " · " + gender}
          </p>
        )}
        {about && <p className='opacity-80 text-sm leading-relaxed'>{about}</p>}
        {_id && (
          // UI: Ignore = outlined/red, Interested = primary; disabled + spinner while sending
          <div className='card-actions justify-center gap-4 mt-4'>
            <button
              className='btn btn-outline btn-error rounded-full px-6 gap-2 transition-transform active:scale-95'
              disabled={!!sending}
              onClick={() => handleSendRequest("ignored", _id)}>
              {sending === "ignored" ? (
                <span className='loading loading-spinner loading-sm'></span>
              ) : (
                <CloseIcon />
              )}
              Ignore
            </button>
            <button
              className='btn btn-primary rounded-full px-6 gap-2 transition-transform active:scale-95'
              disabled={!!sending}
              onClick={() => handleSendRequest("interested", _id)}>
              {sending === "interested" ? (
                <span className='loading loading-spinner loading-sm'></span>
              ) : (
                <HeartIcon />
              )}
              Interested
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserCard;

// const UserCard = ({ user }) => {
//   const { firstName, lastName, about, photoURL, age, gender, _id } = user;
//   const dispatch = useDispatch();

//   const handleSendRequest = async (status, userId) => {
//     try {
//       const res = await axios.post(
//         BASE_URL + "/request/send/" + status + "/" + userId,
//         {},
//         { withCredentials: true }
//       );
//       dispatch(removeUserFromFeed(userId));
//     } catch (err) {
//       console.log("error while fetching the new users");
//     }
//   };

//   return (
//     <div className='card w-96 bg-gray-100 shadow-lg rounded-xl overflow-hidden'>
//       <figure className='h-72 overflow-hidden'>
//         <img
//           src={photoURL}
//           alt='photo'
//           className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
//         />
//       </figure>
//       <div className='card-body text-center px-6 py-4'>
//         <h2 className='card-title text-2xl font-semibold text-gray-800'>
//           {firstName + " " + lastName}
//         </h2>
//         {age && gender && (
//           <p className='text-sm text-gray-600'>{age + ", " + gender}</p>
//         )}
//         <p className='text-gray-700 mt-2 text-sm'>{about}</p>

//         <div className='card-actions justify-center mt-4 gap-4'>
//           <button
//             className='btn bg-red-100 text-red-600 hover:bg-red-200 px-6 rounded-full shadow-sm'
//             onClick={() => handleSendRequest("ignored", _id)}>
//             Ignore
//           </button>
//           <button
//             className='btn bg-green-100 text-green-700 hover:bg-green-200 px-6 rounded-full shadow-sm'
//             onClick={() => handleSendRequest("interested", _id)}>
//             Interested
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserCard;
