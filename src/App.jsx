import { useState } from 'react'
import './App.css'

function scoreLead(item) {
  const [name, address, types] = Array.isArray(item) ? item : [item, null, null]
  let score = 0
  if (name) score += 3
  if (address) score += 2
  if (types) score += 1
  score += (name?.length || 0) / 100
  return score
}

function sortByScore(results) {
  return [...results].sort((a, b) => scoreLead(b) - scoreLead(a))
}

const JAVA_API_BASE = 'https://leadsscraperbackend-production.up.railway.app'

const INDUSTRIES = [
  'media_entertainment',
  'sports_technology',
  'logistics_transportation',
  'financial_services',
  'real_estate_development',
  'nonprofit_organization',
  'consumer_services'
]

async function get_scrape(result_array, setResultArray) {
  const business_name = document.getElementById('business_type').value
  const location = document.getElementById('location').value
  const payload = { business_name, location }

  const result = await fetch('https://webscraperpythonlogic-production.up.railway.app/scrape', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(payload)
  })
  const JSON_result = await result.json()
  const results_array = JSON_result.results || []
  setResultArray(results_array)

  await saveRequest(JSON.stringify(payload))
}

async function saveRequest(request) {
  try {
    await fetch(`${JAVA_API_BASE}/saverequest`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ request })
    })
  } catch (err) {
    console.warn('Failed to save request:', err)
  }
}

async function getPreviousRequests() {
  const res = await fetch(`${JAVA_API_BASE}/getpreviousrequests`)
  const text = await res.text()
  return text
}

function App() {
  const [result_array, setResultArray] = useState([])
  const [hasScored, setHasScored] = useState(false)
  const [previousRequests, setPreviousRequests] = useState(null)
  const [loadingPrevious, setLoadingPrevious] = useState(false)

  async function handleGetPreviousRequests() {
    setLoadingPrevious(true)
    try {
      const data = await getPreviousRequests()
      setPreviousRequests(data)
    } catch (err) {
      setPreviousRequests(`Error: ${err.message}`)
    } finally {
      setLoadingPrevious(false)
    }
  }

  function handleScoreResults() {
    setResultArray(sortByScore(result_array))
    setHasScored(true)
  }

  return (
    <div className="app-layout">
      <div className="app">
      <header className="hero">
        <div className="brand">Dakdan Worldwide</div>
        <div className="hero-badge">Lead Generation</div>
        <h1 className="hero-title">
          Find <span className="gradient-text">businesses</span> anywhere
        </h1>
        <p className="hero-subtitle">
          Search by industry and location to discover leads instantly
        </p>
      </header>

      <section className="search-section">
        <div className="search-card">
          <div className="search-inputs">
            <div className="input-group">
              <label htmlFor="business_type">Industry</label>
              <select
                id="business_type"
                className="search-select"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <span className="search-divider">in</span>
            <div className="input-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. New York, Austin, London"
                className="search-input"
              />
            </div>
          </div>
          <button
            className="submit-btn"
            onClick={() => { setHasScored(false); get_scrape(result_array, setResultArray) }}
          >
            <span className="btn-text">Search leads</span>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <div className="previous-requests-section">
            <button
              className="previous-requests-btn"
              onClick={handleGetPreviousRequests}
              disabled={loadingPrevious}
            >
              {loadingPrevious ? 'Loading…' : 'Get previous requests'}
            </button>
            {previousRequests !== null && (
              <div className="previous-requests-display">
                <pre>{previousRequests}</pre>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="results-section">
        {result_array.length > 0 ? (
          <>
            <h2 className="results-heading">
              <span className="results-count">{result_array.length}</span> results found
            </h2>
            <ul className="results-list">
              {result_array.map((item, idx) => {
                const [name, address, types] = Array.isArray(item) ? item : [item, null, null]
                const searchQuery = [name, address].filter(Boolean).join(' ')
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
                return (
                  <li key={idx} className="result-card">
                    <div className="result-content">
                      <div className="result-name">{name}</div>
                      {address && <div className="result-address">{address}</div>}
                      {types && <div className="result-types">{types}</div>}
                    </div>
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-google-link"
                    >
                      <svg className="google-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        <path d="M15 9l6-6M21 3l-6 6" />
                      </svg>
                      Google search
                    </a>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Your search results will appear here</p>
            <span>Select an industry and location above to get started</span>
          </div>
        )}
      </section>
      </div>

      {result_array.length > 0 && (
        <aside className="chatbot-panel">
          <div className="chatbot-header">
            <span className="chatbot-avatar">✦</span>
            <span className="chatbot-title">Lead Assistant</span>
          </div>
          <div className="chatbot-messages">
            <div className="chatbot-message bot">
              {hasScored ? (
                <p>Results are now sorted from best to worst. Top leads have more complete info (name, address, business type).</p>
              ) : (
                <>
                  <p>I found {result_array.length} leads for you. I can score these from best to worst based on lead quality—completeness of info, address presence, and business type.</p>
                  <button className="chatbot-score-btn" onClick={handleScoreResults}>
                    Score results
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export default App
