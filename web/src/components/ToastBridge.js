import React from 'react'
import { toast } from 'react-hot-toast'
import { useCallback } from 'react'

// Lightweight bridge to provide the legacy useToast API backed by react-hot-toast.
// showToast(message, ms = 3500, type = 'info', atTop = true) -> returns id
// hideToast(id) -> dismiss specific toast
// clearAll() -> dismiss all toasts

export function useToast() {
  const showToast = useCallback((message, ms = 3500, type = 'info', atTop = true) => {
    const position = atTop ? 'top-right' : 'bottom-right'

    const containerStyle = {
      background: type === 'error' ? '#dc3545' : '#333',
      color: 'white',
      padding: '12px 16px',
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      maxWidth: 420
    }

    const closeBtnStyle = {
      marginLeft: 12,
      border: 'none',
      background: 'transparent',
      color: 'white',
      cursor: 'pointer',
      fontSize: 14,
      lineHeight: 1
    }

    // Use custom renderer so we can include a close button (✕)
    const id = toast.custom((t) => (
      <div style={{ ...containerStyle, opacity: t.visible ? 1 : 0, transform: t.visible ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity 220ms, transform 220ms' }}>
        <div style={{ flex: 1, wordBreak: 'break-word' }}>{message}</div>
        <button aria-label="Close" onClick={() => toast.dismiss(t.id)} style={closeBtnStyle}>✕</button>
      </div>
    ), { duration: ms > 0 ? ms : Infinity, position })

    return id
  }, [])

  const hideToast = useCallback((id) => {
    if (!id) toast.dismiss()
    else toast.dismiss(id)
  }, [])

  const clearAll = useCallback(() => {
    toast.dismiss()
  }, [])

  return { showToast, hideToast, clearAll }
}

export default useToast
