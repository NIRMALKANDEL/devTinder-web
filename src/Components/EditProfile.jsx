import axios from "axios";
import { useState } from "react";
import React from "react";
import { motion } from "motion/react";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";
import ProfileStrength from "./ProfileStrength";
import PageHeader from "./PageHeader";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { showToast } from "../utils/toastSlice";
import { getErrorMessage } from "../utils/api";
import { CloseIcon, GithubIcon, LinkIcon } from "./Icons";

// Added: same rules as the backend user model, checked before sending
const isValidUrl = (value) => {
  try {
    new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return /\./.test(value);
  } catch {
    return false;
  }
};

const validate = ({ firstName, lastName, age, photoURL, portfolioUrl, githubUrl }) => {
  const errors = {};
  const first = firstName.trim();
  if (first.length < 4 || first.length > 50)
    errors.firstName = "First name must be between 4 and 50 characters.";
  if (lastName.trim() && lastName.trim().length < 2)
    errors.lastName = "Last name must be at least 2 characters.";
  if (age !== "" && (!Number.isFinite(age) || age < 18))
    errors.age = "You must be at least 18.";
  if (photoURL.trim() && !isUploadedPhoto(photoURL) && !/^https?:\/\//i.test(photoURL.trim()))
    errors.photoURL = "Photo URL must start with http:// or https://";
  // Added: validate the optional portfolio URL before saving
  if (portfolioUrl.trim() && !isValidUrl(portfolioUrl.trim()))
    errors.portfolioUrl = "Please enter a valid portfolio URL";
  // Added: GitHub link must point to github.com (same rule as the backend)
  if (
    githubUrl.trim() &&
    !(isValidUrl(githubUrl.trim()) && /(^|\/\/|\.)github\.com(\/|$)/i.test(githubUrl.trim()))
  )
    errors.githubUrl = "Please enter a github.com link, e.g. github.com/your-name";
  return errors;
};

// Added: a photo picked from the gallery/device is shrunk to a small JPEG and
// saved as a data URL (the backend accepts up to ~700 KB)
const MAX_PHOTO_PX = 512;
const isUploadedPhoto = (value) => value.startsWith("data:image/");
const fileToPhotoDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_PHOTO_PX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // transparent PNGs get a white background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("Couldn't read that image. Please choose a JPG or PNG."));
    };
    img.src = src;
  });

const tile = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, type: "spring", stiffness: 260, damping: 26 },
  }),
};

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [about, setAbout] = useState(user?.about || "");
  // Changed: empty when not set (was a silent default of 18 that got saved on Update)
  const [age, setAge] = useState(user?.age ?? "");
  const [gender, setGender] = useState(user?.gender || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  // Added: Top 5 Skills + Portfolio Website state (optional fields)
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  // Added: GitHub profile link (optional)
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  // Added: "unsaved changes" indicator (compares with the saved profile)
  const current = { firstName, lastName, about, age, gender, photoURL, skills, portfolioUrl, githubUrl };
  const saved = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    about: user?.about || "",
    age: user?.age ?? "",
    gender: user?.gender || "",
    photoURL: user?.photoURL || "",
    skills: user?.skills || [],
    portfolioUrl: user?.portfolioUrl || "",
    githubUrl: user?.githubUrl || "",
  };
  const isDirty = JSON.stringify(current) !== JSON.stringify(saved);

  // Added: add a skill (trimmed, no duplicates, max 5)
  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || skills.length >= 5) return;
    if (skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills([...skills, skill]);
    setSkillInput("");
  };

  // Added: remove a skill chip
  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Added: photo chosen from the gallery / device
  const handlePhotoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, photoURL: "Please choose an image under 15 MB." }));
      return;
    }
    try {
      setPhotoURL(await fileToPhotoDataUrl(file));
      setFieldErrors((prev) => ({ ...prev, photoURL: undefined }));
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, photoURL: err.message }));
    }
  };

  const saveProfile = async (e) => {
    e?.preventDefault();
    if (saving) return;
    setError("");
    const errors = validate(current);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      // Added: send skills + portfolioUrl along with the existing fields
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        about,
        photoURL: photoURL.trim(),
        skills,
        portfolioUrl: portfolioUrl.trim(),
        githubUrl: githubUrl.trim(),
      };
      if (age !== "") payload.age = age;
      // Fixed: only send gender when one is selected (empty "" fails the enum validation)
      if (gender) payload.gender = gender;
      const res = await axios.patch(BASE_URL + "/profile/edit", payload, {
        withCredentials: true,
      });

      dispatch(addUser(res?.data?.data));
      dispatch(showToast("Profile updated successfully."));
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  // UI: shared field styles (daisyUI 5 removed form-control/label-text, so labels are styled here)
  const fieldClass = "flex flex-col gap-1.5 w-full";
  const labelClass = "text-sm font-medium opacity-80 text-left";
  const inputClass = (name) => `input w-full rounded-xl ${fieldErrors[name] ? "input-error" : ""}`;
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <span id={`${name}-error`} className='text-xs text-error text-left'>
        {fieldErrors[name]}
      </span>
    ) : null;
  const errorProps = (name) =>
    fieldErrors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};

  return (
    <div className='max-w-6xl mx-auto'>
      <PageHeader title='Your Profile' subtitle='Changes show up live in the preview' />

      <div className='grid lg:grid-cols-12 gap-6 items-start'>
        {/* UI: bento form — each group of fields is its own tile */}
        <form onSubmit={saveProfile} noValidate className='lg:col-span-7 grid sm:grid-cols-2 gap-5'>
          {/* Moved from the feed: profile strength, updated live as you type */}
          <motion.section custom={0} variants={tile} initial='hidden' animate='show' className='bento-tile sm:col-span-2' aria-label='Profile strength'>
            <ProfileStrength profile={current} />
          </motion.section>

          <motion.fieldset custom={0} variants={tile} initial='hidden' animate='show' className='bento-tile sm:col-span-2'>
            <legend className='sr-only'>Basics</legend>
            <p className='tile-label'>Basics</p>
            {/* UI: first/last name side by side on wider screens */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <label className={fieldClass}>
                <span className={labelClass}>First Name</span>
                <input
                  type='text'
                  autoComplete='given-name'
                  className={inputClass("firstName")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  {...errorProps("firstName")}
                />
                <FieldError name='firstName' />
              </label>

              <label className={fieldClass}>
                <span className={labelClass}>Last Name</span>
                <input
                  type='text'
                  autoComplete='family-name'
                  className={inputClass("lastName")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  {...errorProps("lastName")}
                />
                <FieldError name='lastName' />
              </label>

              <label className={fieldClass}>
                <span className={labelClass}>Age</span>
                <input
                  type='number'
                  min='18'
                  inputMode='numeric'
                  className={inputClass("age")}
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  {...errorProps("age")}
                />
                <FieldError name='age' />
              </label>

              <label className={fieldClass}>
                <span className={labelClass}>Gender</span>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value.toLowerCase())}
                  className='select w-full rounded-xl'>
                  <option value=''>Select gender</option>
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                  <option value='others'>Others</option>
                </select>
              </label>
            </div>
          </motion.fieldset>

          <motion.div custom={1} variants={tile} initial='hidden' animate='show' className='bento-tile sm:col-span-2'>
            <label className={fieldClass}>
              <span className='tile-label'>About</span>
              <textarea
                rows={4}
                className='textarea w-full rounded-xl leading-relaxed'
                placeholder='What are you building? What do you want to work on next?'
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>
          </motion.div>

          {/* Added: Top 5 Skills field (optional, max 5) */}
          <motion.div custom={2} variants={tile} initial='hidden' animate='show' className='bento-tile'>
            <div className='flex items-center justify-between'>
              <label htmlFor='skill-input' className='tile-label'>
                Top 5 Skills
              </label>
              <span className='text-xs opacity-60 tabular'>{skills.length}/5</span>
            </div>
            <div className='flex gap-2'>
              <input
                id='skill-input'
                type='text'
                className='input w-full rounded-xl'
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
                className='btn btn-primary btn-soft rounded-xl'
                disabled={skills.length >= 5 || !skillInput.trim()}
                onClick={addSkill}>
                Add
              </button>
            </div>
            {skills.length > 0 ? (
              <ul className='flex flex-wrap gap-1.5'>
                {skills.map((skill, i) => (
                  <motion.li
                    key={skill}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`chip chip-${i % 5} pr-1 max-w-full`}>
                    <span className='[overflow-wrap:anywhere]'>{skill}</span>
                    <button
                      type='button'
                      className='rounded-md p-0.5 hover:bg-black/10 transition-colors'
                      aria-label={`Remove ${skill}`}
                      onClick={() => removeSkill(skill)}>
                      <CloseIcon className='w-3 h-3' />
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className='text-xs opacity-50'>Press Enter to add a skill.</p>
            )}
          </motion.div>

          <motion.div custom={3} variants={tile} initial='hidden' animate='show' className='bento-tile'>
            <p className='tile-label'>Links</p>
            {/* Added: upload a photo from the gallery/device, or paste an image address */}
            <div className={fieldClass}>
              <span className={labelClass}>Profile Photo</span>
              <div className='flex items-center gap-2'>
                {isUploadedPhoto(photoURL) && (
                  <img src={photoURL} alt='' className='w-10 h-10 rounded-xl object-cover' />
                )}
                <label className='btn btn-primary btn-soft rounded-xl focus-within:outline-2 focus-within:outline-offset-2'>
                  {isUploadedPhoto(photoURL) ? "Change photo" : "Upload photo"}
                  <input type='file' accept='image/*' className='sr-only' onChange={handlePhotoFile} />
                </label>
                {isUploadedPhoto(photoURL) && (
                  <button type='button' className='btn btn-ghost rounded-xl' onClick={() => setPhotoURL("")}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            <label className={fieldClass}>
              <span className={labelClass}>Or image address (optional)</span>
              <input
                type='url'
                className={inputClass("photoURL")}
                placeholder={isUploadedPhoto(photoURL) ? "Using uploaded photo" : "https://..."}
                value={isUploadedPhoto(photoURL) ? "" : photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                {...errorProps("photoURL")}
              />
              <FieldError name='photoURL' />
            </label>

            {/* Added: Portfolio Website field (optional) */}
            <label className={fieldClass}>
              <span className={`${labelClass} inline-flex items-center gap-1.5`}>
                <LinkIcon className='w-3.5 h-3.5' />
                Portfolio Website
              </span>
              <input
                type='url'
                className={inputClass("portfolioUrl")}
                placeholder='https://your-portfolio.com'
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                {...errorProps("portfolioUrl")}
              />
              <FieldError name='portfolioUrl' />
            </label>

            {/* Added: GitHub profile field (optional) */}
            <label className={fieldClass}>
              <span className={`${labelClass} inline-flex items-center gap-1.5`}>
                <GithubIcon className='w-3.5 h-3.5' />
                GitHub
              </span>
              <input
                type='url'
                className={inputClass("githubUrl")}
                placeholder='https://github.com/your-name'
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                {...errorProps("githubUrl")}
              />
              <FieldError name='githubUrl' />
            </label>
          </motion.div>

          {error && (
            <div role='alert' className='alert alert-error alert-soft text-sm sm:col-span-2 rounded-2xl'>
              <span>{error}</span>
            </div>
          )}

          {/* UI: glass save bar stays reachable at the bottom while scrolling the form */}
          <div className='sm:col-span-2 sticky bottom-4 z-20'>
            <div className='liquid-glass rounded-2xl p-2 pl-4 flex items-center gap-3'>
              <p className='flex-1 text-sm flex items-center gap-2' aria-live='polite'>
                <span
                  className={`w-2 h-2 rounded-full ${isDirty ? "bg-warning" : "bg-success"}`}
                  aria-hidden='true'></span>
                {isDirty ? "Unsaved changes" : "All changes saved"}
              </p>
              <button
                type='submit'
                className='btn btn-primary rounded-xl px-8 transition-transform active:scale-95'
                disabled={saving || !isDirty}>
                {saving && <span className='loading loading-spinner loading-sm'></span>}
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>

        {/* Preview Card */}
        <aside className='lg:col-span-5 lg:sticky lg:top-24 flex flex-col items-center'>
          <p className='tile-label mb-3'>Live preview</p>
          <UserCard
            // Added: include skills + portfolioUrl so the live preview shows them
            user={{ firstName, lastName, about, photoURL, age, gender, skills, portfolioUrl, githubUrl }}
          />
        </aside>
      </div>
    </div>
  );
};

export default EditProfile;
