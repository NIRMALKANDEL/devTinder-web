import axios from "axios";
import { useState } from "react";
import React from "react";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";
import PageHeader from "./PageHeader";
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
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  const saveProfile = async () => {
    setError("");
    setSaving(true);
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
      const message = err.response?.data?.error;
      setError(typeof message === "string" ? message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // UI: shared field styles (daisyUI 5 removed form-control/label-text, so labels are styled here)
  const fieldClass = "flex flex-col gap-1 w-full py-1";
  const labelClass = "text-sm font-medium opacity-80 text-left";

  return (
    <>
      <div className='max-w-5xl mx-auto my-10'>
        <PageHeader title='Your Profile' subtitle='Changes show up live in the preview' />

        <div className='flex flex-col lg:flex-row justify-center items-center lg:items-start gap-10'>
          {/* Form */}
          <div className='card bg-base-300 w-full max-w-md shadow-xl'>
            <div className='card-body'>
              <h2 className='card-title justify-center'>Edit Profile</h2>

              {/* UI: first/last name side by side on wider screens */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4'>
                <label className={fieldClass}>
                  <span className={labelClass}>First Name</span>
                  <input
                    type='text'
                    className='input input-bordered w-full'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>

                <label className={fieldClass}>
                  <span className={labelClass}>Last Name</span>
                  <input
                    type='text'
                    className='input input-bordered w-full'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </label>
              </div>

              <label className={fieldClass}>
                <span className={labelClass}>About</span>
                <textarea
                  rows={3}
                  className='textarea textarea-bordered w-full'
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </label>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4'>
                <label className={fieldClass}>
                  <span className={labelClass}>Age</span>
                  <input
                    type='number'
                    min='18'
                    className='input input-bordered w-full'
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                  />
                </label>

                <label className={fieldClass}>
                  <span className={labelClass}>Gender</span>
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
              </div>

              <label className={fieldClass}>
                <span className={labelClass}>Photo URL</span>
                <input
                  type='text'
                  className='input input-bordered w-full'
                  placeholder='https://...'
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                />
              </label>

              {error && (
                <div role='alert' className='alert alert-error alert-soft text-sm mt-2'>
                  <span>{error}</span>
                </div>
              )}

              <div className='card-actions justify-center mt-4'>
                <button
                  className='btn btn-primary w-full transition-transform active:scale-95'
                  disabled={saving}
                  onClick={saveProfile}>
                  {saving && <span className='loading loading-spinner loading-sm'></span>}
                  {saving ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className='w-full max-w-sm lg:sticky lg:top-24'>
            <p className='text-xs uppercase tracking-wider opacity-60 mb-2 text-center'>
              Live preview
            </p>
            <UserCard
              user={{ firstName, lastName, about, photoURL, age, gender }}
            />
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <div className='toast toast-top toast-center z-50'>
          <div className='alert alert-success shadow-lg animate-card-in'>
            <span>Profile updated successfully.</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
