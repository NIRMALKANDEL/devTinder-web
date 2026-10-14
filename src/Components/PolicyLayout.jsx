import React from "react";
import { motion } from "motion/react";
import PageHeader from "./PageHeader";

// Added: shared layout for the public information pages (terms, privacy, refunds,
// shipping, contact, premium). They are not in Body's PROTECTED_PATHS, so no login is needed.
const LAST_UPDATED = "14 October 2026";

const PolicyLayout = ({ title, subtitle = `Last updated: ${LAST_UPDATED}`, children }) => (
  <div className='max-w-3xl mx-auto w-full'>
    <PageHeader title={title} subtitle={subtitle} />
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className='surface px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-8 text-left [overflow-wrap:anywhere]'>
      {children}
    </motion.article>
  </div>
);

// One numbered/titled block of a policy
export const PolicySection = ({ title, children }) => (
  <section className='flex flex-col gap-3'>
    <h2 className='text-lg sm:text-xl font-semibold tracking-tight'>{title}</h2>
    <div className='flex flex-col gap-3 text-sm sm:text-base leading-relaxed opacity-85'>{children}</div>
  </section>
);

// Bulleted list in policy text
export const PolicyList = ({ items }) => (
  <ul className='list-disc pl-5 flex flex-col gap-1.5'>
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

// Highlighted callout (e.g. "payments are not live yet")
export const PolicyNotice = ({ title, children }) => (
  <div className='tint-primary rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-sm leading-relaxed' role='note'>
    {title && <p className='font-semibold mb-1'>{title}</p>}
    <div className='opacity-90'>{children}</div>
  </div>
);

export default PolicyLayout;
