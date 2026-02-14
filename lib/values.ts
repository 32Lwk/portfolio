import valuesData from "@/content/about/values.json";

export interface ValuesItem {
  icon: "Shield" | "Code" | "Users";
  title: string;
  description: string;
}

export interface ValuesData {
  motto: string;
  mottoDescription: string;
  items: ValuesItem[];
  careerShortTerm: string;
  careerLongTerm: string;
}

export function getValues(): ValuesData {
  return valuesData as ValuesData;
}
