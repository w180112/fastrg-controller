import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllFailedEvents } from '../api'
import { useI18n } from '../i18n/I18nContext'

export default function FailedEvents() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [eventTypeFilter, setEventTypeFilter] = useState('')

  useEffect(() => {
    fetchEvents()

    // Auto-refresh every 10 seconds if enabled
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 10000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, eventTypeFilter])

  const fetchEvents = async () => {
    try {
      const data = await getAllFailedEvents(eventTypeFilter || null)
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  const getErrorColor = (errorCode) => {
    if (errorCode >= 100) return '#dc3545' // red
    if (errorCode >= 50) return '#ffc107' // yellow
    return '#17a2b8' // blue
  }

  const getEventTypeColor = (eventType) => {
    const colors = {
      'pppoe_dial': '#007bff',
      'pppoe_hangup': '#6c757d',
      'hsi_config': '#28a745',
      'default': '#6c757d'
    }
    return colors[eventType] || colors.default
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => navigate('/nodes')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            {t('hsi.back')}
          </button>
          <h2>{t('events.title')}</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {t('events.filterByType')}:
            <select 
              value={eventTypeFilter} 
              onChange={(e) => setEventTypeFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              <option value="">{t('events.allTypes')}</option>
              <option value="pppoe_dial">PPPoE Dial</option>
              <option value="pppoe_hangup">PPPoE Hangup</option>
              <option value="hsi_config">HSI Config</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            {t('common.refresh')} (10s)
          </label>
          <button
            onClick={fetchEvents}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? t('common.loading') : '🔄 ' + t('common.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {t('common.error')}: {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {t('common.loading')}
        </div>
      ) : events.length === 0 ? (
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          color: '#0c5460', 
          padding: '15px', 
          borderRadius: '4px' 
        }}>
          {t('events.noEvents')}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', color: '#666' }}>
            {events.length} {t('events.noEvents')}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={tableHeaderStyle}>Time</th>
                  <th style={tableHeaderStyle}>Event type</th>
                  <th style={tableHeaderStyle}>Node ID</th>
                  <th style={tableHeaderStyle}>User ID</th>
                  <th style={tableHeaderStyle}>Error Code</th>
                  <th style={tableHeaderStyle}>Error Name</th>
                  <th style={tableHeaderStyle}>Error Detail</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                    }}
                  >
                    <td style={tableCellStyle}>
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        backgroundColor: getEventTypeColor(event.event_type),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {event.event_type}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <code style={{ 
                        backgroundColor: '#f1f1f1', 
                        padding: '2px 6px', 
                        borderRadius: '3px' 
                      }}>
                        {event.node_id}
                      </code>
                    </td>
                    <td style={tableCellStyle}>
                      <code style={{ 
                        backgroundColor: '#f1f1f1', 
                        padding: '2px 6px', 
                        borderRadius: '3px' 
                      }}>
                        {event.user_id}
                      </code>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        backgroundColor: getErrorColor(event.error_reason_code),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {event.error_reason_code}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <strong>{event.error_reason_name}</strong>
                    </td>
                    <td style={{ ...tableCellStyle, maxWidth: '300px' }}>
                      {event.error_detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6',
  fontWeight: 'bold',
  color: '#495057'
}

const tableCellStyle = {
  padding: '12px',
  textAlign: 'left'
}
