import Link from "next/link";
import { Github, Globe, Linkedin, Mail, Twitter } from "lucide-react";

import { brandConfig, footerConfig } from "@/config";
import { clientPortalGutterX } from "@/constants";

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = !href.startsWith("mailto:");
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/35 hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}

/** Public client portal footer — same horizontal inset as page content (`clientPortalGutterX`). */
export function SiteFooter() {
  const { authorName, authorTitle, email, social, legalName, legalUrl } = footerConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className={`py-8 sm:py-10 ${clientPortalGutterX}`}>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-start gap-3 sm:gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#004d43] text-sm font-bold text-[#e6ff2b] shadow-sm sm:h-12 sm:w-12 sm:text-base">
              A
            </div>
            <span className="text-left font-display text-2xl font-bold leading-none tracking-tight text-white sm:text-3xl lg:text-4xl">
              {brandConfig.NAME}
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:items-end sm:text-right">
            <div className="space-y-1">
              <p className="text-sm text-white/55 sm:text-base">
                {authorName} · {authorTitle}
              </p>
              <a
                href={`mailto:${email}`}
                className="inline-block text-sm font-medium underline-offset-2 hover:underline sm:text-base"
              >
                {email}
              </a>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <SocialIcon href={social.github} label="GitHub">
                <Github className="h-4 w-4" aria-hidden />
              </SocialIcon>
              <SocialIcon href={social.linkedin} label="LinkedIn">
                <Linkedin className="h-4 w-4" aria-hidden />
              </SocialIcon>
              <SocialIcon href={social.twitter} label="X">
                <Twitter className="h-4 w-4" aria-hidden />
              </SocialIcon>
              <SocialIcon href={social.website} label="Website">
                <Globe className="h-4 w-4" aria-hidden />
              </SocialIcon>
              <SocialIcon href={`mailto:${email}`} label="Email">
                <Mail className="h-4 w-4" aria-hidden />
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>

      <div className={`border-t border-white/10 py-3 ${clientPortalGutterX}`}>
        <p className="text-center text-[11px] text-white/40">
          © {year}{" "}
          <Link href="/" className="text-white/55 hover:text-white">
            {brandConfig.NAME}
          </Link>
          <span className="mx-1.5 text-white/25">·</span>
          <a href={legalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/70">
            {legalName}
          </a>
        </p>
      </div>
 
    </footer>
  );
}
