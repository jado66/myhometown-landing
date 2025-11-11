export const FIELD_TYPES = {
  text: "text",
  email: "email",
  tel: "tel",
  textarea: "textarea",
  select: "select",
  checkbox: "checkbox",
  date: "date",
  address: "address",
  signature: "signature",
  infoDialog: "infoDialog",
  externalLink: "externalLink",
  dayOfService: "dayOfService",
  whoAreYou: "whoAreYou",
  minorVolunteers: "minorVolunteers",
  volunteerHours: "volunteerHours",
  header: "header",
  staticText: "staticText",
  divider: "divider",
  bannerImage: "bannerImage",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export type AddressSubField = {
  id: string;
  type: "text";
  label: string;
  required: boolean;
  placeholder?: string;
};
