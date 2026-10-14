import React from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { PolicyList, PolicyNotice, PolicySection } from "./PolicyLayout";
import { CONTACT } from "../utils/constants";

// Added: public Refund and Cancellation Policy page (/refund-and-cancellation)
const RefundPolicy = () => (
  <PolicyLayout title='Refund and Cancellation Policy'>
    <PolicyNotice title='Payments are not live yet'>
      DevTinder does not currently accept payments, and no payment gateway is connected. Premium cannot be purchased
      today, so no charges or refunds can occur at this time. This policy describes how refunds and cancellations are
      intended to work once the planned Premium offering launches.
    </PolicyNotice>

    <PolicySection title='1. Scope'>
      <p>
        This policy will apply to the planned{" "}
        <Link to='/premium' className='link link-primary'>
          DevTinder Premium
        </Link>{" "}
        offering: a one-time payment for a 30-day digital upgrade to your DevTinder account. Premium is planned to be
        offered in India only, with payments in Indian rupees (₹). Using DevTinder's free features
        involves no payment and is not covered by this policy.
      </p>
    </PolicySection>

    <PolicySection title='2. Nature of the purchase'>
      <PolicyList
        items={[
          "Premium is planned as a one-time digital purchase, not a recurring subscription. It does not renew automatically, so there is nothing to cancel.",
          "Each purchase gives 30 days of Premium from the time it is activated.",
          "Premium features are applied to your DevTinder account and are not transferable to another account.",
        ]}
      />
    </PolicySection>

    <PolicySection title='3. Cancellation'>
      <p>
        Because Premium is planned as a one-time purchase, there is no subscription to cancel. If you start a payment
        and do not complete it, no Premium purchase is made.
      </p>
      <p>
        Premium is applied to your account as soon as payment is confirmed, so a purchase cannot be cancelled after a
        successful payment. The refund cases below still apply.
      </p>
    </PolicySection>

    <PolicySection title='4. Refund eligibility'>
      <p>Refunds are not given for a change of mind. A refund will only be considered if:</p>
      <PolicyList
        items={[
          "You were charged but Premium was not applied to your account, and our support team could not resolve this.",
          "You were charged more than once for the same purchase (see Duplicate charges).",
        ]}
      />
      <p>Refunds will not be given if:</p>
      <PolicyList
        items={[
          "You change your mind after purchase.",
          "Premium features have already been used.",
          "Your account was suspended or removed for breaking the Terms and Conditions.",
          "The request is made after the deadline in section 7.",
        ]}
      />
    </PolicySection>

    <PolicySection title='5. Failed payments'>
      <p>
        If a payment fails, Premium will not be applied. If money was deducted from your account for a failed payment,
        it is usually reversed automatically by your bank or payment provider. If it has not been reversed within 5–7
        business days, please contact us with the payment details listed in section 7.
      </p>
    </PolicySection>

    <PolicySection title='6. Duplicate charges'>
      <p>
        If you are charged more than once for the same Premium purchase, contact us with the payment references. Once
        verified, the extra charge(s) will be refunded in full to the original payment method.
      </p>
    </PolicySection>

    <PolicySection title='7. How to request a refund'>
      <p>
        Email{" "}
        <a href={`mailto:${CONTACT.email}`} className='link link-primary'>
          {CONTACT.email}
        </a>{" "}
        (see also{" "}
        <Link to='/contact' className='link link-primary'>
          Contact Us
        </Link>
        ), including:
      </p>
      <PolicyList
        items={[
          "The email address of your DevTinder account.",
          "The payment date and amount.",
          "The transaction or order reference from your payment confirmation.",
          "The reason for your request.",
        ]}
      />
      <p>
        Refund requests must be made within 7 days of the payment date.
      </p>
    </PolicySection>

    <PolicySection title='8. Processing timelines'>
      <PolicyList
        items={[
          <>
            We aim to review requests within 3–5 business days and will tell you the outcome by email.
          </>,
          <>
            Approved refunds are returned to the original payment method. Refunds are expected to reach you within 5–7
            business days after approval, depending on your bank or payment provider.
          </>,
          "If Premium is refunded, Premium features will be removed from your account.",
        ]}
      />
    </PolicySection>

    <PolicySection title='9. Changes to this policy'>
      <p>
        This policy will be finalised before Premium becomes available for purchase. The "Last updated" date at the top
        shows the latest version.
      </p>
    </PolicySection>
  </PolicyLayout>
);

export default RefundPolicy;
