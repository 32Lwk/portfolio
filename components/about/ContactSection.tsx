"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Github, Linkedin, Instagram, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContact } from "@/lib/contact";
import { useAboutPreview } from "@/components/admin/AboutPreviewContext";

const iconMap = {
  Github,
  Linkedin,
  Instagram,
  Mail,
} as const;

export function ContactSection() {
  const preview = useAboutPreview();
  const contact = preview?.contact ?? getContact();
  const socialLinks = contact.socialLinks ?? [];
  if (socialLinks.length === 0 && !contact.formUrl) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h2 className="mb-8 text-3xl font-bold">連絡先</h2>
        <div className="space-y-6">
          {socialLinks.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">SNS・連絡先</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {socialLinks.map((link) => {
                  const Icon =
                    iconMap[link.icon as keyof typeof iconMap] ?? ExternalLink;
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
          )}
          {contact.formUrl && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">問い合わせフォーム</h3>
              <Button variant="default" asChild>
                <a
                  href={contact.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Googleフォームを開く
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
