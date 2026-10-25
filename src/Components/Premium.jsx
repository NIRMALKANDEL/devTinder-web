import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import PageHeader from "./PageHeader";
import Avatar from "./Avatar";
import SkillChips from "./SkillChips";
import { PolicyNotice } from "./PolicyLayout";
import { CheckIcon, CloseIcon, CrownIcon, EyeIcon, PhoneIcon, RefreshIcon, SparklesIcon, VideoIcon } from "./Icons";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";
import { addUser } from "../utils/userSlice";
import { removeUserFromFeed } from "../utils/feedSlice";
import { showToast } from "../utils/toastSlice";
import { formatPrice, loadRazorpay, readPendingOrder, savePendingOrder } from "../utils/razorpay";

// Changed: the Premium page now has live pricing (from the server), Razorpay checkout,
// the user's Premium status and, for Premium members, today's recommendations.
// Every benefit listed here is enforced by the backend.

const BENEFITS = [
  {
    Icon: SparklesIcon,
    title: "Daily recommendations",
    text: "Up to 5 developer profiles picked for you each day, ranked by the skills you share. Picks refresh at midnight (IST).",
  },
  {
    Icon: EyeIcon,
    title: "More visibility",
    text: "Your profile is shown earlier in other developers' feeds, so more people see it. This improves your chances but can't guarantee connections.",
  },
  {
    Icon: VideoIcon,
    title: "Video calling",
    text: "Start video calls with your connections, right in DevTinder. Audio calls stay free for everyone.",
  },
];

const COMPARISON = [
  ["Profile, feed, connection requests and chat", true, true],
  ["Skill filters in the feed", true, true],
  ["Audio calls with your connections", true, true],
  ["Answer video calls from Premium members", true, true],
  ["Start video calls with your connections", false, true],
  ["5 daily developer recommendations", false, true],
  ["Shown earlier in other developers' feeds", false, true],
];

const FAQS = [
  [
    "Is this a subscription?",
    "No. Premium is a one-time payment for a fixed number of days. It never renews automatically. If you buy again while Premium is active, the new days are added to your current end date.",
  ],
  [
    "How do I pay?",
    "Payments are handled by Razorpay, using the methods Razorpay shows you at checkout (such as UPI and cards). DevTinder never sees or stores your card or bank details; we only keep the order and payment references, the amount and the status.",
  ],
  [
    "When does Premium start?",
    "As soon as Razorpay confirms the payment, usually within seconds. If your bank takes longer, the page shows that the payment is being confirmed, and Premium turns on automatically once it is.",
  ],
  [
    "Can I get a refund?",
    "Refunds aren't given for a change of mind. You can get one if you were charged twice, or charged without Premium being added and support couldn't fix it. See the Refund and Cancellation Policy for details and deadlines.",
  ],
  [
    "Who can I call?",
    "Only your accepted connections, and only when neither of you has blocked the other. The other person has to accept. Calls are never recorded, and your phone number is never shared.",
  ],
  [
    "Does Premium guarantee matches?",
    "No. Premium gives you more recommendations and more visibility, but who connects with you is always up to other developers.",
  ],
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, type: "spring", stiffness: 260, damping: 26 } }),
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });

const POLL_MS = 4000;
const POLL_LIMIT = 30; // about 2 minutes

// Premium members: today's picks, with Interested / Skip
const DailyPicks = () => {
  const dispatch = useDispatch();
  const [picks, setPicks] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    setPicks(null);
    try {
      const res = await axios.get(`${BASE_URL}/premium/recommendations`, { withCredentials: true });
      setPicks(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load today's picks."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (person, status) => {
    setBusyId(person._id);
    try {
      await axios.post(`${BASE_URL}/request/send/${status}/${person._id}`, {}, { withCredentials: true });
      setPicks((list) => list.filter((p) => p._id !== person._id));
      dispatch(removeUserFromFeed(person._id));
      if (status === "interested") dispatch(showToast(`Request sent to ${person.firstName}`));
    } catch (err) {
      dispatch(showToast(getErrorMessage(err, "Couldn't send the request."), "error"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section aria-labelledby='picks-title' className='mt-10'>
      <div className='flex items-center justify-between gap-3 mb-4'>
        <h2 id='picks-title' className='text-xl font-semibold tracking-tight text-left'>
          Today's picks for you
        </h2>
        <button type='button' className='btn btn-ghost btn-sm gap-2' onClick={load} disabled={!picks && !error}>
          <RefreshIcon className='w-4 h-4' />
          Refresh
        </button>
      </div>
      {error ? (
        <div className='surface p-6 text-sm flex flex-col items-center gap-3'>
          <p>{error}</p>
          <button type='button' className='btn btn-primary btn-sm rounded-full' onClick={load}>
            Try again
          </button>
        </div>
      ) : !picks ? (
        <div className='flex justify-center py-10' aria-label='Loading picks'>
          <span className='loading loading-spinner loading-md text-primary'></span>
        </div>
      ) : picks.length === 0 ? (
        <p className='surface p-6 text-sm opacity-70'>
          No new picks right now. You've already seen or contacted everyone we'd suggest; check back tomorrow.
        </p>
      ) : (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {picks.map((p, i) => (
            <motion.li key={p._id} className='bento-tile text-left' variants={fadeUp} initial='hidden' animate='show' custom={i}>
              <div className='flex items-center gap-3'>
                <Avatar src={p.photoURL} firstName={p.firstName} lastName={p.lastName} className='w-12 h-12' textClass='text-sm' />
                <div className='min-w-0'>
                  <p className='font-semibold truncate'>{`${p.firstName} ${p.lastName || ""}`.trim()}</p>
                  <p className='text-xs opacity-60'>
                    {p.sharedSkills?.length ? `${p.sharedSkills.length} shared skill${p.sharedSkills.length > 1 ? "s" : ""}` : "New face"}
                  </p>
                </div>
              </div>
              <SkillChips skills={p.skills} />
              <div className='flex gap-2 mt-auto'>
                <button type='button' className='btn btn-ghost btn-sm rounded-full flex-1' disabled={busyId === p._id} onClick={() => act(p, "ignored")}>
                  Skip
                </button>
                <button type='button' className='btn btn-primary btn-sm rounded-full flex-1' disabled={busyId === p._id} onClick={() => act(p, "interested")}>
                  {busyId === p._id ? <span className='loading loading-spinner loading-xs'></span> : "Interested"}
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
};

const Premium = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState("");
  // null | "starting" | "checkout" | "verifying" | "pending"
  const [paying, setPaying] = useState(null);
  const pollTimer = useRef(null);
  const mounted = useRef(true);

  const toast = useCallback((message, type = "success") => dispatch(showToast(message, type)), [dispatch]);

  const loadPlan = useCallback(async () => {
    setPlanError("");
    try {
      const res = await axios.get(`${BASE_URL}/premium/plan`);
      setPlan(res.data.data);
    } catch (err) {
      setPlanError(getErrorMessage(err, "Couldn't load the Premium plan."));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, { withCredentials: true });
      if (res?.data?.payload && mounted.current) dispatch(addUser(res.data.payload));
    } catch {
      // the next page load picks it up
    }
  }, [dispatch]);

  const activated = useCallback(
    async (expiresAt) => {
      savePendingOrder(null);
      clearTimeout(pollTimer.current);
      await refreshUser();
      if (!mounted.current) return;
      setPaying(null);
      toast(expiresAt ? `Payment successful. Premium is active until ${formatDate(expiresAt)}.` : "Payment successful. Premium is active.");
    },
    [refreshUser, toast]
  );

  // Checks an order until it is paid, failed, or we stop waiting
  const poll = useCallback(
    (orderId) => {
      let attempt = 0;
      const tick = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/payment/status/${orderId}`, { withCredentials: true });
          const data = res.data.data;
          if (data.premiumActivated) return activated(data.premiumExpiresAt);
          if (data.status === "failed") {
            savePendingOrder(null);
            if (mounted.current) setPaying(null);
            return toast("The payment failed. No Premium was added, and you can try again.", "error");
          }
        } catch {
          // network blip: keep trying
        }
        attempt += 1;
        if (!mounted.current) return;
        if (attempt < POLL_LIMIT) {
          pollTimer.current = setTimeout(tick, POLL_MS);
        } else {
          // Stop waiting here; it's checked again on the next visit, and the webhook still applies it
          setPaying(null);
          toast("Your bank is still confirming the payment. Premium will turn on automatically; check back later.", "error");
        }
      };
      clearTimeout(pollTimer.current);
      pollTimer.current = setTimeout(tick, 1000);
    },
    [activated, toast]
  );

  useEffect(() => {
    mounted.current = true;
    loadPlan();
    // A payment from an earlier visit may still be confirming
    const pending = readPendingOrder();
    if (pending && user) {
      setPaying("pending");
      poll(pending);
    }
    return () => {
      mounted.current = false;
      clearTimeout(pollTimer.current);
    };
    // only on first load / login
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const verify = async (result) => {
    setPaying("verifying");
    savePendingOrder(result.razorpay_order_id);
    try {
      const res = await axios.post(`${BASE_URL}/payment/verify`, result, { withCredentials: true });
      if (res.status === 200 && res.data.data?.premiumActivated) return activated(res.data.data.premiumExpiresAt);
      setPaying("pending");
      toast(res.data.message || "We're confirming your payment.");
      poll(result.razorpay_order_id);
    } catch (err) {
      if (err?.response?.status === 402) {
        savePendingOrder(null);
        setPaying(null);
        return toast(getErrorMessage(err), "error");
      }
      // Couldn't confirm right now: keep checking; the server also gets Razorpay's webhook
      setPaying("pending");
      toast(getErrorMessage(err, "We're still confirming your payment."), "error");
      poll(result.razorpay_order_id);
    }
  };

  const upgrade = async () => {
    if (paying) return;
    setPaying("starting");
    const loaded = await loadRazorpay();
    if (!loaded) {
      setPaying(null);
      return toast("Couldn't open the payment window. Check your connection or turn off blockers for this site, then try again.", "error");
    }
    let order;
    try {
      const res = await axios.post(`${BASE_URL}/payment/create-order`, {}, { withCredentials: true });
      order = res.data.data;
    } catch (err) {
      setPaying(null);
      return toast(getErrorMessage(err, "Couldn't start the payment. Please try again."), "error");
    }

    let settled = false;
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "DevTinder",
      description: order.description,
      prefill: order.prefill,
      notes: { purpose: "DevTinder Premium" },
      retry: { enabled: true },
      handler: (result) => {
        settled = true;
        verify(result);
      },
      modal: {
        confirm_close: true,
        ondismiss: async () => {
          if (settled) return;
          // Closed without finishing. Check once in case a payment went through anyway.
          try {
            const res = await axios.get(`${BASE_URL}/payment/status/${order.orderId}`, { withCredentials: true });
            if (res.data.data.premiumActivated) return activated(res.data.data.premiumExpiresAt);
            if (res.data.data.status === "authorized") {
              savePendingOrder(order.orderId);
              setPaying("pending");
              return poll(order.orderId);
            }
          } catch {
            // fall through
          }
          setPaying(null);
          toast("Payment cancelled. You weren't charged.", "error");
        },
      },
    });
    // With retry on, Razorpay keeps the window open so the user can try another method
    rzp.on("payment.failed", (resp) => {
      toast(resp?.error?.description || "The payment failed. You can try again.", "error");
    });
    setPaying("checkout");
    rzp.open();
  };

  const price = plan?.priceConfirmed ? formatPrice(plan.amount, plan.currency) : null;
  const isPremium = Boolean(user?.isPremium);
  const busy = Boolean(paying);
  const buttonLabel = {
    starting: "Opening checkout...",
    checkout: "Complete payment in the Razorpay window",
    verifying: "Confirming payment...",
    pending: "Confirming payment...",
  }[paying];

  const renderCta = () => {
    if (!plan && !planError) {
      return <span className='loading loading-spinner loading-md text-primary my-3' aria-label='Loading plan'></span>;
    }
    if (planError) {
      return (
        <div className='flex flex-col items-center gap-2'>
          <p className='text-sm text-error'>{planError}</p>
          <button type='button' className='btn btn-sm rounded-full' onClick={loadPlan}>
            Try again
          </button>
        </div>
      );
    }
    if (!plan.checkoutEnabled) {
      return (
        <>
          <button type='button' className='btn btn-primary rounded-full px-8 mt-2' disabled aria-disabled='true'>
            Premium checkout coming soon
          </button>
          <p className='text-xs opacity-60'>Premium can't be bought yet. No payment is taken on DevTinder today.</p>
        </>
      );
    }
    if (!user) {
      return (
        <Link to='/login' className='btn btn-primary rounded-full px-8 mt-2'>
          Log in to upgrade
        </Link>
      );
    }
    return (
      <button type='button' className='btn btn-primary rounded-full px-8 mt-2 gap-2' onClick={upgrade} disabled={busy} aria-busy={busy}>
        {busy ? <span className='loading loading-spinner loading-sm'></span> : <CrownIcon className='w-4 h-4' />}
        {buttonLabel || (isPremium ? `Extend by ${plan.durationDays} days · ${price}` : `Upgrade for ${price}`)}
      </button>
    );
  };

  return (
    <div className='max-w-4xl mx-auto w-full'>
      <PageHeader
        title='DevTinder Premium'
        subtitle={isPremium && user?.premiumExpiresAt ? `Active until ${formatDate(user.premiumExpiresAt)}` : "Get discovered, get recommended, get on a call"}
      />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        aria-labelledby='pricing-title'
        className='surface px-5 py-8 sm:px-10 sm:py-10 flex flex-col items-center text-center gap-4'>
        <span className='chip chip-0'>{isPremium ? "You're Premium" : "One-time upgrade"}</span>
        <h2 id='pricing-title' className='text-2xl sm:text-3xl font-bold tracking-tight'>
          Get discovered by the <span className='text-gradient'>right developers</span>
        </h2>
        <p className='opacity-70 max-w-xl'>
          Daily recommendations, more visibility in the feed, and video calls with your connections.
        </p>

        <div className='flex flex-col items-center gap-1 mt-2'>
          <p className='tile-label'>Price</p>
          {plan ? (
            <>
              <p className='text-4xl font-bold tabular'>{price || "To be confirmed"}</p>
              <p className='text-xs opacity-60'>
                One-time payment · {plan.durationDays} days of Premium · no auto-renewal
              </p>
            </>
          ) : (
            <span className='skeleton h-10 w-28 rounded-xl' aria-hidden='true'></span>
          )}
        </div>

        {renderCta()}

        {paying === "pending" && (
          <div role='status' className='tint-primary rounded-2xl px-4 py-3 text-sm max-w-md'>
            Your payment is being confirmed. Premium turns on automatically once it is; you can leave this page. If
            money was taken and Premium isn't active within a day, contact support.
          </div>
        )}
        {plan?.checkoutEnabled && plan.mode === "test" && (
          <p className='text-xs font-medium text-warning'>Test mode: use Razorpay test details. No real money is charged.</p>
        )}
        {plan?.checkoutEnabled && (
          <p className='text-xs opacity-60 max-w-md'>
            Payments are processed securely by Razorpay. By paying you agree to the{" "}
            <Link to='/terms-and-conditions' className='link'>
              Terms
            </Link>{" "}
            and the{" "}
            <Link to='/refund-and-cancellation' className='link'>
              Refund and Cancellation Policy
            </Link>
            .
          </p>
        )}
      </motion.section>

      <h2 className='text-xl font-semibold tracking-tight mt-10 mb-4 text-left'>What you get</h2>
      <div className='grid gap-4 sm:grid-cols-3'>
        {BENEFITS.map(({ Icon, title, text }, i) => (
          <motion.div key={title} className='bento-tile text-left' variants={fadeUp} initial='hidden' animate='show' custom={i}>
            <div className='w-10 h-10 rounded-xl tint-primary text-primary flex items-center justify-center'>
              <Icon className='w-5 h-5' />
            </div>
            <h3 className='font-semibold'>{title}</h3>
            <p className='text-sm opacity-70'>{text}</p>
          </motion.div>
        ))}
      </div>

      {isPremium && <DailyPicks />}

      <section aria-labelledby='compare-title' className='mt-10'>
        <h2 id='compare-title' className='text-xl font-semibold tracking-tight mb-4 text-left'>
          Free vs Premium
        </h2>
        <div className='surface overflow-x-auto'>
          <table className='table text-left'>
            <thead>
              <tr>
                <th scope='col'>Feature</th>
                <th scope='col' className='text-center w-24'>
                  Free
                </th>
                <th scope='col' className='text-center w-24 text-primary'>
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([feature, free, premium]) => (
                <tr key={feature}>
                  <th scope='row' className='font-normal'>
                    {feature}
                  </th>
                  {[free, premium].map((has, i) => (
                    <td key={i} className='text-center'>
                      {has ? (
                        <CheckIcon className='w-5 h-5 text-success inline' />
                      ) : (
                        <CloseIcon className='w-4 h-4 opacity-40 inline' />
                      )}
                      <span className='sr-only'>{has ? "Included" : "Not included"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby='calls-title' className='surface px-5 py-6 sm:px-8 mt-10 text-left flex flex-col gap-3'>
        <h2 id='calls-title' className='text-xl font-semibold tracking-tight flex items-center gap-2'>
          <PhoneIcon className='w-5 h-5 text-primary' />
          About calls
        </h2>
        <p className='text-sm sm:text-base opacity-80'>
          Call any of your connections from your chat or their profile. Audio calls are free for everyone; starting a
          video call needs Premium. The other person always chooses whether to answer.
        </p>
        <PolicyNotice title='Your privacy on calls'>
          Calls are never recorded and your phone number is never shared. Calls go directly between the two devices
          where possible, so, as with most calling apps, the other device can see your network (IP) address; on some
          networks, calls go through a relay (TURN) server instead.
        </PolicyNotice>
      </section>

      <section aria-labelledby='faq-title' className='mt-10'>
        <h2 id='faq-title' className='text-xl font-semibold tracking-tight mb-4 text-left'>
          Questions
        </h2>
        <div className='flex flex-col gap-2'>
          {FAQS.map(([q, a]) => (
            <details key={q} className='collapse collapse-arrow surface'>
              <summary className='collapse-title font-medium text-left'>{q}</summary>
              <div className='collapse-content text-sm opacity-80 text-left'>
                <p>{a}</p>
              </div>
            </details>
          ))}
        </div>
        <p className='text-sm opacity-70 mt-6 text-left'>
          More details:{" "}
          <Link to='/refund-and-cancellation' className='link link-primary'>
            Refund and Cancellation Policy
          </Link>
          ,{" "}
          <Link to='/terms-and-conditions' className='link link-primary'>
            Terms and Conditions
          </Link>
          ,{" "}
          <Link to='/privacy-policy' className='link link-primary'>
            Privacy Policy
          </Link>
          . Problem with a payment?{" "}
          <Link to='/grievance' className='link link-primary'>
            Customer support
          </Link>
          .
        </p>
      </section>
    </div>
  );
};

export default Premium;
