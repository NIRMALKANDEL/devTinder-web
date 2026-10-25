import React from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { PolicyList, PolicySection } from "./PolicyLayout";

// Added: public Shipping and Delivery Policy page (/shipping-and-delivery)
const ShippingPolicy = () => (
  <PolicyLayout title='Shipping and Delivery Policy'>
    <PolicySection title='1. Digital services only'>
      <p>
        DevTinder is an online networking and matching platform for developers. We provide digital services only and do
        not sell or ship physical products. No shipping charges apply, and nothing is delivered to a postal address.
      </p>
    </PolicySection>

    <PolicySection title='2. Free features'>
      <p>
        DevTinder's free features (profile, developer feed, connection requests, connections and chat) are available
        online as soon as you create an account and verify your email address.
      </p>
    </PolicySection>

    <PolicySection title='3. Premium delivery'>
      <p>
        The{" "}
        <Link to='/premium' className='link link-primary'>
          Premium
        </Link>{" "}
        upgrade is delivered digitally to your DevTinder account:
      </p>
      <PolicyList
        items={[
          "You choose Premium while logged in to your DevTinder account and complete payment through Razorpay.",
          "Once the payment is confirmed, Premium features are applied to that account. No physical item is sent.",
          "A confirmation is sent to the email address registered on your account.",
          "Premium is expected to activate immediately after payment is confirmed, and at most within 24 hours.",
          "Premium lasts for 30 days from activation and does not renew automatically. If a payment is still being confirmed by your bank, Premium activates automatically once it is confirmed.",
        ]}
      />
    </PolicySection>

    <PolicySection title='4. Delivery problems'>
      <p>
        If Premium has not been applied to your account within the expected time after a confirmed payment, contact us
        through the{" "}
        <Link to='/contact' className='link link-primary'>
          Contact Us
        </Link>{" "}
        page with your account email and payment reference. If it cannot be resolved, the{" "}
        <Link to='/refund-and-cancellation' className='link link-primary'>
          Refund and Cancellation Policy
        </Link>{" "}
        will apply.
      </p>
    </PolicySection>

    <PolicySection title='5. Service availability'>
      <p>
        DevTinder is available online wherever the website can be accessed. Occasional downtime for maintenance or
        technical issues may delay access to features. Premium is offered in India only, with payments in Indian rupees
        (₹).
      </p>
    </PolicySection>
  </PolicyLayout>
);

export default ShippingPolicy;
