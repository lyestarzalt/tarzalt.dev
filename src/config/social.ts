export interface SocialLink {
  label: string;
  href: string;
  tip: string;
  username: string;
}

export const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/lyestarzalt',
    tip: 'lyestarzalt',
    username: 'lyestarzalt',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lyes-tarzalt',
    tip: 'I hate this place too',
    username: 'lyes-tarzalt',
  },
  {
    label: 'lyes@tarzalt.dev',
    href: 'mailto:lyes@tarzalt.dev',
    tip: 'lyes@tarzalt.dev',
    username: 'lyes',
  },
];
