// name -> simpleicons slug and brand colour. A null colour means "draw in the page's text colour".
const icons = {
  TypeScript: ['typescript', '3178C6'],
  JavaScript: ['javascript', 'F7DF1E'],
  Python: ['python', '3776AB'],
  HTML5: ['html5', 'E34F26'],
  CSS3: ['css', '8B5CF6'],
  React: ['react', '61DAFB'],
  'Next.js': ['nextdotjs', null],
  Vite: ['vite', '8B7CF6'],
  'Tailwind CSS': ['tailwindcss', '06B6D4'],
  Bootstrap: ['bootstrap', '7952B3'],
  'Framer Motion': ['framer', null],
  'Node.js': ['nodedotjs', '5FA04E'],
  Express: ['express', null],
  Django: ['django', '2BA977'],
  FastAPI: ['fastapi', '009688'],
  PostgreSQL: ['postgresql', '4169E1'],
  MongoDB: ['mongodb', '47A248'],
  Supabase: ['supabase', '3FCF8E'],
  JWT: ['jsonwebtokens', null],
  LangChain: ['langchain', null],
  'Gemini API': ['googlegemini', '8E75B2'],
  Gemini: ['googlegemini', '8E75B2'],
  Streamlit: ['streamlit', 'FF4B4B'],
  NumPy: ['numpy', '4DABCF'],
  Pandas: ['pandas', '8E7CF0'],
  PyTorch: ['pytorch', 'EE4C2C'],
  TensorFlow: ['tensorflow', 'FF6F00'],
  Matplotlib: ['matplotlib', '3F8FC6'],
  jQuery: ['jquery', '0769AD'],
  Git: ['git', 'F05032'],
  GitHub: ['github', null],
  Docker: ['docker', '2496ED'],
}

const alias = { 'Tailwind CSS': 'Tailwind CSS', TailwindCSS: 'Tailwind CSS', HTML: 'HTML5' }

/** Returns an icon URL for a technology, or null when there is no logo (the chip then shows a glyph). */
export function techIconUrl(name, isDark) {
  const entry = icons[alias[name] || name]
  if (!entry) return null
  const [slug, colour] = entry
  return `https://cdn.simpleicons.org/${slug}/${colour || (isDark ? 'fafafa' : '0a0a0a')}`
}
