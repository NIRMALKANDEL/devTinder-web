import React, { useState } from "react";
import { motion } from "motion/react";
import { CloseIcon, FilterIcon } from "./Icons";

const TRENDING = [
  "React", "Node.js", "TypeScript", "Python", "Go", "Rust", "AWS", "Docker",
  "Kubernetes", "Next.js", "MongoDB", "PostgreSQL", "Flutter", "GraphQL", "Django",
];

// Changed: the skill filter is now a quiet side panel next to the deck (was part of the big hero)
const SkillFilter = ({ skills, onSkillsChange, suggestions = [] }) => {
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

  const quick = [...new Set([...suggestions, ...TRENDING])].filter((s) => !has(s)).slice(0, 10);
  const full = skills.length >= 5;

  return (
    <section aria-labelledby='filter-title' className='surface p-4 flex flex-col gap-3 min-w-0'>
      <div className='flex items-center justify-between gap-2'>
        <h2 id='filter-title' className='flex items-center gap-2 text-sm font-semibold'>
          <FilterIcon className='w-4 h-4 text-primary' />
          Filter by skill
        </h2>
        {skills.length > 0 && (
          <button type='button' className='btn btn-ghost btn-xs rounded-lg' onClick={() => onSkillsChange([])}>
            Clear
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
          className='input input-sm w-full rounded-lg'
          placeholder={full ? "Up to 5 skills" : "Type a skill"}
          value={input}
          disabled={full}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type='submit' className='btn btn-sm btn-primary btn-soft rounded-lg' disabled={!input.trim() || full}>
          Add
        </button>
      </form>

      {skills.length > 0 && (
        <ul className='flex flex-wrap gap-1.5' aria-label='Active filters'>
          {skills.map((s, i) => (
            <motion.li
              key={s}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`chip chip-${i % 5} pr-1`}>
              {s}
              <button type='button' className='rounded-md p-0.5 hover:bg-black/10' aria-label={`Remove ${s} filter`} onClick={() => toggle(s)}>
                <CloseIcon className='w-3 h-3' />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <div className='flex flex-wrap gap-1.5' aria-label='Suggested skills'>
        {quick.map((s) => (
          <button
            key={s}
            type='button'
            disabled={full}
            onClick={() => toggle(s)}
            className='px-2 py-0.5 rounded-md border border-hairline text-xs font-medium opacity-75 hover:opacity-100 hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'>
            {s}
          </button>
        ))}
      </div>
    </section>
  );
};

export default SkillFilter;
