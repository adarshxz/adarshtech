const INITIAL_VISITOR_COUNT = 100
const COUNT_KEY = 'portfolio:visitors:count'
const VISITORS_KEY = 'portfolio:visitors:ids'
const VISITOR_ID_PATTERN = /^[a-z0-9-]{16,80}$/i

const incrementVisitor = `
  local countKey = KEYS[1]
  local visitorsKey = KEYS[2]
  local visitorId = ARGV[1]
  local initial = tonumber(ARGV[2])

  if redis.call('EXISTS', countKey) == 0 then
    redis.call('SET', countKey, initial - 1)
  end

  if redis.call('SADD', visitorsKey, visitorId) == 1 then
    return redis.call('INCR', countKey)
  end

  return redis.call('GET', countKey)
`

const config = () => ({
  url: process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, ''),
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

async function command(commands) {
  const { url, token } = config()
  if (!url || !token) {
    const error = new Error('Visitor counter is not configured')
    error.statusCode = 503
    throw error
  }

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!response.ok) {
    const error = new Error('Visitor counter is temporarily unavailable')
    error.statusCode = 502
    throw error
  }
  return response.json()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  try {
    if (req.method === 'GET') {
      const [reply] = await command([['GET', COUNT_KEY]])
      return res.status(200).json({ count: Number(reply.result) || INITIAL_VISITOR_COUNT })
    }

    if (req.method === 'POST') {
      const visitorId = req.body?.visitorId
      if (typeof visitorId !== 'string' || !VISITOR_ID_PATTERN.test(visitorId)) {
        return res.status(400).json({ error: 'Invalid visitor identifier' })
      }
      const [reply] = await command([['EVAL', incrementVisitor, '2', COUNT_KEY, VISITORS_KEY, visitorId, String(INITIAL_VISITOR_COUNT)]])
      return res.status(200).json({ count: Number(reply.result) || INITIAL_VISITOR_COUNT })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'Unable to load visitor count' })
  }
}
