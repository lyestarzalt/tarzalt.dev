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
    tip: 'where I mass-delete things professionally',
    username: 'lyestarzalt',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lyes-tarzalt',
    tip: 'I hate that place',
    username: 'lyes-tarzalt',
  },
  {
    label: 'lyes.trzlt@gmail.com',
    href: 'mailto:lyes.trzlt@gmail.com',
    tip: 'I might reply',
    username: 'lyes.trzlt',
  },
];
