"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CITIES = [
  "Layton",
  "Ogden",
  "Orem",
  "Provo",
  "Salt Lake City",
  "Santaquin",
  "West Valley City",
];

const VOLUNTEER_INTERESTS = [
  "Neighborhood Clean-ups",
  "Landscape Renewal",
  "Home Repairs",
  "Community Beautification",
  "Teaching Classes",
  "Event Coordination",
  "Administrative Support",
  "Photography/Videography",
  "Translation Services",
  "Youth Mentoring",
];

const SKILLS = [
  "Carpentry",
  "Painting",
  "Landscaping",
  "Plumbing",
  "Electrical Work",
  "General Handyman",
  "Teaching/Tutoring",
  "Event Planning",
  "Marketing/Communications",
  "Graphic Design",
  "Photography",
  "Bilingual",
  "First Aid/CPR Certified",
  "Heavy Equipment Operation",
];

export function VolunteerForm() {
  const [selectedCity, setSelectedCity] = useState("");
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToWaiver || !agreedToTerms) {
      alert("Please agree to the waiver and terms & conditions to continue.");
      return;
    }
    // Handle form submission
    console.log("[v0] Form submitted");
    alert(
      "Thank you for registering! We will contact you soon with volunteer opportunities."
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* City Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your City</CardTitle>
          <CardDescription>
            Choose the city where you'd like to volunteer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              required
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input id="dateOfBirth" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How can we reach you?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" type="tel" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input id="address" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city-address">City *</Label>
              <Input id="city-address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" defaultValue="Utah" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input id="zip" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
            <RadioGroup defaultValue="email">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="contact-email" />
                <Label htmlFor="contact-email" className="font-normal">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="contact-phone" />
                <Label htmlFor="contact-phone" className="font-normal">
                  Phone
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="contact-text" />
                <Label htmlFor="contact-text" className="font-normal">
                  Text Message
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>
            Someone we can contact in case of emergency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Full Name *</Label>
              <Input id="emergencyName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Relationship *</Label>
              <Input
                id="emergencyRelationship"
                placeholder="e.g., Spouse, Parent, Sibling"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number *</Label>
              <Input id="emergencyPhone" type="tel" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyEmail">Email Address</Label>
              <Input id="emergencyEmail" type="email" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>
            When are you available to volunteer?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Days Available (select all that apply) *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox id={`day-${day}`} />
                  <Label htmlFor={`day-${day}`} className="font-normal">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Time of Day (select all that apply) *</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="time-morning" />
                <Label htmlFor="time-morning" className="font-normal">
                  Morning (6am - 12pm)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="time-afternoon" />
                <Label htmlFor="time-afternoon" className="font-normal">
                  Afternoon (12pm - 5pm)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="time-evening" />
                <Label htmlFor="time-evening" className="font-normal">
                  Evening (5pm - 9pm)
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">How often can you volunteer? *</Label>
            <Select required>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
                <SelectItem value="one-time">One-time events only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursPerWeek">Hours per week you can commit</Label>
            <Select>
              <SelectTrigger id="hoursPerWeek">
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 hours</SelectItem>
                <SelectItem value="3-5">3-5 hours</SelectItem>
                <SelectItem value="6-10">6-10 hours</SelectItem>
                <SelectItem value="10+">10+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Interests</CardTitle>
          <CardDescription>
            Help us match you with the right opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Volunteer Interests (select all that apply) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VOLUNTEER_INTERESTS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox id={`interest-${interest}`} />
                  <Label
                    htmlFor={`interest-${interest}`}
                    className="font-normal"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Skills & Certifications (select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SKILLS.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox id={`skill-${skill}`} />
                  <Label htmlFor={`skill-${skill}`} className="font-normal">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalSkills">
              Additional Skills or Experience
            </Label>
            <Textarea
              id="additionalSkills"
              placeholder="Tell us about any other skills, experience, or qualifications you have..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Experience</CardTitle>
          <CardDescription>
            Tell us about your volunteer background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="previousVolunteer">
              Have you volunteered before? *
            </Label>
            <RadioGroup defaultValue="no">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="volunteer-yes" />
                <Label htmlFor="volunteer-yes" className="font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="volunteer-no" />
                <Label htmlFor="volunteer-no" className="font-normal">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="volunteerExperience">
              Previous Volunteer Experience
            </Label>
            <Textarea
              id="volunteerExperience"
              placeholder="Describe your previous volunteer experience, organizations you've worked with, and roles you've held..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whyVolunteer">
              Why do you want to volunteer with myHometown? *
            </Label>
            <Textarea
              id="whyVolunteer"
              placeholder="Share your motivation for volunteering..."
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Capabilities</CardTitle>
          <CardDescription>
            Help us ensure your safety and match you with appropriate tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="physicalLimitations">
              Do you have any physical limitations we should be aware of?
            </Label>
            <RadioGroup defaultValue="no">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="limitations-yes" />
                <Label htmlFor="limitations-yes" className="font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="limitations-no" />
                <Label htmlFor="limitations-no" className="font-normal">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limitationsDetails">If yes, please describe</Label>
            <Textarea
              id="limitationsDetails"
              placeholder="Describe any physical limitations, allergies, or health concerns..."
              rows={3}
            />
          </div>
          <div className="space-y-3">
            <Label>
              Physical Activities (select all you are comfortable with)
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="activity-lifting" />
                <Label htmlFor="activity-lifting" className="font-normal">
                  Heavy lifting (25+ lbs)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="activity-standing" />
                <Label htmlFor="activity-standing" className="font-normal">
                  Standing for extended periods
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="activity-climbing" />
                <Label htmlFor="activity-climbing" className="font-normal">
                  Climbing ladders
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="activity-outdoor" />
                <Label htmlFor="activity-outdoor" className="font-normal">
                  Working outdoors in various weather
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="activity-bending" />
                <Label htmlFor="activity-bending" className="font-normal">
                  Bending and kneeling
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Information */}
      <Card>
        <CardHeader>
          <CardTitle>Background Information</CardTitle>
          <CardDescription>
            Additional information for volunteer placement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employer">Current Employer/School</Label>
            <Input id="employer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation/Field of Study</Label>
            <Input id="occupation" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupVolunteer">
              Are you volunteering as part of a group?
            </Label>
            <RadioGroup defaultValue="no">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="group-yes" />
                <Label htmlFor="group-yes" className="font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="group-no" />
                <Label htmlFor="group-no" className="font-normal">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupName">If yes, group name</Label>
            <Input id="groupName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral">How did you hear about myHometown?</Label>
            <Select>
              <SelectTrigger id="referral">
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friend">Friend or Family</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="event">Community Event</SelectItem>
                <SelectItem value="church">
                  Church/Faith Organization
                </SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Volunteer Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Preferences</CardTitle>
          <CardDescription>
            Help us personalize your volunteer experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamPreference">
              Do you prefer to work alone or in a team?
            </Label>
            <RadioGroup defaultValue="team">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alone" id="pref-alone" />
                <Label htmlFor="pref-alone" className="font-normal">
                  Alone
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="pref-team" />
                <Label htmlFor="pref-team" className="font-normal">
                  Team
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="either" id="pref-either" />
                <Label htmlFor="pref-either" className="font-normal">
                  Either
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadershipInterest">
              Are you interested in leadership opportunities?
            </Label>
            <RadioGroup defaultValue="no">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="leader-yes" />
                <Label htmlFor="leader-yes" className="font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="leader-no" />
                <Label htmlFor="leader-no" className="font-normal">
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maybe" id="leader-maybe" />
                <Label htmlFor="leader-maybe" className="font-normal">
                  Maybe in the future
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tshirtSize">
              T-Shirt Size (for volunteer events)
            </Label>
            <Select>
              <SelectTrigger id="tshirtSize">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xs">XS</SelectItem>
                <SelectItem value="s">S</SelectItem>
                <SelectItem value="m">M</SelectItem>
                <SelectItem value="l">L</SelectItem>
                <SelectItem value="xl">XL</SelectItem>
                <SelectItem value="2xl">2XL</SelectItem>
                <SelectItem value="3xl">3XL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalComments">
              Additional Comments or Questions
            </Label>
            <Textarea
              id="additionalComments"
              placeholder="Is there anything else you'd like us to know?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Waiver and Terms */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Volunteer Waiver & Release</CardTitle>
          <CardDescription>
            Please read carefully and agree to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg space-y-4 text-sm leading-relaxed max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-base text-foreground">
              ASSUMPTION OF RISK AND WAIVER OF LIABILITY
            </h3>

            <p className="text-muted-foreground">
              I understand that volunteering with myHometown Utah may involve
              physical activities including but not limited to: lifting,
              carrying, painting, landscaping, construction work, and other
              manual labor tasks. I acknowledge that these activities carry
              inherent risks of injury.
            </p>

            <h4 className="font-semibold text-foreground">
              Assumption of Risk
            </h4>
            <p className="text-muted-foreground">
              I voluntarily assume all risks associated with my participation in
              myHometown volunteer activities, including but not limited to:
              physical injury, property damage, exposure to weather conditions,
              and interaction with tools and equipment. I understand that
              myHometown will make reasonable efforts to ensure volunteer safety
              but cannot guarantee a risk-free environment.
            </p>

            <h4 className="font-semibold text-foreground">
              Release of Liability
            </h4>
            <p className="text-muted-foreground">
              In consideration of being permitted to volunteer with myHometown
              Utah, I hereby release, waive, discharge, and covenant not to sue
              myHometown Utah, its officers, employees, volunteers, partner
              organizations, and affiliates from any and all liability, claims,
              demands, actions, and causes of action whatsoever arising out of
              or related to any loss, damage, or injury that may be sustained by
              me or to any property belonging to me while participating in
              volunteer activities.
            </p>

            <h4 className="font-semibold text-foreground">Medical Treatment</h4>
            <p className="text-muted-foreground">
              I authorize myHometown representatives to obtain emergency medical
              treatment for me if necessary. I agree to be financially
              responsible for any medical costs incurred. I understand that
              myHometown does not provide health insurance coverage for
              volunteers.
            </p>

            <h4 className="font-semibold text-foreground">
              Photo/Video Release
            </h4>
            <p className="text-muted-foreground">
              I grant myHometown Utah permission to use photographs, videos, or
              other media containing my likeness for promotional purposes
              including but not limited to: website, social media, newsletters,
              and marketing materials. I understand that I will not receive
              compensation for such use.
            </p>

            <h4 className="font-semibold text-foreground">Code of Conduct</h4>
            <p className="text-muted-foreground">
              I agree to conduct myself in a professional and respectful manner
              while volunteering. I will follow all safety guidelines, respect
              community members and fellow volunteers, and represent myHometown
              positively. I understand that failure to comply may result in
              removal from volunteer activities.
            </p>

            <h4 className="font-semibold text-foreground">Acknowledgment</h4>
            <p className="text-muted-foreground">
              I have read this waiver and release, fully understand its terms,
              and understand that I am giving up substantial rights by signing
              it. I acknowledge that I am signing this agreement freely and
              voluntarily and intend my signature to be a complete and
              unconditional release of all liability to the greatest extent
              allowed by law.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-accent/50 rounded-lg">
            <Checkbox
              id="waiver"
              checked={agreedToWaiver}
              onCheckedChange={(checked) =>
                setAgreedToWaiver(checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="waiver"
              className="font-normal leading-relaxed cursor-pointer"
            >
              I have read and agree to the Volunteer Waiver & Release. I
              understand that I am waiving certain legal rights by agreeing to
              these terms. *
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>
            Volunteer program policies and guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg space-y-4 text-sm leading-relaxed max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-base text-foreground">
              VOLUNTEER PROGRAM TERMS & CONDITIONS
            </h3>

            <h4 className="font-semibold text-foreground">
              1. Volunteer Relationship
            </h4>
            <p className="text-muted-foreground">
              I understand that my participation as a volunteer does not create
              an employment relationship with myHometown Utah. I will not
              receive compensation, benefits, or workers' compensation coverage.
              My volunteer service is at-will and may be terminated by either
              party at any time.
            </p>

            <h4 className="font-semibold text-foreground">
              2. Commitment and Attendance
            </h4>
            <p className="text-muted-foreground">
              I agree to honor my volunteer commitments and provide advance
              notice if I am unable to attend a scheduled volunteer activity. I
              understand that consistent no-shows may result in removal from the
              volunteer program.
            </p>

            <h4 className="font-semibold text-foreground">
              3. Confidentiality
            </h4>
            <p className="text-muted-foreground">
              I agree to maintain confidentiality of any sensitive information I
              may encounter while volunteering, including personal information
              about community members, organizational strategies, or other
              proprietary information.
            </p>

            <h4 className="font-semibold text-foreground">
              4. Safety and Compliance
            </h4>
            <p className="text-muted-foreground">
              I agree to follow all safety protocols, use provided safety
              equipment, and comply with instructions from project leaders. I
              will immediately report any unsafe conditions or injuries. I will
              not volunteer under the influence of alcohol or drugs.
            </p>

            <h4 className="font-semibold text-foreground">
              5. Background Checks
            </h4>
            <p className="text-muted-foreground">
              I understand that certain volunteer positions may require
              background checks. I consent to such checks if required for my
              volunteer role and understand that false information may result in
              removal from the program.
            </p>

            <h4 className="font-semibold text-foreground">
              6. Personal Property
            </h4>
            <p className="text-muted-foreground">
              I understand that myHometown is not responsible for loss, theft,
              or damage to my personal property while volunteering. I will take
              appropriate precautions to secure my belongings.
            </p>

            <h4 className="font-semibold text-foreground">7. Communication</h4>
            <p className="text-muted-foreground">
              I consent to receive communications from myHometown regarding
              volunteer opportunities, program updates, and organizational news
              via email, phone, or text message. I may opt out of communications
              at any time.
            </p>

            <h4 className="font-semibold text-foreground">8. Data Privacy</h4>
            <p className="text-muted-foreground">
              I understand that myHometown will collect and store my personal
              information for volunteer management purposes. This information
              will be kept confidential and used only for program
              administration. I have the right to request access to or deletion
              of my personal data.
            </p>

            <h4 className="font-semibold text-foreground">9. Modifications</h4>
            <p className="text-muted-foreground">
              myHometown reserves the right to modify these terms and conditions
              at any time. Volunteers will be notified of significant changes
              and continued participation constitutes acceptance of modified
              terms.
            </p>

            <h4 className="font-semibold text-foreground">10. Governing Law</h4>
            <p className="text-muted-foreground">
              These terms and conditions shall be governed by the laws of the
              State of Utah. Any disputes shall be resolved in the appropriate
              courts of Utah.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-accent/50 rounded-lg">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) =>
                setAgreedToTerms(checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="font-normal leading-relaxed cursor-pointer"
            >
              I have read and agree to the Terms & Conditions of the myHometown
              volunteer program. *
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto px-12 text-white"
          disabled={!agreedToWaiver || !agreedToTerms}
        >
          Submit Volunteer Application
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Questions? Contact us at{" "}
        <a
          href="mailto:volunteer@myhometownut.com"
          className="text-primary hover:underline"
        >
          volunteer@myhometownut.com
        </a>{" "}
        or call{" "}
        <a href="tel:1234567890" className="text-primary hover:underline">
          (123) 456-7890
        </a>
      </p>
    </form>
  );
}
