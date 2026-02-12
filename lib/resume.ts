import { getAllProjects } from "./projects";
import { getAllSkills } from "./skills";
import { getCertifications } from "./certifications";

export interface ResumeData {
  personalInfo: {
    name: string;
    nameEn: string;
    title: string;
    email: string;
    github: string;
    linkedin: string;
  };
  education: Array<{
    period: string;
    institution: string;
    description: string;
  }>;
  career: Array<{
    period: string;
    title: string;
    description: string;
  }>;
  projects: ReturnType<typeof getAllProjects>;
  skills: ReturnType<typeof getAllSkills>;
  certifications: string[];
  languages: Array<{
    name: string;
    level: string;
  }>;
}

export function getResumeData(): ResumeData {
  return {
    personalInfo: {
      name: "川嶋宥翔",
      nameEn: "Kawashima Yuto",
      title: "名古屋大学 理学部物理学科 2年生 / フルスタックエンジニア",
      email: "kawashima.yuto.c2@s.mail.nagoya-u.ac.jp",
      github: "https://github.com/32Lwk",
      linkedin: "https://www.linkedin.com/in/kawashimayuto/",
    },
    education: [
      {
        period: "2024年 - 現在",
        institution: "名古屋大学 理学部物理学科",
        description: "2028年3月卒業予定",
      },
      {
        period: "2021年 - 2024年",
        institution: "和歌山県立向陽高等学校",
        description: "",
      },
      {
        period: "2018年 - 2021年",
        institution: "和歌山県立向陽中学校",
        description: "中学受験",
      },
      {
        period: "2012年 - 2018年",
        institution: "鳥屋城小学校",
        description: "",
      },
    ],
    career: [
      {
        period: "2024年4月 - 継続中",
        title: "マツモトキヨシ（登録販売者）",
        description: "登録販売者として勤務。高齢者とのコミュニケーション、言語の壁、人手不足などの課題を現場で経験し、これが後の医薬品相談ツール開発の動機となった。",
      },
      {
        period: "2025年4月 - 継続中",
        title: "チャット型医薬品相談ツール（β版）開発",
        description: "ドラッグストアでの現場経験を踏まえ、医療×AI分野での個人開発プロジェクトを開始。要件定義から設計・開発・運用まで一貫して担当。",
      },
    ],
    projects: getAllProjects(),
    skills: getAllSkills(),
    certifications: getCertifications(),
    languages: [
      { name: "日本語", level: "ネイティブ" },
      { name: "英語", level: "中級" },
    ],
  };
}
