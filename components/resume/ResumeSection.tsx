"use client";

import { ResumeData } from "@/lib/resume";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ResumeSectionProps {
  data: ResumeData;
}

export function ResumeSection({ data }: ResumeSectionProps) {
  return (
    <div className="space-y-8">
      {/* 基本情報 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">基本情報</h2>
        <div className="rounded-lg border bg-card p-6">
          <p className="font-semibold">
            {data.personalInfo.name} ({data.personalInfo.nameEn})
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.personalInfo.title}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              <a
                href={`mailto:${data.personalInfo.email}`}
                className="text-primary hover:underline"
              >
                {data.personalInfo.email}
              </a>
            </p>
            <p>
              <span className="font-medium">GitHub:</span>{" "}
              <a
                href={data.personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {data.personalInfo.github}
              </a>
            </p>
            <p>
              <span className="font-medium">LinkedIn:</span>{" "}
              <a
                href={data.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {data.personalInfo.linkedin}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* 学歴 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">学歴</h2>
        <div className="space-y-4">
          {data.education.map((item, index) => (
            <div key={index} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{item.institution}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 職歴 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">職歴</h2>
        <div className="space-y-4">
          {data.career.map((item, index) => (
            <div key={index} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* プロジェクト経験 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">プロジェクト経験</h2>
        <div className="space-y-4">
          {data.projects.map((project) => (
            <div key={project.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-secondary px-2 py-1 text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-sm text-muted-foreground">
                  {project.date.start}
                  {project.date.end ? ` - ${project.date.end}` : " - 現在"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* スキル */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">スキル</h2>
        <div className="space-y-4">
          {Array.from(new Set(data.skills.map((s) => s.category))).map(
            (category) => {
              const categorySkills = data.skills.filter(
                (s) => s.category === category
              );
              return (
                <div key={category} className="rounded-lg border bg-card p-6">
                  <h3 className="mb-3 font-semibold">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-full bg-secondary px-3 py-1 text-sm"
                      >
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* 資格 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">資格</h2>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert) => (
              <span
                key={cert}
                className="rounded-full bg-secondary px-3 py-1 text-sm"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 言語能力 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">言語能力</h2>
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-2">
            {data.languages.map((lang) => (
              <div key={lang.name} className="flex justify-between">
                <span className="font-medium">{lang.name}</span>
                <span className="text-muted-foreground">{lang.level}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
