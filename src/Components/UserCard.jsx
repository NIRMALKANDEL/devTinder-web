import React from "react";

const UserCard = ({ user }) => {
  const { firstName, lastName, about, photoURL, age, gender } = user;

  return (
    <div className='card w-96 bg-gray-100 shadow-lg rounded-xl overflow-hidden'>
      <figure className='h-72 overflow-hidden'>
        <img
          src={photoURL}
          alt='photo'
          className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
        />
      </figure>
      <div className='card-body text-center px-6 py-4'>
        <h2 className='card-title text-2xl font-semibold text-gray-800'>
          {firstName + " " + lastName}
        </h2>
        {age && gender && (
          <p className='text-sm text-gray-600'>{age + ", " + gender}</p>
        )}
        <p className='text-gray-700 mt-2 text-sm'>{about}</p>

        <div className='card-actions justify-center mt-4 gap-4'>
          <button className='btn bg-red-100 text-red-600 hover:bg-red-200 px-6 rounded-full shadow-sm'>
            Ignore
          </button>
          <button className='btn bg-green-100 text-green-700 hover:bg-green-200 px-6 rounded-full shadow-sm'>
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
