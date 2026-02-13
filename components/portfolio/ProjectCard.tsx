"use client";

import Link from "next/link";
import { Github, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Project } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ProjectImage } from "./ProjectImage";
import { useState } from "react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showSubProjects, setShowSubProjects] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-xl border-2 bg-card transition-all duration-300 hover:shadow-2xl hover:border-primary/50"
    >
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-300 pointer-events-none z-0" />
      
      <Link href={`/projects/${project.id}`} className="block relative z-10">
        <div className="relative overflow-hidden">
          <ProjectImage src={project.image} alt={project.name} />
          {/* ホバー時のオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Badge className="bg-primary text-primary-foreground">詳細を見る →</Badge>
          </div>
        </div>
        <div className="p-6 relative z-10">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-xl font-bold hover:text-primary transition-colors group-hover:translate-x-1 duration-300">
              {project.name}
            </h3>
            <Badge variant="secondary" className="shrink-0">{project.category}</Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
            {project.description}
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge 
                key={tech} 
                variant="outline" 
                className="text-xs transition-all duration-200 hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
              >
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 4}
              </Badge>
            )}
          </div>
          
          {/* Sub Projects Section */}
          {project.subProjects && project.subProjects.length > 0 && (
            <div className="mb-4 border-t pt-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSubProjects(!showSubProjects);
                }}
                className="flex w-full items-center justify-between text-sm font-semibold text-primary hover:text-primary/80"
              >
                <span>関連プロジェクト ({project.subProjects.length})</span>
                {showSubProjects ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showSubProjects && (
                <div className="mt-3 space-y-3">
                  {project.subProjects.map((subProject) => (
                    <div
                      key={subProject.id}
                      className="rounded-md border bg-muted/50 p-3 text-sm"
                    >
                      <h4 className="mb-1 font-semibold">{subProject.name}</h4>
                      <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
                        {subProject.description}
                      </p>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {subProject.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {subProject.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{subProject.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                      {subProject.highlights.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {subProject.highlights.slice(0, 2).map((highlight, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
      
      <div className="px-6 pb-6 flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
        {project.githubUrl && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="group/btn transition-all duration-200 hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2 transition-transform group-hover/btn:rotate-12" />
              GitHub
            </Link>
          </Button>
        )}
        {project.demoUrl && (
          <Button
            variant="default"
            size="sm"
            asChild
            className="group/btn transition-all duration-200 hover:scale-105 hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2 transition-transform group-hover/btn:translate-x-1" />
              Demo
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
