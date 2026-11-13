import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon, PageHeading } from '../components/common'
import { ApiFormFields } from '../entities/apis/ApiFormFields'
import { ApiKeyFormFields } from '../entities/api-keys/ApiKeyFormFields'
import { ApplicationFormFields } from '../entities/applications/ApplicationFormFields'
import { ClientFormFields } from '../entities/clients/ClientFormFields'
import { entityInfo } from '../entities/entityInfo'
import type { Entity, EntityRecord, RecordFormValues, Status, Store } from '../entities/types'
import { UserFormFields } from '../entities/users/UserFormFields'
import { NotFound } from './NotFound'

export function RecordForm({ entity, store, onSave }: { entity: Entity; store: Store; onSave: (entity: Entity, record: EntityRecord, isNew: boolean) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const requestedClientId = params.get('clientId')
  const isNew = !id
  const existing = id ? store[entity].find((item) => item.id === id) : undefined
  const initialClientId = (entity === 'users' || entity === 'applications') && store.clients.some((client) => client.id === requestedClientId) ? requestedClientId ?? '' : ''
  const requestedAppId = params.get('appId')
  const initialAppId = entity === 'api-keys' && store.applications.some((app) => app.id === requestedAppId) ? requestedAppId ?? '' : ''
  const lockedClientId = entity === 'users' || entity === 'applications' ? existing && 'clientId' in existing ? existing.clientId : initialClientId : ''
  const lockedAppId = entity === 'api-keys' ? existing && 'appId' in existing ? existing.appId : initialAppId : ''
  const parentReturnTo = isNew && entity === 'users' && initialClientId
    ? `/clients/${initialClientId}/users`
    : isNew && entity === 'applications' && initialClientId
      ? `/clients/${initialClientId}/applications`
      : isNew && entity === 'api-keys' && initialAppId
        ? `/applications/${initialAppId}/api-keys`
        : undefined
  const info = entityInfo[entity]
  const [form, setForm] = useState<RecordFormValues>(() => existing ? { ...existing } : {
    id: '', name: '',
    ...(entity === 'clients' ? { description: '', status: 'Activated' as Status } : {}),
    ...(entity === 'users' ? { givenName: '', familyName: '', email: '', phoneNumber: '', status: 'Pending' as Status, role: 'User' as const, clientId: initialClientId } : {}),
    ...(entity === 'applications' ? { clientId: initialClientId, oauth2ClientId: '', oauth2Secret: '', externalClientId: '', quotaValue: 1000, quotaUnit: 'month' as const, apiIds: [] as string[] } : {}),
    ...(entity === 'apis' ? { description: '' } : {}),
    ...(entity === 'api-keys' ? { appId: initialAppId } : {}),
  })
  const [error, setError] = useState('')
  if (!isNew && !existing) return <NotFound />
  const setField = (field: keyof RecordFormValues, value: string | number | string[]) => setForm((current) => ({ ...current, [field]: value }))
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const requiredByEntity: Record<Entity, string[]> = {
      clients: ['name'],
      users: ['givenName', 'familyName', 'email', 'clientId'],
      applications: ['name', 'clientId', 'oauth2ClientId', 'oauth2Secret', 'externalClientId', 'quotaValue'],
      apis: ['name', 'description'],
      'api-keys': ['name', 'appId'],
    }
    if (requiredByEntity[entity].some((field) => !String(form[field as keyof RecordFormValues] ?? '').trim())) {
      setError('Veuillez renseigner tous les champs obligatoires.')
      return
    }
    if (entity === 'users' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email ?? '')) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }
    if (entity === 'applications' && (!Number.isFinite(Number(form.quotaValue)) || Number(form.quotaValue) <= 0)) {
      setError('Le quota doit être un nombre supérieur à zéro.')
      return
    }
    const now = new Date().toISOString()
    const nextNumber = store[entity].reduce((highest, item) => Math.max(highest, Number(item.id.split('-')[1]) || 0), 999)
    const id = existing?.id ?? `${info.prefix}-${nextNumber + 1}`
    const createdOn = existing?.createdOn ?? now
    const common = { id, createdOn, updatedOn: now }
    let record: EntityRecord
    switch (entity) {
      case 'clients':
        record = { ...common, name: form.name.trim(), description: form.description ?? '', status: form.status ?? 'Activated' }
        break
      case 'users':
        record = { ...common, name: `${form.givenName ?? ''} ${form.familyName ?? ''}`.trim(), givenName: form.givenName ?? '', familyName: form.familyName ?? '', email: form.email ?? '', phoneNumber: form.phoneNumber ?? '', status: form.status ?? 'Pending', role: form.role ?? 'User', clientId: form.clientId ?? '' }
        break
      case 'applications':
        record = { ...common, name: form.name.trim(), clientId: existing && 'clientId' in existing ? existing.clientId : form.clientId ?? '', oauth2ClientId: form.oauth2ClientId ?? '', oauth2Secret: form.oauth2Secret ?? '', externalClientId: form.externalClientId ?? '', quotaValue: Number(form.quotaValue), quotaUnit: form.quotaUnit ?? 'month', apiIds: existing && 'apiIds' in existing ? existing.apiIds : [] }
        break
      case 'apis':
        record = { ...common, name: form.name.trim(), description: form.description ?? '', clientLinks: existing && 'clientLinks' in existing ? existing.clientLinks : [] }
        break
      case 'api-keys':
        record = { ...common, name: form.name.trim(), appId: existing && 'appId' in existing ? existing.appId : form.appId ?? '' }
        break
    }
    try {
      await onSave(entity, record, isNew)
      navigate(parentReturnTo ?? `/${entity}/${record.id}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'La requête API a échoué.')
    }
  }

  const renderFields = () => {
    switch (entity) {
      case 'clients': return <ClientFormFields form={form} setField={setField} />
      case 'users': return <UserFormFields form={form} setField={setField} store={store} lockedClientId={lockedClientId || undefined} />
      case 'applications': return <ApplicationFormFields form={form} setField={setField} store={store} lockedClientId={lockedClientId || undefined} />
      case 'apis': return <ApiFormFields form={form} setField={setField} />
      case 'api-keys': return <ApiKeyFormFields form={form} setField={setField} store={store} lockedAppId={lockedAppId || undefined} />
    }
  }

  return <>
    <div className="back-link-wrap"><Link to={existing ? `/${entity}/${existing.id}` : parentReturnTo ?? `/${entity}`} className="back-link"><Icon name="chevron" size={15} /> Annuler et revenir</Link></div>
    <PageHeading eyebrow={`${info.singular.toLocaleUpperCase('fr')} · ${isNew ? 'NOUVELLE CRÉATION' : 'MODIFICATION'}`} title={isNew ? `Ajouter ${info.singular.toLocaleLowerCase('fr')}` : 'Modifier les informations'} description={isNew ? `Renseignez les informations de votre ${info.singular.toLocaleLowerCase('fr')}.` : 'Mettez à jour les informations de cet enregistrement.'} />
    <form className="form-card" onSubmit={handleSubmit} noValidate><div className="form-section-title"><span className={`detail-record-icon ${info.color}`}><Icon name={info.icon} size={20} /></span><div><h2>{info.singular}</h2><p>Les champs marqués d’un astérisque sont obligatoires.</p></div></div><div className="form-fields">{renderFields()}</div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-footer"><span><span className="required-mark">*</span> Champs obligatoires</span><div><Link className="button button-secondary" to={existing ? `/${entity}/${existing.id}` : parentReturnTo ?? `/${entity}`}>Annuler</Link><button className="button button-primary" type="submit"><Icon name="check" size={17} /> {isNew ? 'Créer' : 'Enregistrer'}</button></div></div></form>
  </>
}
