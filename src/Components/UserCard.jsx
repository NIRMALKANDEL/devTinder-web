import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils/constants";

import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoURL, age, gender, about } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {}
  };

  return (
    <div className='card bg-base-300 w-96 shadow-xl'>
      <figure>
        <img src={user.photoURL} alt='photo' />
      </figure>
      <div className='card-body'>
        <h2 className='card-title'>{firstName + " " + lastName}</h2>
        {age && gender && <p>{age + ", " + gender}</p>}
        <p>{about}</p>
        <div className='card-actions justify-center my-4'>
          <button
            className='btn btn-primary'
            onClick={() => handleSendRequest("ignored", _id)}>
            Ignore
          </button>
          <button
            className='btn btn-secondary'
            onClick={() => handleSendRequest("interested", _id)}>
            Interested
          </button>
        </div>
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
