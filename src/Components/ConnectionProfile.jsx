import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { fetchConnections, getErrorMessage } from "../utils/api";
import { DEFAULT_ABOUT, toHref } from "../utils/constants";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import Avatar from "./Avatar";
import SkillChips from "./SkillChips";
import { AlertIcon, ArrowRightIcon, CheckIcon, GithubIcon, LinkIcon, UsersIcon } from "./Icons";

const tile = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, type: "spring", stiffness: 260, damping: 26 },
  }),
};

// Big clickable row for a profile link
const LinkRow = ({ href, Icon, label }) => (
  <a
    href={toHref(href)}
    target='_blank'
    rel='noopener noreferrer'
    className='group flex items-center gap-3 rounded-2xl bg-base-200 px-4 py-3 transition-colors hover:tint-primary'>
    <span className='w-9 h-9 rounded-xl bg-base-100 text-primary flex items-center justify-center shrink-0'>
      <Icon className='w-[18px] h-[18px]' />
    </span>
    <span className='min-w-0 flex-1'>
      <span className='block text-sm font-semibold'>{label}</span>
      <span className='block text-xs opacity-60 truncate'>{href.replace(/^https?:\/\//i, "")}</span>
    </span>
    <ArrowRightIcon className='w-4 h-4 opacity-40 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-80' />
  </a>
);

// Added: full profile of one connection (/connections/:userId).
// Only people in your connections can be opened; the list is loaded if a page refresh lands here.
const ConnectionProfile = () => {
  const { userId } = useParams();
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const requested = useRef(false);

  const loadConnections = useCallback(async () => {
    setError("");
    try {
      await fetchConnections(dispatch);
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError(getErrorMessage(err, "Couldn't load this profile."));
    }
  }, [dispatch]);

  useEffect(() => {
    if (connections || requested.current) return;
    requested.current = true;
    loadConnections();
  }, [connections, loadConnections]);

  if (!connections && !error) {
    return (
      <div className='max-w-5xl mx-auto' aria-label='Loading'>
        <div className='skeleton h-10 w-64 mb-8'></div>
        <div className='grid gap-5 lg:grid-cols-12'>
          <div className='skeleton lg:col-span-5 aspect-[4/5] rounded-3xl'></div>
          <div className='lg:col-span-7 grid gap-5'>
            <div className='skeleton h-40 rounded-3xl'></div>
            <div className='skeleton h-32 rounded-3xl'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!connections) {
    return (
      <div className='max-w-5xl mx-auto'>
        <PageHeader title='Profile' />
        <EmptyState
          icon={<AlertIcon className='w-7 h-7' />}
          title="Couldn't load this profile"
          message={error}
          actionText='Try again'
          onAction={loadConnections}
        />
      </div>
    );
  }

  const person = connections.find((c) => c._id === userId);

  if (!person) {
    return (
      <div className='max-w-5xl mx-auto'>
        <PageHeader title='Profile' />
        <EmptyState
          icon={<UsersIcon className='w-7 h-7' />}
          title='Profile not found'
          message="This person isn't in your connections."
          actionText='View connections'
          actionTo='/connections'
        />
      </div>
    );
  }

  const { firstName, lastName, photoURL, age, gender, about, skills, portfolioUrl, githubUrl } = person;
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  const hasAbout = about && about !== DEFAULT_ABOUT;

  return (
    <div className='max-w-5xl mx-auto'>
      <PageHeader title={fullName} subtitle='Your connection' />

      {/* UI: bento layout — large photo tile beside about / skills / details / links */}
      <div className='grid gap-5 lg:grid-cols-12 items-start'>
        <motion.figure
          custom={0}
          variants={tile}
          initial='hidden'
          animate='show'
          className='surface lg:col-span-5 relative overflow-hidden aspect-[4/5] lg:sticky lg:top-24'>
          <Avatar
            src={photoURL}
            firstName={firstName}
            lastName={lastName}
            rounded='rounded-none'
            className='w-full h-full'
            textClass='text-7xl'
          />
          <div
            className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none'
            aria-hidden='true'></div>
          <figcaption className='absolute inset-x-0 bottom-0 p-6 text-white'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-xs font-semibold'>
              <CheckIcon className='w-3.5 h-3.5' />
              Connected
            </span>
            <p className='text-3xl font-bold tracking-tight mt-3 [overflow-wrap:anywhere]'>{fullName}</p>
            {(age || gender) && (
              <p className='text-sm text-white/80 capitalize tabular mt-0.5'>
                {[age, gender].filter(Boolean).join(" · ")}
              </p>
            )}
          </figcaption>
        </motion.figure>

        <div className='lg:col-span-7 grid sm:grid-cols-2 gap-5'>
          <motion.section custom={1} variants={tile} initial='hidden' animate='show' className='bento-tile sm:col-span-2'>
            <h2 className='tile-label'>About</h2>
            {hasAbout ? (
              <p className='leading-relaxed opacity-90 whitespace-pre-line [overflow-wrap:anywhere]'>{about}</p>
            ) : (
              <p className='text-sm opacity-50'>{firstName} hasn't written a bio yet.</p>
            )}
          </motion.section>

          <motion.section custom={2} variants={tile} initial='hidden' animate='show' className='bento-tile'>
            <h2 className='tile-label'>Top skills</h2>
            {skills?.length > 0 ? (
              <SkillChips skills={skills} large />
            ) : (
              <p className='text-sm opacity-50'>No skills added yet.</p>
            )}
          </motion.section>

          <motion.section custom={3} variants={tile} initial='hidden' animate='show' className='bento-tile'>
            <h2 className='tile-label'>Details</h2>
            <dl className='grid grid-cols-2 gap-3'>
              <div className='rounded-2xl bg-base-200 px-4 py-3'>
                <dt className='text-xs opacity-60'>Age</dt>
                <dd className='text-2xl font-bold tabular'>{age || "—"}</dd>
              </div>
              <div className='rounded-2xl bg-base-200 px-4 py-3'>
                <dt className='text-xs opacity-60'>Gender</dt>
                <dd className='text-lg font-semibold capitalize mt-1'>{gender || "—"}</dd>
              </div>
            </dl>
          </motion.section>

          <motion.section custom={4} variants={tile} initial='hidden' animate='show' className='bento-tile sm:col-span-2'>
            <h2 className='tile-label'>Links</h2>
            {portfolioUrl || githubUrl ? (
              <div className='grid sm:grid-cols-2 gap-3'>
                {portfolioUrl && <LinkRow href={portfolioUrl} Icon={LinkIcon} label='Portfolio' />}
                {githubUrl && <LinkRow href={githubUrl} Icon={GithubIcon} label='GitHub' />}
              </div>
            ) : (
              <p className='text-sm opacity-50'>No links added yet.</p>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default ConnectionProfile;
