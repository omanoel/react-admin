import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Entity, EntityRecord, Status } from '../entities/types'
import { entityInfo } from '../entities/entityInfo'

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  const paths: Record<string, ReactNode> = {
    building: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 20v-4h8v4M8 9h.01M12 9h.01M16 9h.01M8 12h.01M12 12h.01M16 12h.01" /></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3.5" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35" /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>,
    key: <><circle cx="8" cy="15" r="5" /><path d="m11.5 11.5 8-8L22 6l-2 2 2 2-3 3-2-2-2 2" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 14h11l1-14M9 7V4h6v3" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  }
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

export function StatusBadge({ status }: { status?: Status }) {
  const normalized = status === 'Deactivated' ? status : status === 'Pending' ? status : 'Activated'
  return <span className={`status-badge status-${normalized.toLowerCase()}`}><span /> {normalized}</span>
}

export function RecordName({ record, entity }: { record: EntityRecord; entity: Entity }) {
  if (entity === 'users' && 'givenName' in record) return <>{record.givenName} {record.familyName}</>
  return record.name
}

export function FormField({ label, hint, children, required = false }: { label: string; hint?: string; children: ReactNode; required?: boolean }) {
  return <label className="form-field"><span>{label} {required && <em>*</em>}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function DetailFields({ fields }: { fields: [string, ReactNode][] }) {
  return <div className="detail-fields">{fields.map(([label, value]) => <div className="detail-field" key={label}><span>{label}</span><strong>{value || '—'}</strong></div>)}</div>
}

export function RelatedSection({ title, description, entity, records, createHref }: { title: string; description: string; entity: Entity; records: EntityRecord[]; createHref: string }) {
  return <section className="related-card"><div className="related-heading"><div><h2>{title}</h2><p>{description}</p></div><Link className="button button-secondary button-small" to={createHref}><Icon name="plus" size={16} /> Ajouter {entityInfo[entity].singular.toLocaleLowerCase('fr')}</Link></div>
    <div className="related-list">{records.length ? records.map((item) => <Link className="related-row" key={item.id} to={`/${entity}/${item.id}`}><span className={`record-avatar ${entityInfo[entity].color}`}><Icon name={entityInfo[entity].icon} size={16} /></span><span className="related-name"><strong><RecordName record={item} entity={entity} /></strong><small>{item.id}{'description' in item && item.description ? ` · ${item.description}` : ''}</small></span><Icon name="chevron" size={16} /></Link>) : <div className="related-empty">Aucun élément associé pour le moment.</div>}</div>
  </section>
}
