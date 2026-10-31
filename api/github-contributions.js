import { fetchGitHubContributionCalendar } from '../server/githubContributions.js'

const DEFAULT_USERNAME = 'adarshxz'

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const username = req.query?.username || process.env.GITHUB_USERNAME || DEFAULT_USERNAME

  try {
    const data = await fetchGitHubContributionCalendar({
      username,
      token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    })

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  } catch (error) {
    const statusCode = error.statusCode || 500

    return res.status(statusCode).json({
      error: error.message || 'Unable to load GitHub contributions',
    })
  }
}
