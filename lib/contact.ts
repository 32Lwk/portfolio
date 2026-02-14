import contactData from "@/content/about/contact.json";

export interface ContactLink {
  name: string;
  href: string;
  icon: "Github" | "Linkedin" | "Instagram" | "Mail" | string;
}

export interface ContactData {
  socialLinks: ContactLink[];
  formUrl: string;
}

export function getContact(): ContactData {
  return contactData as ContactData;
}
