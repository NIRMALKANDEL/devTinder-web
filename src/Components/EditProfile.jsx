import axios from "axios";
import { useState } from "react";
import React from "react";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [about, setAbout] = useState(user?.about || "");
  const [age, setAge] = useState(user?.age || 18);
  const [gender, setGender] = useState(user?.gender || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const saveProfile = async () => {
    setError("");
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        { firstName, lastName, about, photoURL, age, gender },
        { withCredentials: true }
      );

      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    }
  };

  return (
    <>
      <div className='flex flex-col lg:flex-row justify-center items-start gap-10 my-10 px-4'>
        {/* Form */}
        <div className='card bg-base-300 w-96 shadow-xl'>
          <div className='card-body'>
            <h2 className='card-title justify-center'>Edit Profile</h2>

            <label className='form-control w-full max-w-xs py-2'>
              <span className='label-text'>First Name</span>
              <input
                type='text'
                className='input input-bordered w-full'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>

            <label className='form-control w-full max-w-xs py-2'>
              <span className='label-text'>Last Name</span>
              <input
                type='text'
                className='input input-bordered w-full'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>

            <label className='form-control w-full max-w-xs py-2'>
              <span className='label-text'>About</span>
              <textarea
                className='textarea textarea-bordered w-full'
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>

            <label className='form-control w-full max-w-xs py-2'>
              <span className='label-text'>Age</span>
              <input
                type='number'
                min='18'
                className='input input-bordered w-full'
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </label>

            <label className='form-control w-full max-w-xs py-2'>
              <span className='label-text'>Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value.toLowerCase())}
                className='select select-bordered w-full'>
                <option value=''>Select gender</option>
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='others'>Others</option>
              </select>
            </label>

            <label className='form-control w-full max-w-xs py-2'>
              <span className='label-text'>Photo URL</span>
              <input
                type='text'
                className='input input-bordered w-full'
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </label>

            {error && (
              <div className='text-red-500 text-center py-2'>{error}</div>
            )}

            <div className='card-actions justify-center mt-4'>
              <button className='btn btn-primary' onClick={saveProfile}>
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <UserCard
          user={{ firstName, lastName, about, photoURL, age, gender }}
        />
      </div>

      {/* Toast Message */}
      {showToast && (
        <div className='toast toast-top toast-center'>
          <div className='alert alert-success'>
            <span>Profile updated successfully.</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
