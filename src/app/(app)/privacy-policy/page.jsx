import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 py-12 px-4 sm:px-8 lg:px-16 text-gray-800">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-3xl p-8 sm:p-12 border border-pink-100">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-pink-600 mb-8">
          TinyGiggle Privacy Policy
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Last updated: <strong>October 2025</strong>
        </p>

        <section className="space-y-6">
          <p>
            TinyGiggle is a mobile application owned and operated by{" "}
            <strong>Softex Solution (a Division of AyeshaSG)</strong> ("we,"
            "us," or "our"). TinyGiggle is designed for parents and legal
            guardians of infants and toddlers (ages 1 month to 4 years),
            enabling them to track developmental milestones, manage routines,
            and share content in a secure and family-oriented community.
          </p>

          <p>
            This Privacy Policy outlines how we collect, use, store, and share
            personal information, and explains the rights of our users. We are
            committed to complying with applicable U.S. privacy laws, including
            the Children’s Online Privacy Protection Act (COPPA), and have
            designed our policies accordingly.
          </p>

          {/* Section 1 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            1. Scope and Acceptance
          </h2>
          <p>
            By accessing or using the TinyGiggle mobile application (“App”), you
            acknowledge that you have read and understood this Privacy Policy
            and consent to the collection, use, and disclosure of your
            information as described herein. This Policy applies solely to the
            TinyGiggle App and not to any third-party services.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            2. Information We Collect
          </h2>
          <p>
            We collect the following categories of information when users
            interact with the App:
          </p>

          <ul className="list-disc list-inside space-y-3 pl-4">
            <li>
              <strong>Personal Information (Parent/Guardian):</strong> Full
              name, email address, authentication details (OTP, biometric data)
            </li>
            <li>
              <strong>Child Profile Data:</strong> Child’s age, birthdate,
              milestones, health-related notes
            </li>
            <li>
              <strong>Media and Content:</strong> Photos, videos, and other
              media voluntarily uploaded by users
            </li>
            <li>
              <strong>Usage Data:</strong> App interactions, device info, IP
              address
            </li>
            <li>
              <strong>Transaction Data:</strong> Purchase history, payment and
              shipping details
            </li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            3. Purpose of Data Collection and Use
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>To provide and maintain TinyGiggle’s core features</li>
            <li>To enable e-commerce transactions through the TinyGiggle Store</li>
            <li>To enhance user experience and app performance through analytics</li>
            <li>To communicate updates, reminders, and security alerts</li>
            <li>To comply with laws and legal obligations</li>
          </ul>

          {/* Section 4 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            4. Data Storage and Third-Party Sharing
          </h2>
          <p>
            All user data, including uploaded media, is securely stored on{" "}
            <strong>Contabo</strong> cloud servers using encrypted protocols. We
            do not sell or lease user data. Limited information may be shared
            with service providers for delivery, communication, and payment
            processing only.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            5. Data Security Measures
          </h2>
          <p>
            We use industry-standard safeguards to protect your data from
            unauthorized access or loss.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>OTP verification and biometric login</li>
            <li>Encrypted data at rest and in transit</li>
            <li>Access restricted to authorized personnel</li>
          </ul>

          {/* Section 6 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            6. User Rights and Data Management
          </h2>
          <p>
            As a parent or guardian, you can request to access, update, or
            delete your data by contacting us at{" "}
            <a
              href="mailto:info@tinygiggle.com"
              className="text-pink-500 underline"
            >
              info@tinygiggle.com
            </a>
            . Identity verification will be required.
          </p>

          {/* Section 7 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            7. Children’s Privacy Compliance (COPPA)
          </h2>
          <p>
            TinyGiggle is not for direct use by children under 13. We do not
            collect data directly from children, and all child-related
            information is managed by parents or guardians only. If we learn
            that data from a child was collected without parental consent, it
            will be deleted immediately.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            8. TinyGiggle Store Privacy
          </h2>
          <p>
            The TinyGiggle Store includes only admin-uploaded products. All
            payments are securely processed via trusted gateways, and financial
            data is never stored locally.
          </p>

          {/* Section 9 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            9. International Data Transfers
          </h2>
          <p>
            User data may be stored in the U.S. or EU. We apply appropriate
            safeguards for cross-border privacy compliance.
          </p>

          {/* Section 10 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            10. Updates to This Privacy Policy
          </h2>
          <p>
            We may update this Policy periodically. Major updates will be
            notified in-app or via email. Continued use after updates implies
            acceptance.
          </p>

          {/* Section 11 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            11. Contact Information
          </h2>
          <p>
            <strong>Softex Solution (Division of AyeshaSG)</strong>
            <br />
            Email:{" "}
            <a
              href="mailto:support@tinygiggle.com"
              className="text-pink-500 underline"
            >
              support@tinygiggle.com
            </a>
            <br />
            Address: 3050, Manhattan, Kansas 66506, USA
          </p>

          <p className="mt-10 text-center text-gray-600 italic">
            By using the TinyGiggle app, you consent to the data practices
            outlined in this Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
}
