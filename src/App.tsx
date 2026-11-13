import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import type { Entity, EntityRecord, Store } from './entities/types'
import { deleteApiRecord, linkClientApi, loadApiStore, saveApiRecord, saveApplicationApiLinks, saveClientApiLinks } from './state/apiSlice'
import { useAppDispatch, useAppSelector } from './state/hooks'
import { AppLayout } from './layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { DeleteRecord } from './pages/DeleteRecord'
import { EntityList } from './pages/EntityList'
import { NotFound } from './pages/NotFound'
import { RecordDetail } from './pages/RecordDetail'
import { RecordForm } from './pages/RecordForm'
import { ApiLinkForm, ApplicationApiManager, ClientApiManager } from './pages/RelationshipManagers'
import './App.css'

function Workspace() {
  const dispatch = useAppDispatch()
  const { data: store, loading, error } = useAppSelector((state) => state.api)
  useEffect(() => { void dispatch(loadApiStore()) }, [dispatch])
  const save = async (entity: Entity, record: EntityRecord, isNew: boolean) => {
    await dispatch(saveApiRecord({ entity, record, isNew })).unwrap()
  }
  const remove = async (entity: Entity, id: string) => {
    await dispatch(deleteApiRecord({ entity, id })).unwrap()
  }
  const addClientApi = async (clientId: string, apiId: string) => {
    await dispatch(linkClientApi({ clientId, apiId })).unwrap()
  }
  const updateClientApis = async (clientId: string, apiIds: string[]) => {
    await dispatch(saveClientApiLinks({ clientId, apiIds })).unwrap()
  }
  const updateApplicationApis = async (applicationId: string, apiIds: string[]) => {
    await dispatch(saveApplicationApiLinks({ applicationId, apiIds })).unwrap()
  }
  const validEntity = (entity: string | undefined): entity is Entity => entity === 'clients' || entity === 'users' || entity === 'applications' || entity === 'apis' || entity === 'api-keys'
  if (!store) return <main className="api-loading" aria-live="polite">{loading ? <p>Chargement des données…</p> : <><p role="alert">{error ?? 'Les données ne sont pas disponibles.'}</p><button className="button button-primary" onClick={() => { void dispatch(loadApiStore()) }}>Réessayer</button></>}</main>
  return <AppLayout store={store}><Routes>
    <Route path="/" element={<Dashboard store={store} />} />
    <Route path="/clients/:id/apis/add" element={<ApiLinkForm store={store} onLink={addClientApi} />} />
    <Route path="/clients/:id/apis/edit" element={<ClientApiManager store={store} onSave={updateClientApis} />} />
    <Route path="/applications/:id/apis/edit" element={<ApplicationApiManager store={store} onSave={updateApplicationApis} />} />
    <Route path="/:entity" element={<EntityRoute store={store} validEntity={validEntity} />} />
    <Route path="/:entity/add" element={<EntityFormRoute store={store} onSave={save} validEntity={validEntity} />} />
    <Route path="/:entity/:id/upd" element={<EntityFormRoute store={store} onSave={save} validEntity={validEntity} />} />
    <Route path="/:entity/:id/del" element={<EntityDeleteRoute store={store} onDelete={remove} validEntity={validEntity} />} />
    <Route path="/:entity/:id/:tab" element={<EntityDetailRoute store={store} validEntity={validEntity} />} />
    <Route path="/:entity/:id" element={<EntityDetailRoute store={store} validEntity={validEntity} />} />
    <Route path="*" element={<NotFound />} />
  </Routes></AppLayout>
}

function EntityRoute({ store, validEntity }: { store: Store; validEntity: (entity: string | undefined) => entity is Entity }) {
  const { entity } = useParams()
  return validEntity(entity) ? <EntityList entity={entity} store={store} /> : <NotFound />
}

function EntityDetailRoute({ store, validEntity }: { store: Store; validEntity: (entity: string | undefined) => entity is Entity }) {
  const { entity } = useParams()
  return validEntity(entity) ? <RecordDetail entity={entity} store={store} /> : <NotFound />
}

function EntityFormRoute({ store, onSave, validEntity }: { store: Store; onSave: (entity: Entity, record: EntityRecord, isNew: boolean) => Promise<void>; validEntity: (entity: string | undefined) => entity is Entity }) {
  const { entity } = useParams()
  return validEntity(entity) ? <RecordForm entity={entity} store={store} onSave={onSave} /> : <NotFound />
}

function EntityDeleteRoute({ store, onDelete, validEntity }: { store: Store; onDelete: (entity: Entity, id: string) => Promise<void>; validEntity: (entity: string | undefined) => entity is Entity }) {
  const { entity } = useParams()
  return validEntity(entity) ? <DeleteRecord entity={entity} store={store} onDelete={onDelete} /> : <NotFound />
}

function App() {
  return <BrowserRouter><Workspace /></BrowserRouter>
}

export default App
