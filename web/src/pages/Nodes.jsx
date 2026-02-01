import React, { useEffect, useState } from 'react'
import { fetchNodes } from '../api'
import NodeCard from '../components/NodeCard'
import { useI18n } from '../i18n/I18nContext'

export default function Nodes(){
  const [nodes, setNodes] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  const loadNodes = async () => {
    setLoading(true)
    setError(null)
    try{
      const data = await fetchNodes()
      setNodes(data)
    }catch(err){
      setError(err.message || t('nodes.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    loadNodes()
  }, [])

  const handleNodeUnregistered = () => {
    // Reload node list
    loadNodes()
  }

  return (
    <div>
      <h2>{t('nodes.title')}</h2>
      {error && <div className="error">{error}</div>}
      {loading && <div>{t('nodes.loading')}</div>}
      <div className="nodes-grid">
        {(Array.isArray(nodes) ? nodes : []).map(n => (
          <NodeCard 
            key={n.node_uuid || n.uuid || n.node_id || n.id || n.key} 
            node={n} 
            onNodeUnregistered={handleNodeUnregistered}
          />
        ))}
      </div>
    </div>
  )
}
