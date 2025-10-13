import { Container } from "@/layout/container";

export default function PrivacyPolicy() {
  return (
    <Container>
      <div className="py-16 md:py-24 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-600">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed">
                myHometown Utah is committed to protecting your privacy. We only
                collect information that you voluntarily provide to us through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Class Registration Forms:</strong> When you sign up
                  for classes at Community Resource Centers (CRCs), we collect
                  your name, email address, phone number, and any other
                  information required for class participation.
                </li>
                <li>
                  <strong>Newsletter Subscription:</strong> When you subscribe
                  to our newsletter, we collect your email address and selected
                  city preference to send you relevant community updates.
                </li>
                <li>
                  <strong>Volunteer Applications:</strong> When you apply to
                  volunteer, we may collect contact information and relevant
                  background information necessary for volunteer coordination.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use the information you provide solely for the following
                purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To register you for requested classes and programs</li>
                <li>
                  To communicate with you about class schedules, changes, and
                  updates
                </li>
                <li>
                  To send you newsletter updates about community events and
                  service projects in your selected city
                </li>
                <li>To coordinate volunteer opportunities and activities</li>
                <li>
                  To improve our programs and services based on community needs
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Information Sharing
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties. Your information may only be
                shared with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Community Resource Center staff and instructors for class
                  coordination purposes
                </li>
                <li>
                  Volunteer coordinators when necessary for organizing service
                  projects
                </li>
                <li>
                  Legal authorities if required by law or to protect our rights
                  and safety
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure, and we cannot guarantee
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request access to your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Unsubscribe from our newsletter at any time</li>
                <li>
                  Opt-out of future communications by contacting us directly
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may use cookies to enhance user experience and
                analyze site traffic. These cookies do not collect personal
                information unless you voluntarily provide it through our forms.
                You can disable cookies in your browser settings if you prefer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not directed to children under 13. We do not
                knowingly collect personal information from children under 13.
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us to have
                it removed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this privacy policy or our
                privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:volunteer@myhometownut.com"
                    className="text-[#318d43] hover:underline"
                  >
                    volunteer@myhometownut.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:+1234567890"
                    className="text-[#318d43] hover:underline"
                  >
                    (123) 456-7890
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Container>
  );
}
