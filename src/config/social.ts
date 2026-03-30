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
    tip: 'where the code lives',
    username: 'lyestarzalt',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lyes-tarzalt',
    tip: 'the professional one',
    username: 'lyes-tarzalt',
  },
  {
    label: 'Email',
    href: 'mailto:lyes.trzlt@gmail.com',
    tip: 'old school',
    username: 'lyes.trzlt',
  },
];
