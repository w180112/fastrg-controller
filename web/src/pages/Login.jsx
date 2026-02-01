import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiLogin } from '../api'
import { useI18n } from '../i18n/I18nContext'

export default function Login({ onLogin }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { t } = useI18n()
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    try{
      const token = await apiLogin(username, password)
      if (onLogin) onLogin(token) // Pass the token to the login callback
      navigate('/nodes')
    }catch(err){
      // Check if it's a 401 error (invalid credentials)
      if (err.response && err.response.status === 401) {
        setError(t('login.invalidCredentials'))
      } else {
        setError(err.message || t('login.networkError'))
      }
    }
  }

  return (
    <div className="card">
      <h2>{t('login.title')}</h2>
      <form onSubmit={submit}>
        <label>
          {t('login.username')}
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          {t('login.password')}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">{t('login.button')}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}
