import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }

  componentDidCatch(error, info){
    this.setState({ error, info })
    // You can also log to an external service here
    // ErrorBoundary caught an error; avoid console noise in production.
  }

  render(){
    if(this.state.hasError){
      const errMsg = (this.state.error && this.state.error.toString()) || 'Unknown error'
      const stack = this.state.info && this.state.info.componentStack
      return (
        <div style={{ padding: 20 }}>
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: 16, borderRadius: 6 }}>
            <h3>Something went wrong</h3>
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>{errMsg}</div>
            {stack && <div style={{ marginTop: 10, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>{stack}</div>}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
