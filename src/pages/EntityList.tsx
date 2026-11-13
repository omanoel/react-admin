import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, PageHeading, RecordName, StatusBadge } from '../components/common'
import { formatDate } from '../components/formatDate'
import { entityInfo } from '../entities/entityInfo'
import { getClientName } from '../entities/recordHelpers'
import type { Entity, EntityRecord, Store } from '../entities/types'

export function EntityList({ entity, store }: { entity: Entity; store: Store }) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const info = entityInfo[entity]
  const filteredRecords = store[entity].filter((item) => {
    const values = [item.name, item.id]
    if ('description' in item) values.push(item.description)
    if ('email' in item) values.push(item.email)
    if ('clientId' in item) values.push(getClientName(store, item))
    if ('clientLinks' in item) values.push(...store.clients.filter((client) => item.clientLinks.some((link) => link.clientId === client.id)).map((client) => client.name))
    if ('appId' in item) values.push(store.applications.find((app) => app.id === item.appId)?.name ?? '')
    return values.join(' ').toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))
  })
  const getSortValue = (item: EntityRecord, key: string): string | number => {
    switch (key) {
      case 'client': return 'clientLinks' in item ? store.clients.filter((client) => item.clientLinks.some((link) => link.clientId === client.id)).map((client) => client.name).join(', ') : 'clientId' in item ? getClientName(store, item) : 'appId' in item ? store.applications.find((app) => app.id === item.appId)?.name ?? '' : ''
      case 'email': return 'email' in item ? item.email : ''
      case 'status': return 'status' in item ? item.status : ''
      case 'quota': return 'quotaValue' in item ? item.quotaValue : 0
      case 'description': return 'description' in item ? item.description : ''
      case 'createdOn': return item.createdOn
      case 'updatedOn': return item.updatedOn
      default: return item.name
    }
  }
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const first = getSortValue(a, sortKey)
    const second = getSortValue(b, sortKey)
    const comparison = typeof first === 'number' && typeof second === 'number'
      ? first - second
      : String(first).localeCompare(String(second), 'fr', { numeric: true, sensitivity: 'base' })
    return (sortDirection === 'asc' ? comparison : -comparison) || a.id.localeCompare(b.id)
  })
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(sortedRecords.length / pageSize))
  const records = sortedRecords.slice((page - 1) * pageSize, page * pageSize)
  const sortBy = (key: string) => {
    setPage(1)
    if (sortKey === key) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }
  const sortHeader = (label: string, key: string) => <th aria-sort={sortKey === key ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}><button className="sort-button" onClick={() => sortBy(key)}>{label}<span aria-hidden="true">{sortKey === key ? sortDirection === 'asc' ? '↑' : '↓' : '↕'}</span></button></th>
  return <>
    <PageHeading title={info.label} description={`Retrouvez et gérez ${info.label.toLocaleLowerCase('fr')}.`} action={<Link className="button button-primary" to={`/${entity}/add`}><Icon name="plus" size={18} /> Ajouter {info.singular.toLocaleLowerCase('fr')}</Link>} />
    <section className="table-card"><div className="table-toolbar"><div><h2>Tous les {info.label.toLocaleLowerCase('fr')} <span className="record-count">{filteredRecords.length}</span></h2><p>Une liste complète de vos enregistrements</p></div><label className="search-box"><Icon name="search" size={17} /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Rechercher..." aria-label={`Rechercher parmi ${info.label.toLocaleLowerCase('fr')}`} /></label></div>
      <div className="table-scroll"><table><thead><tr>{sortHeader(info.singular.toLocaleUpperCase('fr'), 'name')}{(entity === 'users' || entity === 'applications' || entity === 'apis') && sortHeader('CLIENT ASSOCIÉ', 'client')}{entity === 'api-keys' && sortHeader('APPLICATION', 'client')}{entity === 'clients' && sortHeader('STATUT', 'status')}{entity === 'users' && <>{sortHeader('EMAIL', 'email')}{sortHeader('STATUT', 'status')}</>}{entity === 'applications' && sortHeader('QUOTA', 'quota')}{entity === 'apis' && sortHeader('DESCRIPTION', 'description')}{sortHeader('DATE DE CRÉATION', 'createdOn')}{sortHeader('DERNIÈRE MODIFICATION', 'updatedOn')}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>
        {records.length ? records.map((item) => {
          const owners = 'clientLinks' in item ? store.clients.filter((record) => item.clientLinks.some((link) => link.clientId === record.id)) : 'clientId' in item ? store.clients.filter((record) => record.id === item.clientId) : []
          const app = 'appId' in item ? store.applications.find((record) => record.id === item.appId) : undefined
          return <tr key={item.id}><td><Link to={`/${entity}/${item.id}`} className="record-cell"><span className={`record-avatar ${info.color}`}><Icon name={info.icon} size={17} /></span><span><strong><RecordName record={item} entity={entity} /></strong></span></Link></td>
            {(entity === 'users' || entity === 'applications' || entity === 'apis') && <td>{owners.length ? owners.map((owner) => <Link className="client-pill" key={owner.id} to={`/clients/${owner.id}`}>{owner.name}</Link>) : <span className="muted">—</span>}</td>}
            {entity === 'api-keys' && <td>{app ? <Link className="client-pill" to={`/applications/${app.id}`}>{app.name}</Link> : <span className="muted">—</span>}</td>}
            {entity === 'clients' && <td>{'status' in item && <StatusBadge status={item.status} />}</td>}
            {entity === 'users' && <><td>{'email' in item ? item.email : '—'}</td><td>{'status' in item && <StatusBadge status={item.status} />}</td></>}
            {entity === 'applications' && <td>{'quotaValue' in item ? `${item.quotaValue} / ${item.quotaUnit}` : '—'}</td>}
            {entity === 'apis' && <td className="description-cell">{'description' in item ? item.description : '—'}</td>}
            <><td className="date-cell">{formatDate(item.createdOn)}</td><td className="date-cell">{formatDate(item.updatedOn)}</td></>
            <td><div className="row-actions"><Link className="row-action" to={`/${entity}/${item.id}`} aria-label={`Voir ${item.name}`}><Icon name="chevron" size={17} /></Link><Link className="row-action" to={`/${entity}/${item.id}/upd`} aria-label={`Modifier ${item.name}`}><Icon name="edit" size={15} /></Link><Link className="row-action row-action-delete" to={`/${entity}/${item.id}/del`} aria-label={`Supprimer ${item.name}`}><Icon name="trash" size={15} /></Link></div></td>
          </tr>
        }) : <tr><td className="empty-cell" colSpan={8}><span className="empty-icon"><Icon name="search" size={20} /></span><strong>Aucun résultat</strong><span>Essayez avec un autre terme de recherche.</span></td></tr>}
      </tbody></table></div><div className="table-footer"><span>Affichage de <strong>{sortedRecords.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sortedRecords.length)}</strong> sur <strong>{sortedRecords.length}</strong> enregistrements</span><div className="pagination" aria-label="Pagination"><button className="pagination-button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Page précédente">‹</button><span>Page <strong>{page}</strong> sur <strong>{pageCount}</strong></span><button className="pagination-button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="Page suivante">›</button></div></div>
    </section>
  </>
}
