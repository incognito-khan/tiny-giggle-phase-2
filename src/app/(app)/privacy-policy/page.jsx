import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 py-12 px-4 sm:px-8 lg:px-16 text-gray-800">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-3xl p-8 sm:p-12 border border-pink-100">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-pink-600 mb-4">
          Tiny Giggle – Privacy Policy
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Effective Date: <strong>April 10, 2026</strong>
        </p>

        <section className="space-y-6">
          <p>
            Welcome to Tiny Giggle ("we," "our," or "us"). Your privacy is
            important to us. This Privacy Policy explains how we collect, use,
            and protect your information when you use our platform ("Platform").
          </p>
          <p>By using Tiny Giggle, you agree to this Privacy Policy.</p>

          {/* Section 1 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            1. Information We Collect
          </h2>
          <p>We may collect the following types of information:</p>

          <h3 className="text-lg font-semibold text-gray-700">
            Personal Information
          </h3>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Account details</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-700">
            Child Information
          </h3>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              Baby's name, age, and growth details (only what you choose to
              provide)
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-700">
            Professional Information (Doctors & Caretakers)
          </h3>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Name, qualifications, and contact details</li>
            <li>Verification and background check information</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-700">
            Usage Information
          </h3>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>How you use the Platform</li>
            <li>Pages visited, features used, and activity data</li>
          </ul>

          {/* Section 2 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Provide and improve our services</li>
            <li>Help you track your baby's growth</li>
            <li>Connect parents with doctors and caretakers</li>
            <li>Verify professionals before allowing access</li>
            <li>Communicate updates, notifications, or support</li>
            <li>Ensure safety and prevent misuse</li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            3. Sharing of Information
          </h2>
          <p>We do not sell your personal information.</p>
          <p>We may share information in the following cases:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              <strong>With Professionals:</strong> When you connect with doctors
              or caretakers
            </li>
            <li>
              <strong>With Service Providers:</strong> To help run and improve
              the Platform
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required by law or
              authorities
            </li>
          </ul>

          {/* Section 4 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            4. Data Protection
          </h2>
          <p>
            We take reasonable steps to protect your information from
            unauthorized access, misuse, or loss.
          </p>
          <p>
            However, no online platform is 100% secure, so we encourage you to
            keep your account details safe.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            5. Children's Privacy
          </h2>
          <p>
            Tiny Giggle is designed for parents. We only collect children's
            information that parents choose to provide.
          </p>
          <p>
            Parents are responsible for ensuring the accuracy and safety of the
            information shared.
          </p>

          {/* Section 6 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            6. Your Rights
          </h2>
          <p>You may:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Access or update your information</li>
            <li>Request deletion of your account</li>
            <li>Stop using the Platform at any time</li>
          </ul>

          {/* Section 7 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            7. Third-Party Services
          </h2>
          <p>
            Tiny Giggle may include links or connections to third-party
            professionals or services.
          </p>
          <p>
            We are not responsible for their privacy practices, so please review
            their policies separately.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            8. Changes to This Policy
          </h2>
          <p>We may update this Privacy Policy from time to time.</p>
          <p>
            Any changes will be posted on the Platform with a new effective
            date.
          </p>

          {/* Section 9 */}
          <h2 className="text-2xl font-semibold text-secondary mt-10">
            9. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, you can contact
            us at:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:support@tinygiggle.com"
              className="text-pink-500 underline"
            >
              support@tinygiggle.com
            </a>
          </p>

          <p className="mt-10 text-center text-gray-600 italic">
            By using the Tiny Giggle platform, you agree to the practices
            described in this Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
}
