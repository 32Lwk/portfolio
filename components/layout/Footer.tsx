import Link from "next/link";
import { Github, Linkedin, Instagram, Mail } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">川嶋宥翔</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              名古屋大学 理学部物理学科 2年生
              <br />
              フルスタックエンジニア
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resume
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={item.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 川嶋宥翔. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
