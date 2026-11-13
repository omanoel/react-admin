import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon, PageHeading, StatusBadge } from '../components/common'
import { formatDate } from '../components/formatDate'
import { entityInfo } from '../entities/entityInfo'
import { getClientName } from '../entities/recordHelpers'
import type { Entity, Store } from '../entities/types'
import { NotFound } from './NotFound'

export function DeleteRecord({ entity, store, onDelete }: { entity: Entity; store: Store; onDelete: (entity: Entity, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const record = store[entity].find((item) => item.id === id)
  if (!record) return <NotFound />
  const info = entityInfo[entity]
  const linkedCount = entity === 'clients' ? store.users.filter((item) => item.clientId === id).length + store.applications.filter((item) => item.clientId === id).length + store.apis.filter((item) => item.clientLinks.some((link) => link.clientId === id)).length : entity === 'applications' ? store['api-keys'].filter((item) => item.appId === id).length : 0
  const title = 'givenName' in record ? `${record.givenName} ${record.familyName}`.trim() : record.name
  const confirmDelete = async () => {
    try {
      await onDelete(entity, record.id)
      navigate(`/${entity}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'La requête API a échoué.')
    }
  }
  return <>
    <div className="back-link-wrap"><Link to={`/${entity}/${record.id}`} className="back-link"><Icon name="chevron" size={15} /> Retour à la fiche</Link></div>
    <PageHeading eyebrow={`${info.singular.toLocaleUpperCase('fr')} · SUPPRESSION`} title="Supprimer cet enregistrement" description="Vérifiez les informations avant de confirmer cette action." />
    <section className="delete-card"><div className="delete-warning"><span className="warning-icon"><Icon name="trash" size={20} /></span><div><strong>Cette action est irréversible</strong><p>L’enregistrement sera supprimé définitivement de votre espace.</p></div></div><div className="delete-summary-title">RÉSUMÉ DE L’ENREGISTREMENT</div><div className="delete-summary"><span className={`record-avatar ${info.color}`}><Icon name={info.icon} size={18} /></span><div className="delete-summary-name"><strong>{title}</strong><small>{info.singular} · {record.id}</small></div>{'status' in record && <StatusBadge status={record.status} />}</div><div className="delete-details"><div><span>Créé le</span><strong>{formatDate(record.createdOn)}</strong></div><div><span>Dernière modification</span><strong>{formatDate(record.updatedOn)}</strong></div>{'clientId' in record && <div><span>Client associé</span><strong>{getClientName(store, record)}</strong></div>}</div>{linkedCount > 0 && <div className="linked-warning">Attention : {linkedCount} élément{linkedCount > 1 ? 's' : ''} associé{linkedCount > 1 ? 's' : ''} sera{linkedCount > 1 ? 'ont' : ''} également supprimé{linkedCount > 1 ? 's' : ''} ou détaché{linkedCount > 1 ? 's' : ''}.</div>}{error && <div className="form-error" role="alert">{error}</div>}<div className="delete-footer"><Link className="button button-secondary" to={`/${entity}/${record.id}`}>Annuler</Link><button className="button button-danger" onClick={() => { void confirmDelete() }}><Icon name="trash" size={17} /> Confirmer la suppression</button></div></section>
  </>
}
