import React from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { PolicyList, PolicySection } from "./PolicyLayout";
import { CONTACT } from "../utils/constants";

// Added: public Grievance and Customer Support page (/grievance).
// Contact details come from CONTACT (utils/constants.js), same as the other pages.
const Grievance = () => (
  <PolicyLayout title='Grievance and Customer Support' subtitle='Payments, account problems, safety and privacy complaints'>
    <PolicySection title='1. Customer support'>
      <p>
        For help with your account, a Premium payment, calls, or anything else on DevTinder, email{" "}
        <a href={`mailto:${CONTACT.email}`} className='link link-primary'>
          {CONTACT.email}
        </a>{" "}
        or call{" "}
        <a href={CONTACT.phoneHref} className='link link-primary'>
          {CONTACT.phone}
        </a>{" "}
        ({CONTACT.hours}).
      </p>
    </PolicySection>

    <PolicySection title='2. Grievance officer'>
      <dl className='grid sm:grid-cols-[minmax(0,10rem)_1fr] gap-x-6 gap-y-2'>
        <dt className='tile-label sm:pt-0.5'>Name</dt>
        <dd>{CONTACT.name}</dd>
        <dt className='tile-label sm:pt-0.5'>Email</dt>
        <dd>
          <a href={`mailto:${CONTACT.email}`} className='link link-primary'>
            {CONTACT.email}
          </a>
        </dd>
        <dt className='tile-label sm:pt-0.5'>Phone</dt>
        <dd>
          <a href={CONTACT.phoneHref} className='link link-primary'>
            {CONTACT.phone}
          </a>
        </dd>
        <dt className='tile-label sm:pt-0.5'>Address</dt>
        <dd>{CONTACT.address}</dd>
        <dt className='tile-label sm:pt-0.5'>Hours</dt>
        <dd>{CONTACT.hours}</dd>
      </dl>
    </PolicySection>

    <PolicySection title='3. How to raise a complaint'>
      <p>Email the grievance officer with:</p>
      <PolicyList
        items={[
          "The email address of your DevTinder account.",
          "What happened, and when.",
          "For payments: the amount, the date, and the Razorpay payment ID (pay_...) or order ID (order_...) from your confirmation email.",
          "For a complaint about another user: their name, and screenshots if you have them. You can also report or block them from the \"...\" menu on their card or profile.",
          "What you would like us to do.",
        ]}
      />
    </PolicySection>

    <PolicySection title='4. What happens next'>
      <PolicyList
        items={[
          "We aim to review your complaint within 3–5 business days and will reply by email.",
          "Payment issues are handled under the Refund and Cancellation Policy. Approved refunds go back to the original payment method.",
          "We may ask for more details to identify your account or payment. We will never ask for your password, card number, CVV or UPI PIN.",
        ]}
      />
      <p>
        If you are not satisfied with our response, you can also contact the National Consumer Helpline at{" "}
        <a href='https://consumerhelpline.gov.in' target='_blank' rel='noreferrer' className='link link-primary'>
          consumerhelpline.gov.in
        </a>
        .
      </p>
    </PolicySection>

    <PolicySection title='5. Related policies'>
      <p>
        <Link to='/refund-and-cancellation' className='link link-primary'>
          Refund and Cancellation Policy
        </Link>
        {" · "}
        <Link to='/terms-and-conditions' className='link link-primary'>
          Terms and Conditions
        </Link>
        {" · "}
        <Link to='/privacy-policy' className='link link-primary'>
          Privacy Policy
        </Link>
        {" · "}
        <Link to='/contact' className='link link-primary'>
          Contact Us
        </Link>
      </p>
    </PolicySection>
  </PolicyLayout>
);

export default Grievance;
