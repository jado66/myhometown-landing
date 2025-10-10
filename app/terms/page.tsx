import { MainLayout } from "@/layout/main-layout";
import Container from "@/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <MainLayout>
      <Container>
        <div className="py-16 md:py-24 max-w-4xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Terms of Service
              </CardTitle>
              <p className="text-gray-600">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using the myHometown Utah website and
                  services, you agree to be bound by these Terms of Service. If
                  you do not agree to these terms, please do not use our
                  services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Our Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  myHometown Utah provides information and coordination services
                  for Community Resource Centers (CRCs) throughout Utah. Our
                  services include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Information about free classes, programs, and resources at
                    CRCs
                  </li>
                  <li>Class registration and enrollment assistance</li>
                  <li>Community event notifications and updates</li>
                  <li>Volunteer coordination and opportunities</li>
                  <li>Newsletter subscriptions for local community news</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  User Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  When using our services, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Provide accurate and complete information when registering
                    for classes or subscribing to newsletters
                  </li>
                  <li>
                    Attend registered classes and notify us of any cancellations
                    in advance
                  </li>
                  <li>
                    Respect CRC facilities, staff, instructors, and other
                    participants
                  </li>
                  <li>
                    Follow all rules and guidelines set by individual CRCs and
                    program instructors
                  </li>
                  <li>
                    Use our services for lawful purposes only and in a manner
                    that does not harm others
                  </li>
                  <li>
                    Keep your contact information updated to receive important
                    communications
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Class Registration and Attendance
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Registration
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Class registration is typically on a first-come,
                      first-served basis. Registration does not guarantee a spot
                      until confirmed by the CRC or instructor.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Attendance
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Regular attendance is expected. Excessive absences may
                      result in removal from the program to make space for
                      others on waiting lists.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Cancellations
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Classes may be cancelled due to low enrollment, instructor
                      availability, or unforeseen circumstances. We will notify
                      registered participants as soon as possible.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Volunteer Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Volunteer opportunities are subject to background checks and
                  approval processes as required by individual CRCs and
                  programs. Volunteers are expected to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Complete required training and orientation programs</li>
                  <li>Maintain confidentiality of participant information</li>
                  <li>
                    Report any incidents or concerns to appropriate staff
                    members
                  </li>
                  <li>
                    Commit to scheduled volunteer times and provide advance
                    notice of unavailability
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The content on our website, including text, graphics, logos,
                  and images, is owned by myHometown Utah or our content
                  suppliers and is protected by copyright and other intellectual
                  property laws. You may not use this content without our
                  written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibent text-gray-900 mb-4">
                  Disclaimer of Warranties
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are provided "as is" without warranties of any
                  kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    The availability or continuity of classes and programs
                  </li>
                  <li>The accuracy of all information on our website</li>
                  <li>
                    That our services will meet all your specific needs or
                    expectations
                  </li>
                  <li>Uninterrupted access to our website or services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  myHometown Utah shall not be liable for any direct, indirect,
                  incidental, special, or consequential damages arising from
                  your use of our services or participation in CRC programs.
                  This includes, but is not limited to, damages for loss of
                  data, loss of income, or personal injury.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Privacy and Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our{" "}
                  <Link
                    href="/privacy"
                    className="text-[#318d43] hover:underline font-semibold"
                  >
                    Privacy Policy
                  </Link>{" "}
                  to understand how we collect, use, and protect your personal
                  information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to terminate or suspend access to our
                  services at any time, without prior notice, for conduct that
                  we believe violates these Terms of Service or is harmful to
                  other users, us, or third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may revise these Terms of Service at any time without
                  notice. By continuing to use our services after changes are
                  posted, you agree to be bound by the revised terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service are governed by the laws of the State
                  of Utah, United States. Any disputes arising from these terms
                  shall be resolved in the courts of Utah.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us:
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
            </CardContent>
          </Card>
        </div>
      </Container>
    </MainLayout>
  );
}
