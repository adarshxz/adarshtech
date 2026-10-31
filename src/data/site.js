// Single source for identity, contact points and navigation.
export const site = {
  name: 'Adarsh Singh',
  email: 'adarshsinghcommit@gmail.com',
  location: 'Indore, Madhya Pradesh',
  coords: '22.72°N 75.86°E',
  timeZone: 'Asia/Kolkata',
  roles: ['Full-stack developer', 'AI engineer', 'GenAI builder'],
  tagline:
    'Software and AI engineer turning complex data and modern full-stack practice into fast, usable applications.',
  values: 'Clean code, practical ML, and building things that make a difference.',
}

export const resume = {
  label: 'Resume',
  href: 'https://drive.google.com/file/d/1wOlC_0963_2VPhL19uhP6hDcJ06w25i5/view?usp=sharing',
}

export const socials = [
  { label: 'GitHub', handle: 'adarshxz', href: 'https://github.com/adarshxz' },
  { label: 'LinkedIn', handle: 'adarshxzsingh', href: 'https://www.linkedin.com/in/adarshxzsingh/' },
  { label: 'X', handle: 'Adarshxz', href: 'https://x.com/Adarshxz' },
  { label: 'Instagram', handle: 'adarsh.xz', href: 'https://instagram.com/adarsh.xz' },
  { label: 'Discord', handle: 'adarsh.xz', href: 'https://discord.com/users/adarsh.xz' },
]


// Legacy routes still resolve; each one lands on its section of the single page.
export const routeToSection = { '/about': 'about', '/certifications': 'certifications' }
