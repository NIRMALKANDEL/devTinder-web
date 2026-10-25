import React from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { PolicyList, PolicySection } from "./PolicyLayout";
import { CONTACT } from "../utils/constants";

// Added: public Terms and Conditions page (/terms-and-conditions)
const TermsAndConditions = () => (
  <PolicyLayout title='Terms and Conditions'>
    <PolicySection title='1. About these terms'>
      <p>
        These Terms and Conditions ("Terms") govern your use of DevTinder, a networking and matching platform for
        software developers, available at projectdev.in (the "Platform"). DevTinder is operated by {CONTACT.name}, Indore,
        Madhya Pradesh, India.
      </p>
      <p>
        By creating an account or using the Platform, you agree to these Terms and to our{" "}
        <Link to='/privacy-policy' className='link link-primary'>
          Privacy Policy
        </Link>
        . If you do not agree, please do not use DevTinder.
      </p>
    </PolicySection>

    <PolicySection title='2. Eligibility'>
      <PolicyList
        items={[
          "You must be at least 18 years old to create an account.",
          "You must be able to enter into a binding agreement under the laws that apply to you.",
          "You may not use DevTinder if your account was previously removed for breaking these Terms.",
        ]}
      />
    </PolicySection>

    <PolicySection title='3. Your account'>
      <PolicyList
        items={[
          "Provide accurate information when you sign up and keep your profile up to date.",
          "Verify your email address using the link we send you. Unverified accounts cannot log in.",
          "Keep your password confidential. You are responsible for activity that happens under your account.",
          "One person may hold one account. Accounts may not be shared, sold or transferred.",
          "You can delete your account at any time from Settings.",
        ]}
      />
    </PolicySection>

    <PolicySection title='4. Your responsibilities and acceptable use'>
      <p>DevTinder is for genuine professional networking between developers. When using the Platform, you agree not to:</p>
      <PolicyList
        items={[
          "Impersonate another person or misrepresent your identity, skills or experience.",
          "Harass, threaten, abuse, discriminate against or send unwanted sexual content to other users.",
          "Send spam, unsolicited advertising, chain messages or bulk connection requests.",
          "Share content that is illegal, infringing, defamatory, obscene or harmful.",
          "Collect other users' personal data, or scrape, crawl or copy the Platform by automated means.",
          "Attempt to break, overload or gain unauthorised access to the Platform, its servers or other accounts.",
          "Upload malware or links intended to deceive or harm others.",
          "Use DevTinder for any unlawful purpose.",
        ]}
      />
      <p>
        You can block or report a user from the "..." menu on their profile card. Reports may be reviewed and can lead to action against
        the reported account.
      </p>
    </PolicySection>

    <PolicySection title='5. Content you share'>
      <p>
        You keep ownership of the content you add to DevTinder, such as your profile details, photo link, skills,
        links and messages. By posting it, you give DevTinder a non-exclusive, royalty-free licence to store, display
        and process that content only as needed to run and improve the Platform (for example, showing your profile to
        other developers in the feed).
      </p>
      <p>You are responsible for the content you share and confirm that you have the right to share it.</p>
    </PolicySection>

    <PolicySection title='6. Service limitations'>
      <PolicyList
        items={[
          'DevTinder is provided "as is" and "as available". We do not guarantee that the Platform will be uninterrupted, error-free or always available.',
          "We do not verify every user's identity, skills or claims, and we do not guarantee any connection, collaboration, job or outcome.",
          "You are responsible for your interactions with other users, on and off the Platform. Use your judgement before sharing personal information or meeting anyone.",
          "Features may be added, changed or removed over time.",
        ]}
      />
    </PolicySection>

    <PolicySection title='7. Premium'>
      <p>
        DevTinder Premium is an optional, paid upgrade described on the{" "}
        <Link to='/premium' className='link link-primary'>
          Premium
        </Link>{" "}
        page, where the current price and duration are shown before you pay.
      </p>
      <PolicyList
        items={[
          "Premium is a one-time payment in Indian rupees (₹) for a fixed number of days. It does not renew automatically. Buying again while Premium is active adds the new days to your current end date.",
          "Payments are processed by Razorpay. Premium is activated only after the payment is confirmed.",
          "Premium is currently offered in India only and applies to the DevTinder account used to buy it. It can't be transferred.",
          "Premium benefits are: daily developer recommendations, being shown earlier in other users' feeds, and starting video calls with your connections. Premium does not guarantee any connection or outcome.",
          "Features may change over time. If a Premium benefit is removed while you have active Premium, we will tell you and offer a fair remedy.",
        ]}
      />
      <p>
        Refunds and cancellations are covered by the{" "}
        <Link to='/refund-and-cancellation' className='link link-primary'>
          Refund and Cancellation Policy
        </Link>
        .
      </p>
    </PolicySection>

    <PolicySection title='8. Calls'>
      <PolicyList
        items={[
          "You can call only your accepted connections. Audio calls are available to all users; starting a video call requires active Premium.",
          "The other person must accept a call. Do not call repeatedly after someone declines or ignores you.",
          "Do not record, screenshot or share another person's call without their consent, and do not use calls for harassment, explicit content or anything else these Terms prohibit.",
          "Call quality depends on your device and network, and calls may not connect on every network.",
        ]}
      />
    </PolicySection>

    <PolicySection title='9. Intellectual property'>
      <p>
        The DevTinder name, logo, design, software and other Platform materials (excluding content provided by users)
        belong to DevTinder or its licensors. You may not copy, modify, distribute or reverse engineer them without
        written permission, except as allowed by law.
      </p>
    </PolicySection>

    <PolicySection title='10. Suspension and termination'>
      <p>
        You may stop using DevTinder and delete your account at any time from Settings. We may suspend or remove an
        account, or limit access to features, if it breaks these Terms, puts other users at risk, or if required by
        law. Where reasonable, we will tell you why.
      </p>
    </PolicySection>

    <PolicySection title='11. Limitation of liability'>
      <p>
        To the extent permitted by law, DevTinder is not liable for indirect or consequential losses, or for the
        conduct of other users. Nothing in these Terms limits any rights you have that cannot be limited by law.
      </p>
    </PolicySection>

    <PolicySection title='12. Governing law'>
      <p>
        These Terms are governed by the laws of India, and disputes are subject to the exclusive jurisdiction
        of the courts in Indore, Madhya Pradesh.
      </p>
    </PolicySection>

    <PolicySection title='13. Changes to these terms'>
      <p>
        We may update these Terms from time to time. The "Last updated" date at the top shows the latest version.
        Continuing to use DevTinder after a change means you accept the updated Terms.
      </p>
    </PolicySection>

    <PolicySection title='14. Contact'>
      <p>
        Questions about these Terms? See the{" "}
        <Link to='/contact' className='link link-primary'>
          Contact Us
        </Link>{" "}
        page.
      </p>
    </PolicySection>
  </PolicyLayout>
);

export default TermsAndConditions;
