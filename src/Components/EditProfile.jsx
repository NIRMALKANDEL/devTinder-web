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
  // Added: Top 5 Skills + Portfolio Website state (optional fields)
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  // Added: add a skill (trimmed, no duplicates, max 5)
  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || skills.length >= 5 || skills.includes(skill)) return;
    setSkills([...skills, skill]);
    setSkillInput("");
  };

  // Added: remove a skill chip
  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const saveProfile = async () => {
    setError("");
    // Added: validate the optional portfolio URL before saving
    if (portfolioUrl.trim()) {
      try {
        new URL(/^https?:\/\//i.test(portfolioUrl) ? portfolioUrl : `https://${portfolioUrl}`);
      } catch {
        setError("Please enter a valid portfolio URL");
        return;
      }
    }
    setSaving(true);
    try {
      // Added: send skills + portfolioUrl along with the existing fields
      const payload = { firstName, lastName, about, photoURL, age, skills, portfolioUrl };
      // Fixed: only send gender when one is selected (empty "" fails the enum validation)
      if (gender) payload.gender = gender;
      const res = await axios.patch(BASE_URL + "/profile/edit", payload, {
        withCredentials: true,
      });

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

              {/* Added: Top 5 Skills field (optional, max 5) */}
              <label className={fieldClass}>
                <span className={labelClass}>Top 5 Skills</span>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    className='input input-bordered w-full'
                    placeholder={skills.length >= 5 ? "Maximum 5 skills added" : "e.g. React"}
                    value={skillInput}
                    disabled={skills.length >= 5}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type='button'
                    className='btn btn-outline btn-primary'
                    disabled={skills.length >= 5 || !skillInput.trim()}
                    onClick={addSkill}>
                    Add
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className='badge badge-primary badge-outline gap-1'>
                        {skill}
                        <button
                          type='button'
                          className='text-xs'
                          aria-label={`Remove ${skill}`}
                          onClick={() => removeSkill(skill)}>
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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

              {/* Added: Portfolio Website field (optional) */}
              <label className={fieldClass}>
                <span className={labelClass}>Portfolio Website</span>
                <input
                  type='url'
                  className='input input-bordered w-full'
                  placeholder='https://your-portfolio.com'
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
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
              // Added: include skills + portfolioUrl so the live preview shows them
              user={{ firstName, lastName, about, photoURL, age, gender, skills, portfolioUrl }}
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
