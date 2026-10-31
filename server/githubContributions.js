const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'
const DAY_MS = 24 * 60 * 60 * 1000
const GITHUB_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
const CONTRIBUTION_LEVELS = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']

const CONTRIBUTION_CALENDAR_QUERY = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      avatarUrl
      url
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          colors
          months {
            firstDay
            name
            totalWeeks
            year
          }
          weeks {
            firstDay
            contributionDays {
              color
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`

const formatDateKey = (date) => date.toISOString().slice(0, 10)

const parseDateKey = (dateKey) => new Date(`${dateKey}T00:00:00.000Z`)

const getContributionWindow = () => {
  const to = new Date()
  to.setUTCHours(23, 59, 59, 999)

  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 365)
  from.setUTCHours(0, 0, 0, 0)

  return { from, to }
}

const decodeHtml = (value = '') => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')

const getAttribute = (html, name) => {
  const match = html.match(new RegExp(`${name}="([^"]*)"`, 'i'))
  return match ? decodeHtml(match[1]) : ''
}

const parseCountFromTooltip = (html, id) => {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const tooltipMatch = html.match(new RegExp(`<tool-tip[^>]*for="${escapedId}"[^>]*>([\\s\\S]*?)<\\/tool-tip>`, 'i'))
  const tooltip = decodeHtml(tooltipMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '')

  if (!tooltip || /^No contributions/i.test(tooltip)) return 0

  const countMatch = tooltip.match(/([\d,]+)\s+contribution/i)
  return countMatch ? Number(countMatch[1].replace(/,/g, '')) : 0
}

const parsePublicContributionHtml = (html) => {
  const days = []
  const dayPattern = /<td\b(?=[^>]*class="[^"]*ContributionCalendar-day[^"]*")[^>]*>/gi
  let match

  while ((match = dayPattern.exec(html))) {
    const tag = match[0]
    const date = getAttribute(tag, 'data-date')
    if (!date) continue

    const level = Number(getAttribute(tag, 'data-level') || 0)
    const id = getAttribute(tag, 'id')
    const count = parseCountFromTooltip(html, id)
    const weekday = parseDateKey(date).getUTCDay()

    days.push({
      date,
      color: GITHUB_COLORS[level] || GITHUB_COLORS[0],
      contributionCount: count,
      contributionLevel: CONTRIBUTION_LEVELS[level] || CONTRIBUTION_LEVELS[0],
      weekday,
    })
  }

  return days
}

const buildMonths = (weeks) => {
  const months = []
  let current = null

  weeks.forEach((week) => {
    const firstInMonth = week.contributionDays.find((day) => {
      if (!day) return false
      const date = parseDateKey(day.date)
      return date.getUTCDate() <= 7
    })

    if (!firstInMonth) {
      if (current) current.totalWeeks += 1
      return
    }

    const date = parseDateKey(firstInMonth.date)
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`

    if (!current || current.key !== key) {
      current = {
        key,
        firstDay: firstInMonth.date,
        name: date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
        totalWeeks: 1,
        year: date.getUTCFullYear(),
      }
      months.push(current)
    } else {
      current.totalWeeks += 1
    }
  })

  return months.map(({ key, ...month }) => month)
}

const buildCalendarFromDays = (days, from, to) => {
  const byDate = new Map(days.map((day) => [day.date, day]))
  const startDate = new Date(from)
  const endDate = new Date(to)

  startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay())
  endDate.setUTCDate(endDate.getUTCDate() + (6 - endDate.getUTCDay()))

  const weeks = []
  let currentWeek = null
  let totalContributions = 0

  for (let time = startDate.getTime(); time <= endDate.getTime(); time += DAY_MS) {
    const date = new Date(time)
    const dateKey = formatDateKey(date)
    const inRange = date >= from && date <= to
    const day = inRange ? byDate.get(dateKey) : null
    const weekday = date.getUTCDay()

    if (weekday === 0 || !currentWeek) {
      currentWeek = {
        firstDay: dateKey,
        contributionDays: Array.from({ length: 7 }, () => null),
      }
      weeks.push(currentWeek)
    }

    currentWeek.contributionDays[weekday] = day || {
      date: dateKey,
      color: GITHUB_COLORS[0],
      contributionCount: 0,
      contributionLevel: CONTRIBUTION_LEVELS[0],
      weekday,
    }

    if (inRange) {
      totalContributions += day?.contributionCount || 0
    }
  }

  return {
    totalContributions,
    colors: GITHUB_COLORS,
    months: buildMonths(weeks),
    weeks,
  }
}

async function fetchGitHubGraphQLContributionCalendar({ username, token, fetchImpl, from, to }) {
  if (!token) return null

  const response = await fetchImpl(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'adarsh-portfolio',
    },
    body: JSON.stringify({
      query: CONTRIBUTION_CALENDAR_QUERY,
      variables: {
        login: username,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
  })

  if (!response.ok) {
    const error = new Error(`GitHub GraphQL request failed with ${response.status}`)
    error.statusCode = response.status
    throw error
  }

  const payload = await response.json()

  if (payload.errors?.length) {
    const error = new Error(payload.errors.map((item) => item.message).join('; '))
    error.statusCode = 502
    throw error
  }

  if (!payload.data?.user) {
    const error = new Error(`GitHub user "${username}" was not found`)
    error.statusCode = 404
    throw error
  }

  return {
    source: 'github-graphql',
    syncedAt: new Date().toISOString(),
    user: {
      login: payload.data.user.login,
      name: payload.data.user.name,
      avatarUrl: payload.data.user.avatarUrl,
      url: payload.data.user.url,
    },
    calendar: payload.data.user.contributionsCollection.contributionCalendar,
  }
}

async function fetchPublicGitHubContributionCalendar({ username, fetchImpl, from, to }) {
  const years = new Set([from.getUTCFullYear(), to.getUTCFullYear()])
  const responses = await Promise.all(Array.from(years).map(async (year) => {
    const response = await fetchImpl(`https://github.com/users/${username}/contributions?to=${year}-12-31`, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'adarsh-portfolio',
      },
    })

    if (!response.ok) {
      const error = new Error(`GitHub public contributions request failed with ${response.status}`)
      error.statusCode = response.status
      throw error
    }

    return response.text()
  }))

  return {
    source: 'github-public-calendar',
    syncedAt: new Date().toISOString(),
    user: {
      login: username,
      name: null,
      avatarUrl: null,
      url: `https://github.com/${username}`,
    },
    calendar: buildCalendarFromDays(responses.flatMap(parsePublicContributionHtml), from, to),
  }
}

export async function fetchGitHubContributionCalendar({ username, token, fetchImpl = fetch }) {
  const { from, to } = getContributionWindow()

  const graphQLCalendar = await fetchGitHubGraphQLContributionCalendar({
    username,
    token,
    fetchImpl,
    from,
    to,
  })

  if (graphQLCalendar) {
    return graphQLCalendar
  }

  return fetchPublicGitHubContributionCalendar({
    username,
    fetchImpl,
    from,
    to,
  })
}
