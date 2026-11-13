import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon, PageHeading } from '../components/common'
import { entityInfo } from '../entities/entityInfo'
import type { Store } from '../entities/types'
import { NotFound } from './NotFound'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'La requête API a échoué.'
}

export function ApiLinkForm({ store, onLink }: { store: Store; onLink: (clientId: string, apiId: string) => Promise<void> }) {
  const { id: clientId } = useParams()
  const navigate = useNavigate()
  const client = store.clients.find((item) => item.id === clientId)
  const [apiId, setApiId] = useState('')
  const [error, setError] = useState('')
  if (!client) return <NotFound />
  const availableApis = store.apis.filter((api) => !api.clientLinks.some((link) => link.clientId === client.id))
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!availableApis.some((api) => api.id === apiId)) {
      setError('Sélectionnez une API qui n’est pas encore associée à ce client.')
      return
    }
    try {
      await onLink(client.id, apiId)
      navigate(`/clients/${client.id}/apis`)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }
  return <>
    <div className="back-link-wrap"><Link to={`/clients/${client.id}/apis`} className="back-link"><Icon name="chevron" size={15} /> Retour aux APIs de {client.name}</Link></div>
    <PageHeading title="Associer une API" description={`Choisissez une API existante à associer à ${client.name}.`} />
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-section-title"><span className={`detail-record-icon ${entityInfo.apis.color}`}><Icon name={entityInfo.apis.icon} size={20} /></span><div><h2>API</h2><p>Cette action crée un lien daté sans créer une nouvelle API.</p></div></div>
      <div className="form-fields"><label className="form-field"><span>API existante <em>*</em></span><select autoFocus value={apiId} onChange={(event) => setApiId(event.target.value)}><option value="">Sélectionner une API</option>{availableApis.map((api) => <option value={api.id} key={api.id}>{api.name} · {api.id}</option>)}</select>{availableApis.length === 0 && <small>Toutes les APIs existantes sont déjà associées à ce client.</small>}</label></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-footer"><span>Client : <strong>{client.name}</strong></span><div><Link className="button button-secondary" to={`/clients/${client.id}/apis`}>Annuler</Link><button className="button button-primary" type="submit" disabled={availableApis.length === 0}><Icon name="check" size={17} /> Associer l’API</button></div></div>
    </form>
  </>
}

export function ClientApiManager({ store, onSave }: { store: Store; onSave: (clientId: string, apiIds: string[]) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = store.clients.find((item) => item.id === id)
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>(() => client ? store.apis.filter((api) => api.clientLinks.some((link) => link.clientId === client.id)).map((api) => api.id) : [])
  const [error, setError] = useState('')
  if (!client) return <NotFound />
  const toggleApi = (apiId: string, checked: boolean) => setSelectedApiIds((current) => checked ? [...current.filter((item) => item !== apiId), apiId] : current.filter((item) => item !== apiId))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await onSave(client.id, selectedApiIds)
      navigate(`/clients/${client.id}/apis`)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }
  return <>
    <div className="back-link-wrap"><Link to={`/clients/${client.id}/apis`} className="back-link"><Icon name="chevron" size={15} /> Retour aux APIs de {client.name}</Link></div>
    <PageHeading eyebrow="CLIENT · ASSOCIATIONS" title="Gérer les APIs" description={`Associez ou retirez les APIs disponibles pour ${client.name}.`} />
    <form className="form-card" onSubmit={submit}><div className="form-section-title"><span className={`detail-record-icon ${entityInfo.apis.color}`}><Icon name={entityInfo.apis.icon} size={20} /></span><div><h2>APIs associées</h2><p>La date de création d’un lien est conservée ; un nouveau lien est daté à son enregistrement.</p></div></div><div className="form-fields"><fieldset className="api-picker"><legend>APIs disponibles</legend>{store.apis.length ? store.apis.map((api) => <label className="api-option" key={api.id}><input type="checkbox" checked={selectedApiIds.includes(api.id)} onChange={(event) => toggleApi(api.id, event.target.checked)} /><span><strong>{api.name}</strong><small>{api.description}</small></span></label>) : <p>Aucune API n’est encore créée.</p>}</fieldset></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-footer"><span>{selectedApiIds.length} API associée{selectedApiIds.length === 1 ? '' : 's'}</span><div><Link className="button button-secondary" to={`/clients/${client.id}/apis`}>Annuler</Link><button className="button button-primary" type="submit"><Icon name="check" size={17} /> Enregistrer les liaisons</button></div></div></form>
  </>
}

export function ApplicationApiManager({ store, onSave }: { store: Store; onSave: (applicationId: string, apiIds: string[]) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const application = store.applications.find((item) => item.id === id)
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>(() => application?.apiIds ?? [])
  const [error, setError] = useState('')
  if (!application) return <NotFound />
  const availableApis = store.apis.filter((api) => api.clientLinks.some((link) => link.clientId === application.clientId))
  const availableApiIds = new Set(availableApis.map((api) => api.id))
  const selected = selectedApiIds.filter((apiId) => availableApiIds.has(apiId))
  const toggleApi = (apiId: string, checked: boolean) => setSelectedApiIds((current) => checked ? [...current.filter((item) => item !== apiId), apiId] : current.filter((item) => item !== apiId))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await onSave(application.id, selected)
      navigate(`/applications/${application.id}/apis`)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }
  return <>
    <div className="back-link-wrap"><Link to={`/applications/${application.id}/apis`} className="back-link"><Icon name="chevron" size={15} /> Retour aux APIs</Link></div>
    <PageHeading eyebrow="APPLICATION · ASSOCIATIONS" title="Gérer les APIs" description={`Sélectionnez les APIs disponibles pour ${application.name}.`} />
    <form className="form-card" onSubmit={submit}><div className="form-section-title"><span className="detail-record-icon teal"><Icon name="code" size={20} /></span><div><h2>APIs disponibles pour le client</h2><p>Seules les APIs associées au client de cette application sont proposées.</p></div></div><div className="form-fields"><fieldset className="api-picker"><legend>APIs autorisées</legend>{availableApis.length ? availableApis.map((api) => <label className="api-option" key={api.id}><input type="checkbox" checked={selected.includes(api.id)} onChange={(event) => toggleApi(api.id, event.target.checked)} /><span><strong>{api.name}</strong><small>{api.description}</small></span></label>) : <p>Aucune API n’est associée au client de cette application.</p>}</fieldset></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-footer"><span>{selected.length} API sélectionnée{selected.length === 1 ? '' : 's'}</span><div><Link className="button button-secondary" to={`/applications/${application.id}/apis`}>Annuler</Link><button className="button button-primary" type="submit"><Icon name="check" size={17} /> Enregistrer les associations</button></div></div></form>
  </>
}
