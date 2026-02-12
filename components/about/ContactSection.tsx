"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Github, Linkedin, Instagram, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/32Lwk",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/kawashimayuto/",
    icon: Linkedin,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/32_lwk",
    icon: Instagram,
  },
  {
    name: "Email",
    href: "mailto:kawashima.yuto.c2@s.mail.nagoya-u.ac.jp",
    icon: Mail,
  },
];

export function ContactSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">連絡先</h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">SNS・連絡先</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.name}
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={link.href}
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">問い合わせフォーム</h3>
            <Button variant="default" asChild>
              <a
                href="https://forms.gle/9CjKdDGoegjy1isPA"
                target="_blank"
                rel="noopener noreferrer"
              >
                Googleフォームを開く
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
