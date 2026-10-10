import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import Scene3D from "./three/Scene3D";
import SpotlightCard from "./ui/SpotlightCard";
import NumberTicker from "./ui/NumberTicker";
import Marquee from "./ui/Marquee";
import { ChatIcon, CloseIcon, FilterIcon, InboxIcon, SparklesIcon, UsersIcon } from "./Icons";

const TRENDING = [
  "React", "Node.js", "TypeScript", "Python", "Go", "Rust", "AWS", "Docker",
  "Kubernetes", "Next.js", "MongoDB", "PostgreSQL", "Flutter", "Three.js", "GraphQL", "Django",
];

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, type: "spring", stiffness: 260, damping: 26 } }),
};

// Added: Feed hero — 3D scene, live stats and the skill filter
const FeedHero = ({ skills, onSkillsChange, suggestions = [] }) => {
  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const pending = useSelector((store) => store.requests?.length || 0);
  const unread = useSelector((store) => Object.values(store.chat.unread).reduce((a, b) => a + b, 0));
  const [input, setInput] = useState("");

  const has = (skill) => skills.some((s) => s.toLowerCase() === skill.toLowerCase());
  const toggle = (skill) => {
    if (has(skill)) onSkillsChange(skills.filter((s) => s.toLowerCase() !== skill.toLowerCase()));
    else if (skills.length < 5) onSkillsChange([...skills, skill]);
  };
  const addTyped = (e) => {
    e.preventDefault();
    const skill = input.trim();
    if (skill && !has(skill) && skills.length < 5) onSkillsChange([...skills, skill]);
    setInput("");
  };

  const quick = [...new Set([...suggestions, ...TRENDING])].filter((s) => !has(s)).slice(0, 8);

  const stats = [
    { label: "Connections", value: connections?.length || 0, to: "/connections", Icon: UsersIcon },
    { label: "Requests", value: pending, to: "/requests", Icon: InboxIcon },
    { label: "Unread", value: unread, to: "/messages", Icon: ChatIcon },
  ];

  return (
    <section aria-labelledby='feed-title' className='flex flex-col gap-5 min-w-0'>
      {/* Headline + 3D scene */}
      <motion.div
        variants={rise}
        initial='hidden'
        animate='show'
        className='surface relative overflow-hidden grid sm:grid-cols-[1fr_auto] items-center gap-2 p-5 sm:p-7'>
        <div className='glow-backdrop -right-16 -top-16 w-72 h-72 rounded-full' aria-hidden='true'></div>
        <div className='relative min-w-0'>
          <span className='inline-flex items-center gap-1.5 rounded-full tint-primary text-primary text-xs font-semibold px-3 py-1'>
            <SparklesIcon className='w-3.5 h-3.5' />
            Hi {user?.firstName}, new developers are waiting
          </span>
          <h1 id='feed-title' className='text-4xl sm:text-5xl font-bold tracking-tight mt-3 leading-[1.05]'>
            <span className='text-gradient'>Discover</span> your
            <br className='hidden sm:block' /> next collaborator
          </h1>
          <p className='hidden lg:block text-sm sm:text-base opacity-70 mt-3 max-w-md'>
            Swipe right to connect, left to skip.
            <span className='hidden md:inline'> Or use the ← → keys.</span>
          </p>
        </div>
        <Scene3D className='w-full h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 sm:-my-4' />
      </motion.div>

      {/* Live stats */}
      <ul className='grid grid-cols-3 gap-3' aria-label='Your activity'>
        {stats.map(({ label, value, to, Icon }, i) => (
          <motion.li key={label} custom={i + 1} variants={rise} initial='hidden' animate='show'>
            <SpotlightCard as={Link} to={to} className='surface surface-hover flex flex-col gap-1 p-3 sm:p-4 h-full'>
              <span className='flex items-center gap-1.5 text-xs font-medium opacity-60'>
                <Icon className='w-3.5 h-3.5' />
                {label}
              </span>
              <NumberTicker value={value} className='text-2xl sm:text-3xl font-bold font-display' />
            </SpotlightCard>
          </motion.li>
        ))}
      </ul>

      {/* Skill filter */}
      <motion.div custom={4} variants={rise} initial='hidden' animate='show' className='bento-tile'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='flex items-center gap-2 font-semibold'>
            <FilterIcon className='w-4 h-4 text-primary' />
            Filter by skill
          </h2>
          {skills.length > 0 && (
            <button type='button' className='btn btn-ghost btn-xs rounded-lg' onClick={() => onSkillsChange([])}>
              Clear all
            </button>
          )}
        </div>
        <form onSubmit={addTyped} className='flex gap-2'>
          <label htmlFor='skill-filter' className='sr-only'>
            Add a skill to filter by
          </label>
          <input
            id='skill-filter'
            type='text'
            className='input w-full rounded-xl'
            placeholder={skills.length >= 5 ? "Up to 5 skills" : "e.g. React, Go, Figma"}
            value={input}
            disabled={skills.length >= 5}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type='submit' className='btn btn-primary btn-soft rounded-xl' disabled={!input.trim() || skills.length >= 5}>
            Add
          </button>
        </form>
        {skills.length > 0 && (
          <ul className='flex flex-wrap gap-1.5' aria-label='Active filters'>
            {skills.map((s, i) => (
              <motion.li key={s} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`chip chip-${i % 5} pr-1`}>
                {s}
                <button type='button' className='rounded-md p-0.5 hover:bg-black/10' aria-label={`Remove ${s} filter`} onClick={() => toggle(s)}>
                  <CloseIcon className='w-3 h-3' />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
        <div className='flex flex-wrap gap-1.5'>
          {quick.map((s) => (
            <button
              key={s}
              type='button'
              disabled={skills.length >= 5}
              onClick={() => toggle(s)}
              className='px-2.5 py-1 rounded-lg border border-hairline text-xs font-medium opacity-80 hover:opacity-100 hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'>
              + {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Trending skills ticker */}
      <motion.div custom={5} variants={rise} initial='hidden' animate='show' className='hidden sm:block'>
        <p className='tile-label mb-2'>Trending on DevTinder</p>
        <Marquee
          label='Trending skills'
          items={TRENDING}
          renderItem={(s, i) => (
            <button
              type='button'
              tabIndex={-1}
              onClick={() => !has(s) && toggle(s)}
              className={`chip chip-${i % 5} whitespace-nowrap cursor-pointer`}>
              {s}
            </button>
          )}
        />
      </motion.div>
    </section>
  );
};

export default FeedHero;
