import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { DetailFields, Icon, RecordName, StatusBadge } from '../components/common'
import { formatDate } from '../components/formatDate'
import type { ApiItem } from '../entities/apis/types'
import { entityInfo } from '../entities/entityInfo'
import type { Entity, EntityRecord, Store } from '../entities/types'
import { NotFound } from './NotFound'

export function RecordDetail({ entity, store }: { entity: Entity; store: Store }) {
  const { id } = useParams()
  const location = useLocation()
  const record = store[entity].find((item) => item.id === id)
  if (!record) return <NotFound />
  const info = entityInfo[entity]
  const relationTabs: ('users' | 'applications' | 'apis' | 'clients' | 'api-keys')[] = entity === 'clients' ? ['users', 'applications', 'apis'] : entity === 'apis' ? ['clients', 'applications'] : entity === 'applications' ? ['apis', 'api-keys'] : []
  const requestedTab = location.pathname.split('/')[3]
  const defaultTab = entity === 'clients' ? 'users' : entity === 'apis' ? 'clients' : 'apis'
  const activeTab = requestedTab ? relationTabs.find((tab) => tab === requestedTab) : defaultTab
  if (!activeTab) return <NotFound />
  const title = 'givenName' in record ? `${record.givenName} ${record.familyName}`.trim() : record.name
  const app = 'appId' in record ? store.applications.find((item) => item.id === record.appId) : undefined
  const client = 'clientId' in record ? store.clients.find((item) => item.id === record.clientId) : undefined
  const fields: [string, ReactNode][] = []
  if ('description' in record) fields.push(['Description', record.description])
  if ('givenName' in record) fields.push(['Email', record.email], ['Téléphone', record.phoneNumber], ['Rôle', record.role === 'MainUser' ? 'MainUser · Utilisateur principal' : 'User'])
  if ('oauth2ClientId' in record) fields.push(['OAuth2 Client ID', record.oauth2ClientId], ['OAuth2 Secret', <span className="secret-value">{record.oauth2Secret}</span>], ['External Client ID', record.externalClientId], ['Quota', `${record.quotaValue} / ${record.quotaUnit}`])
  if ('clientId' in record) fields.push(['Client associé', client ? <Link className="inline-link" to={`/clients/${client.id}`}>{client.name}</Link> : '—'])
  if ('appId' in record) fields.push(['Application associée', app ? <Link className="inline-link" to={`/applications/${app.id}`}>{app.name}</Link> : '—'])
  if (entity !== 'apis') fields.push(['Date de création', formatDate(record.createdOn)], ['Dernière modification', formatDate(record.updatedOn)])
  const relatedApis = 'apiIds' in record ? record.apiIds.map((apiId) => store.apis.find((api) => api.id === apiId)).filter((api): api is ApiItem => Boolean(api)) : []
  const relatedKeys = entity === 'applications' ? store['api-keys'].filter((key) => key.appId === record.id) : []
  const relatedItems: { entity: Entity; record: EntityRecord; createdOn?: string }[] = entity === 'clients'
    ? activeTab === 'apis'
      ? store.apis.flatMap((api) => api.clientLinks.filter((link) => link.clientId === record.id).map((link) => ({ entity: 'apis' as const, record: api, createdOn: link.createdOn })))
      : activeTab === 'users' || activeTab === 'applications'
        ? store[activeTab].filter((item) => item.clientId === record.id).map((item) => ({ entity: activeTab, record: item }))
        : []
    : entity === 'apis' && 'clientLinks' in record
      ? activeTab === 'clients'
        ? record.clientLinks.flatMap((link) => store.clients.filter((item) => item.id === link.clientId).map((item) => ({ entity: 'clients' as const, record: item, createdOn: link.createdOn })))
        : store.applications.filter((application) => application.apiIds.includes(record.id) && record.clientLinks.some((link) => link.clientId === application.clientId)).map((item) => ({ entity: 'applications' as const, record: item }))
      : entity === 'applications' && 'apiIds' in record
        ? activeTab === 'apis'
          ? relatedApis.map((item) => ({ entity: 'apis' as const, record: item }))
          : relatedKeys.map((item) => ({ entity: 'api-keys' as const, record: item }))
      : []
  return <>
    <section className="detail-card"><div className="detail-card-heading"><div><span className={`detail-record-icon ${info.color}`}><Icon name={info.icon} size={21} /></span><div><div className="detail-title-row"><h2>{title}</h2>{'status' in record && <StatusBadge status={record.status} />}</div><p>{info.singular}</p></div></div><div className="detail-actions"><Link className="button button-secondary" to={`/${entity}/${record.id}/upd`}><Icon name="edit" size={16} /> Modifier</Link><Link className="button button-danger-ghost" to={`/${entity}/${record.id}/del`}><Icon name="trash" size={16} /> Supprimer</Link></div></div><DetailFields fields={fields} /></section>
    {relationTabs.length > 0 && <section className="related-card"><div className="tabs" role="tablist" aria-label="Éléments associés">{relationTabs.map((key) => <Link key={key} role="tab" aria-selected={activeTab === key} className={`tab ${activeTab === key ? 'tab-active' : ''}`} to={`/${entity}/${record.id}/${key}`}><Icon name={entityInfo[key].icon} size={16} /> {entityInfo[key].label}<span>{entity === 'clients' ? key === 'apis' ? store.apis.filter((api) => api.clientLinks.some((link) => link.clientId === record.id)).length : key === 'users' ? store.users.filter((item) => item.clientId === record.id).length : store.applications.filter((item) => item.clientId === record.id).length : entity === 'apis' ? key === 'clients' && 'clientLinks' in record ? record.clientLinks.length : store.applications.filter((application) => application.apiIds.includes(record.id) && 'clientLinks' in record && record.clientLinks.some((link) => link.clientId === application.clientId)).length : key === 'apis' ? relatedApis.length : relatedKeys.length}</span></Link>)}</div>{entity === 'clients' && <div className="related-heading">{activeTab === 'apis' ? <Link className="button button-secondary button-small" to={`/clients/${record.id}/apis/edit`}><Icon name="edit" size={16} /> Gérer les liaisons</Link> : <Link className="button button-secondary button-small" to={activeTab === 'users' ? `/users/add?clientId=${record.id}` : `/applications/add?clientId=${record.id}`}><Icon name="plus" size={16} /> Ajouter {entityInfo[activeTab].singular.toLocaleLowerCase('fr')}</Link>}</div>}{entity === 'applications' && <div className="related-heading">{activeTab === 'apis' ? <Link className="button button-secondary button-small" to={`/applications/${record.id}/apis/edit`}><Icon name="edit" size={16} /> Gérer les liaisons</Link> : <Link className="button button-secondary button-small" to={`/api-keys/add?appId=${record.id}`}><Icon name="plus" size={16} /> Ajouter une clé API</Link>}</div>}<div className="related-list">{relatedItems.length ? relatedItems.map(({ entity: relatedEntity, record: item, createdOn }) => <Link className="related-row" key={item.id} to={`/${relatedEntity}/${item.id}`}><span className={`record-avatar ${entityInfo[relatedEntity].color}`}><Icon name={entityInfo[relatedEntity].icon} size={16} /></span><span className="related-name"><strong><RecordName record={item} entity={relatedEntity} /></strong><small>{createdOn ? `Association créée le ${formatDate(createdOn)}` : item.id}</small></span>{'status' in item && <StatusBadge status={item.status} />}<Icon name="chevron" size={16} /></Link>) : <div className="related-empty">Aucun élément associé pour le moment.</div>}</div></section>}
  </>
}
