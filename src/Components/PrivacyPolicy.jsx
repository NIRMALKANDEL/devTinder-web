import React from "react";
import { Link } from "react-router-dom";
import PolicyLayout, { PolicyList, PolicySection } from "./PolicyLayout";
import { CONTACT } from "../utils/constants";

// Added: public Privacy Policy page (/privacy-policy)
const PrivacyPolicy = () => (
  <PolicyLayout title='Privacy Policy'>
    <PolicySection title='1. Overview'>
      <p>
        This Privacy Policy explains what information DevTinder ("we", "us") collects when you use projectdev.in, how
        we use it, and the choices you have. DevTinder is operated by {CONTACT.name}, Indore,
        Madhya Pradesh, India.
      </p>
    </PolicySection>

    <PolicySection title='2. Information we collect'>
      <p>
        <strong>Account information</strong> you give us when you sign up: first and last name, email address and
        password. Passwords are stored only in hashed form and are never shown back to you or other users.
      </p>
      <p>
        <strong>Profile information</strong> you choose to add: age, gender, a photo link, an "about" section, skills,
        and portfolio and GitHub links. Your profile is shown to other DevTinder users so they can discover and connect
        with you.
      </p>
      <p>
        <strong>Activity on the Platform</strong>: connection requests you send, accept or decline (interested /
        ignored), your connections, chat messages you exchange with connections, users you block, and reports you
        submit about other users.
      </p>
      <p>
        <strong>Technical information</strong>: basic information your browser sends with each request (such as IP
        address, browser type and request time), which may be recorded in server logs and used for security, for
        example rate limiting and abuse prevention.
      </p>
      <p>
        <strong>Premium payments</strong>: payments are handled by Razorpay. We do not collect or store your card, UPI
        or bank details. We keep the Razorpay order and payment references, the amount, the plan, the payment status
        and dates, and your Premium end date.
      </p>
      <p>
        <strong>Calls</strong>: to connect a call we process who is calling whom, the call type (audio or video) and
        technical connection details. Calls are never recorded, and we do not store call audio, video or call history.
        Calls go directly between the two devices where possible, so the other person's device can see your network
        (IP) address; on some networks the call is relayed through a TURN relay server instead. Your phone number is
        never used or shared for calls.
      </p>
    </PolicySection>

    <PolicySection title='3. Cookies and local storage'>
      <PolicyList
        items={[
          'Login cookie: when you log in we set a secure, HTTP-only cookie named "token" that keeps you signed in. It expires after one day or when you log out.',
          "Preferences: your chosen theme (colour skin and light/dark mode) is saved in your browser's local storage so it stays the same on your next visit.",
          "We do not use advertising cookies or any analytics or tracking tools.",
        ]}
      />
      <p>
        If you block cookies, you will not be able to stay logged in.
      </p>
    </PolicySection>

    <PolicySection title='4. How we use your information'>
      <PolicyList
        items={[
          "To create and manage your account, including email verification and password resets.",
          "To show your profile to other developers and show you relevant profiles in your feed.",
          "To deliver connection requests and chat messages, and to connect calls between connections.",
          "To process Premium payments, activate Premium, and handle refunds and payment disputes.",
          "To send service emails, such as verification links, password resets, and notifications about requests and new connections.",
          "To keep DevTinder safe: blocking, handling reports, preventing spam and abuse, and securing accounts.",
          "To fix problems and improve the Platform.",
        ]}
      />
      <p>We do not sell your personal information.</p>
    </PolicySection>

    <PolicySection title='5. Storage and service providers'>
      <p>
        Your data is stored and processed by the following third-party providers on our behalf. They process data only
        to provide their services to us.
      </p>
      <PolicyList
        items={[
          "MongoDB Atlas: database where account, profile, connection and chat data is stored (Mumbai, India region).",
          "Amazon Web Services (AWS): servers that run the Platform, and Amazon SES for sending service emails.",
          "Cloudflare: domain name service, network security and content delivery.",
          "Razorpay: processes Premium payments. Razorpay handles your payment details under its own privacy policy.",
          "A TURN relay server, used only when a call can't connect directly between devices. It forwards encrypted call audio/video and does not record it.",
        ]}
      />
    </PolicySection>

    <PolicySection title='6. Sharing your information'>
      <PolicyList
        items={[
          "With other users: your profile information is visible to other logged-in users. Chat messages are visible to you and the person you are chatting with.",
          "With service providers, as described above.",
          "When required by law, or to protect the rights, safety and security of our users or the Platform.",
        ]}
      />
    </PolicySection>

    <PolicySection title='7. Data retention'>
      <p>
        We keep your information for as long as your account is active. When you delete your account from Settings,
        your profile is deleted along with your connection requests, your chats and their messages, and reports you
        submitted, and you are removed from other users' block lists.
      </p>
      <PolicyList
        items={[
          "Server logs are kept for up to 90 days.",
          "Backups are overwritten within 30 days, so deleted data is removed from backups within that time.",
          "Reports that other users filed about a deleted account may be kept for up to 6 months for safety reasons.",
          "Payment records are kept even after you delete your account, for as long as needed for accounting, tax, refund and dispute purposes.",
        ]}
      />
    </PolicySection>

    <PolicySection title='8. Security'>
      <p>
        We use reasonable measures to protect your information, including encrypted connections (HTTPS), hashed
        passwords, HTTP-only login cookies, time-limited one-time password-reset links and rate limiting. No system is
        completely secure, so please use a strong, unique password and keep it private.
      </p>
    </PolicySection>

    <PolicySection title='9. Your choices and rights'>
      <PolicyList
        items={[
          "Access and update your profile at any time from the Profile page.",
          "Change your password from Settings.",
          "Block or report users you do not want to interact with.",
          "Delete your account and associated data from Settings.",
          "Contact us to ask questions about, or request a copy or correction of, your personal data.",
        ]}
      />
      <p>
        Depending on where you live, you may have further rights under applicable data-protection law. For privacy
        concerns or complaints, contact our grievance officer, {CONTACT.name}, at{" "}
        <a href={`mailto:${CONTACT.email}`} className='link link-primary'>
          {CONTACT.email}
        </a>
        .
      </p>
    </PolicySection>

    <PolicySection title="10. Children's privacy">
      <p>DevTinder is only for people aged 18 and over. We do not knowingly collect data from anyone under 18.</p>
    </PolicySection>

    <PolicySection title='11. Changes to this policy'>
      <p>
        We may update this Privacy Policy from time to time. The "Last updated" date at the top shows the latest
        version.
      </p>
    </PolicySection>

    <PolicySection title='12. Contact'>
      <p>
        For privacy questions or requests, see the{" "}
        <Link to='/contact' className='link link-primary'>
          Contact Us
        </Link>{" "}
        page.
      </p>
    </PolicySection>
  </PolicyLayout>
);

export default PrivacyPolicy;
