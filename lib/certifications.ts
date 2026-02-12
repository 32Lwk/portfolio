import certificationsData from "@/content/about/certifications.json";

/** 取得資格（正式名称）の一覧 */
export function getCertifications(): string[] {
  return certificationsData as string[];
}
