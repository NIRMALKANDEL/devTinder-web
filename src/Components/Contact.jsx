import React from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { PolicySection } from "./PolicyLayout";
import { CONTACT } from "../utils/constants";

// Added: public Contact Us page (/contact).
// Details live in CONTACT (utils/constants.js) so every page shows the same values.
const DETAILS = [
  { label: "Operated by", value: CONTACT.name },
  {
    label: "Support email",
    value: (
      <a href={`mailto:${CONTACT.email}`} className='link link-primary'>
        {CONTACT.email}
      </a>
    ),
  },
  {
    label: "Phone",
    value: (
      <a href={CONTACT.phoneHref} className='link link-primary'>
        {CONTACT.phone}
      </a>
    ),
  },
  { label: "Address", value: CONTACT.address },
  { label: "Support hours", value: CONTACT.hours },
  { label: "Grievance officer", value: `${CONTACT.name} (${CONTACT.email})` },
];

const Contact = () => (
  <PolicyLayout title='Contact Us' subtitle='Questions, feedback or account help'>
    <PolicySection title='Get in touch'>
      <p>
        For help with your account, questions about our policies, privacy requests, or reporting a problem, contact the
        DevTinder team using the details below.
      </p>
      <dl className='grid sm:grid-cols-[minmax(0,14rem)_1fr] gap-x-6 gap-y-3 mt-1'>
        {DETAILS.map(({ label, value }) => (
          <div key={label} className='contents'>
            <dt className='tile-label sm:pt-0.5'>{label}</dt>
            <dd className='-mt-2 sm:mt-0'>{value}</dd>
          </div>
        ))}
      </dl>
    </PolicySection>

    <PolicySection title='Reporting a user'>
      <p>
        To report someone's behaviour, open the "..." menu on their card in the feed or on their connection profile and
        choose Report. You can block them from the same menu.
      </p>
    </PolicySection>

    <PolicySection title='Payments and refunds'>
      <p>
        DevTinder does not currently accept payments. For how refunds will work once Premium launches, see the{" "}
        <Link to='/refund-and-cancellation' className='link link-primary'>
          Refund and Cancellation Policy
        </Link>
        .
      </p>
    </PolicySection>
  </PolicyLayout>
);

export default Contact;
