import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import PageHeader from "./PageHeader";
import { PolicyNotice } from "./PolicyLayout";
import { CheckIcon, EyeIcon, FilterIcon, FlameIcon, SparklesIcon, UserIcon } from "./Icons";

// Added: public information page for the planned Premium offering (/premium).
// No checkout or payment code: the button below is a disabled "coming soon" placeholder.
const BENEFITS = [
  {
    Icon: FilterIcon,
    title: "Advanced discovery filters",
    text: "Narrow the developer feed by skills and other profile details to find the right people faster.",
  },
  {
    Icon: FlameIcon,
    title: "Higher daily discovery limit",
    text: "Discover more developer profiles each day.",
  },
  {
    Icon: EyeIcon,
    title: "Profile visibility boost",
    text: "Your profile is shown to more developers in their feeds.",
  },
  {
    Icon: UserIcon,
    title: "Profile insights",
    text: "Extra insights about how your profile is performing, where supported.",
  },
  {
    Icon: SparklesIcon,
    title: "Premium badge",
    text: "A badge on your profile that shows you are a Premium member.",
  },
];

const tile = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, type: "spring", stiffness: 260, damping: 26 } }),
};

const Premium = () => (
  <div className='max-w-4xl mx-auto w-full'>
    <PageHeader title='DevTinder Premium' subtitle='Planned upgrade · not yet available' />

    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className='surface px-5 py-8 sm:px-10 sm:py-10 flex flex-col items-center text-center gap-4'>
      <span className='chip chip-0'>Coming soon</span>
      <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
        Get discovered by the <span className='text-gradient'>right developers</span>
      </h2>
      <p className='opacity-70 max-w-xl'>
        Premium is a planned one-time, 30-day upgrade for your DevTinder account, with extra tools for finding and
        connecting with developers.
      </p>
      <div className='flex flex-col items-center gap-1 mt-2'>
        <p className='tile-label'>Proposed one-time price</p>
        <p className='text-4xl font-bold tabular'>
          <span className='text-base font-medium opacity-60 align-middle mr-1'>starting at</span>₹100
        </p>
        <p className='text-xs opacity-60'>One-time payment · 30 days of Premium · no auto-renewal</p>
      </div>
      <button type='button' className='btn btn-primary rounded-full px-8 mt-2' disabled aria-disabled='true'>
        Premium purchasing coming soon
      </button>
      <p className='text-xs opacity-60'>Premium cannot be purchased yet. No payment is taken on DevTinder today.</p>
    </motion.section>

    <h2 className='text-xl font-semibold tracking-tight mt-10 mb-4 text-left'>Planned benefits</h2>
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {BENEFITS.map(({ Icon, title, text }, i) => (
        <motion.div key={title} className='bento-tile text-left' variants={tile} initial='hidden' animate='show' custom={i}>
          <div className='w-10 h-10 rounded-xl tint-primary text-primary flex items-center justify-center'>
            <Icon className='w-5 h-5' />
          </div>
          <h3 className='font-semibold'>{title}</h3>
          <p className='text-sm opacity-70'>{text}</p>
        </motion.div>
      ))}
    </div>

    <div className='surface px-5 py-6 sm:px-8 mt-10 flex flex-col gap-4 text-left text-sm sm:text-base'>
      <PolicyNotice title='Before Premium launches'>
        The benefits and price above are proposed and may change before launch. Premium features are not active yet,
        and no payment gateway is connected.
      </PolicyNotice>
      <ul className='flex flex-col gap-2'>
        {[
          "Everything on the free plan stays free: profile, feed, connection requests, connections and chat.",
          "Premium is planned as a one-time purchase, applied digitally to your account, and lasts 30 days.",
          "No automatic renewal: you are never charged again unless you choose to buy Premium again.",
          "Planned for India only at launch, with payments in Indian rupees (₹).",
        ].map((item) => (
          <li key={item} className='flex gap-2'>
            <CheckIcon className='w-5 h-5 text-primary shrink-0' />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className='opacity-70'>
        See the{" "}
        <Link to='/refund-and-cancellation' className='link link-primary'>
          Refund and Cancellation Policy
        </Link>
        ,{" "}
        <Link to='/shipping-and-delivery' className='link link-primary'>
          Shipping and Delivery Policy
        </Link>{" "}
        and{" "}
        <Link to='/terms-and-conditions' className='link link-primary'>
          Terms and Conditions
        </Link>{" "}
        for how Premium is intended to work. Questions?{" "}
        <Link to='/contact' className='link link-primary'>
          Contact us
        </Link>
        .
      </p>
    </div>
  </div>
);

export default Premium;
