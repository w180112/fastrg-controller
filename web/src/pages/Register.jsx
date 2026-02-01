import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRegister } from '../api'
import { useI18n } from '../i18n/I18nContext'

export default function Register(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const { t } = useI18n()
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)

    // Check password
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'))
      return
    }

    if (!username.trim() || !password.trim()) {
      setError(t('register.fillBoth'))
      return
    }

    try{
      await apiRegister(username, password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }catch(err){
      setError(err.message || t('register.failed'))
    }
  }

  if (success) {
    return (
      <div className="card">
        <h2>{t('register.successTitle')}</h2>
        <p>{t('register.successMessage')}</p>
        <Link to="/">{t('register.goToLogin')}</Link>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>{t('register.title')}</h2>
      <form onSubmit={submit}>
        <label>
          {t('register.username')}
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            placeholder={t('register.usernamePlaceholder')}
          />
        </label>
        <label>
          {t('register.password')}
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder={t('register.passwordPlaceholder')}
          />
        </label>
        <label>
          {t('register.confirmPassword')}
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder={t('register.confirmPasswordPlaceholder')}
          />
        </label>
        <button type="submit">{t('register.button')}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div style={{marginTop: '16px', textAlign: 'center'}}>
        <Link to="/">{t('register.haveAccount')}</Link>
      </div>
    </div>
  )
}
