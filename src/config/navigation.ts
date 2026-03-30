export interface NavItem {
  label: string;
  href: string;
}

export const navigationItems: NavItem[] = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Writing', href: '/blog/' },
  { label: 'About', href: '/about/' },
];
