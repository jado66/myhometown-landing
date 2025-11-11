export type Semester = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  archived?: boolean;
  classes: Class[];
};

export type Class = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  meetings: Meeting[];
  location: string;
  capacity?: number;
  enrolled?: number;
  waitlistEnabled?: boolean;
  categoryId?: string;
  teacher?: string;
  semesterId: string;
  signupForm: SignupForm;
  bannerImage?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Meeting = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
};

export type SignupForm = {
  fields: FormField[];
};

export type FormField = {
  id: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "textarea"
    | "select"
    | "checkbox"
    | "date"
    | "address"
    | "signature"
    | "infoDialog"
    | "externalLink"
    | "dayOfService"
    | "whoAreYou"
    | "minorVolunteers"
    | "volunteerHours"
    | "header"
    | "staticText"
    | "divider"
    | "bannerImage";

  url?: string;
  label: string;
  required: boolean;
  helpText?: string;
  content?: string;
  options?: string[];
  subFields?: FormField[];
};
