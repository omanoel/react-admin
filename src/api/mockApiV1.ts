import { getInitialStore } from '../entities/store'
import { isApiItem, type ApiItem } from '../entities/apis/types'
import { isApiKeyItem, type ApiKeyItem } from '../entities/api-keys/types'
import { isApplicationItem, type ApplicationItem } from '../entities/applications/types'
import { isClientItem, type ClientItem } from '../entities/clients/types'
import type { Entity, EntityRecord, Store } from '../entities/types'
import { isUserItem, type UserItem } from '../entities/users/types'
import type { RecordItem } from '../entities/record'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

let database = getInitialStore()

const isEntity = (value: string): value is Entity =>
  value === 'clients' || value === 'users' || value === 'applications' || value === 'apis' || value === 'api-keys'

function isRecordForEntity(entity: Entity, value: unknown): value is EntityRecord {
  if (typeof value !== 'object' || value === null || !('id' in value) || !('name' in value) || !('createdOn' in value) || !('updatedOn' in value)) return false
  const record = value as RecordItem
  switch (entity) {
    case 'clients': return isClientItem(record)
    case 'users': return isUserItem(record)
    case 'applications': return isApplicationItem(record)
    case 'apis': return isApiItem(record)
    case 'api-keys': return isApiKeyItem(record)
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function persist() {
  localStorage.setItem('atelier-admin-data', JSON.stringify(database))
}

function fail(status: number, message: string): never {
  throw new ApiError(status, message)
}

class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function requireRecord<T extends EntityRecord>(collection: T[], id: string, entity: string): T {
  const record = collection.find((item) => item.id === id)
  if (!record) return fail(404, `${entity} introuvable.`)
  return record
}

function requireClient(id: string): ClientItem {
  return requireRecord(database.clients, id, 'Client')
}

function requireApplication(id: string): ApplicationItem {
  return requireRecord(database.applications, id, 'Application')
}

function validateParent(entity: Entity, record: EntityRecord, existing?: EntityRecord) {
  if (entity === 'users' && 'clientId' in record) {
    if (existing && 'clientId' in existing && record.clientId !== existing.clientId) fail(400, 'Le client d’un utilisateur ne peut pas être modifié.')
    requireClient(record.clientId)
  }
  if (entity === 'applications' && 'clientId' in record) {
    if (existing && 'clientId' in existing && record.clientId !== existing.clientId) fail(400, 'Le client d’une application ne peut pas être modifié.')
    requireClient(record.clientId)
    if (existing && 'apiIds' in existing && 'apiIds' in record && JSON.stringify(record.apiIds) !== JSON.stringify(existing.apiIds)) fail(400, 'Les APIs d’une application doivent être gérées depuis sa route /apis.')
  }
  if (entity === 'api-keys' && 'appId' in record) {
    if (existing && 'appId' in existing && record.appId !== existing.appId) fail(400, 'L’application d’une clé API ne peut pas être modifiée.')
    requireApplication(record.appId)
  }
  if (entity === 'apis' && 'clientLinks' in record) {
    if (existing && 'clientLinks' in existing && JSON.stringify(record.clientLinks) !== JSON.stringify(existing.clientLinks)) fail(400, 'Les clients d’une API doivent être gérés depuis leur fiche Client.')
    record.clientLinks.forEach((link) => requireClient(link.clientId))
  }
}

function removeRecord(entity: Entity, id: string) {
  if (entity === 'clients') {
    const applicationIds = new Set(database.applications.filter((item) => item.clientId === id).map((item) => item.id))
    database = {
      ...database,
      clients: database.clients.filter((item) => item.id !== id),
      users: database.users.filter((item) => item.clientId !== id),
      applications: database.applications.filter((item) => item.clientId !== id),
      apis: database.apis.map((api) => ({ ...api, clientLinks: api.clientLinks.filter((link) => link.clientId !== id) })),
      'api-keys': database['api-keys'].filter((item) => !applicationIds.has(item.appId)),
    }
    return
  }
  if (entity === 'applications') {
    database = { ...database, applications: database.applications.filter((item) => item.id !== id), 'api-keys': database['api-keys'].filter((item) => item.appId !== id) }
    return
  }
  if (entity === 'apis') {
    database = { ...database, apis: database.apis.filter((item) => item.id !== id), applications: database.applications.map((item) => ({ ...item, apiIds: item.apiIds.filter((apiId) => apiId !== id) })) }
    return
  }
  database = { ...database, [entity]: database[entity].filter((item) => item.id !== id) }
}

function updateClientApis(clientId: string, apiIds: string[]) {
  requireClient(clientId)
  const selectedIds = new Set(apiIds)
  const apiMap = new Map(database.apis.map((api) => [api.id, api]))
  selectedIds.forEach((apiId) => {
    if (!apiMap.has(apiId)) fail(404, `API ${apiId} introuvable.`)
  })
  const now = new Date().toISOString()
  const removedIds = new Set<string>()
  const apis = database.apis.map((api) => {
    const existingLink = api.clientLinks.find((link) => link.clientId === clientId)
    const shouldLink = selectedIds.has(api.id)
    if (existingLink && !shouldLink) removedIds.add(api.id)
    if (Boolean(existingLink) === shouldLink) return api
    return {
      ...api,
      updatedOn: now,
      clientLinks: shouldLink ? [...api.clientLinks, { clientId, createdOn: now }] : api.clientLinks.filter((link) => link.clientId !== clientId),
    }
  })
  const applications = database.applications.map((application) => {
    if (application.clientId !== clientId) return application
    const apiIds = application.apiIds.filter((apiId) => !removedIds.has(apiId))
    return apiIds.length === application.apiIds.length ? application : { ...application, apiIds, updatedOn: now }
  })
  database = { ...database, apis, applications }
  return { apis, applications }
}

function handleRelationship(method: HttpMethod, segments: string[], body: unknown): unknown | undefined {
  const [entity, id, relation, relatedId] = segments
  if (!id || !relation) return undefined

  if (entity === 'clients' && relation === 'apis') {
    requireClient(id)
    if (method === 'GET') return database.apis.filter((api) => api.clientLinks.some((link) => link.clientId === id))
    if (method === 'POST') {
      const apiId = typeof body === 'object' && body !== null && 'apiId' in body ? body.apiId : undefined
      if (typeof apiId !== 'string') return fail(400, 'apiId est obligatoire.')
      const api = requireRecord(database.apis, apiId, 'API')
      if (!api.clientLinks.some((link) => link.clientId === id)) {
        const now = new Date().toISOString()
        database = { ...database, apis: database.apis.map((item) => item.id === apiId ? { ...item, updatedOn: now, clientLinks: [...item.clientLinks, { clientId: id, createdOn: now }] } : item) }
      }
      return { apis: database.apis, applications: database.applications }
    }
    if (method === 'PUT') {
      const apiIds = typeof body === 'object' && body !== null && 'apiIds' in body ? body.apiIds : undefined
      if (!Array.isArray(apiIds) || apiIds.some((apiId) => typeof apiId !== 'string')) return fail(400, 'apiIds doit être une liste d’identifiants.')
      return updateClientApis(id, apiIds)
    }
    if (method === 'DELETE' && relatedId) return updateClientApis(id, database.apis.filter((api) => api.clientLinks.some((link) => link.clientId === id) && api.id !== relatedId).map((api) => api.id))
  }

  if (entity === 'applications' && (relation === 'apis' || relation === 'api-keys')) {
    const application = requireApplication(id)
    if (relation === 'api-keys' && method === 'GET') return database['api-keys'].filter((key) => key.appId === id)
    if (relation === 'apis' && method === 'GET') return database.apis.filter((api) => application.apiIds.includes(api.id))
    if (relation === 'apis' && (method === 'PUT' || method === 'DELETE' && relatedId)) {
      const requestApiIds = method === 'DELETE'
        ? application.apiIds.filter((apiId) => apiId !== relatedId)
        : typeof body === 'object' && body !== null && 'apiIds' in body ? body.apiIds : undefined
      if (!Array.isArray(requestApiIds) || requestApiIds.some((apiId) => typeof apiId !== 'string')) return fail(400, 'apiIds doit être une liste d’identifiants.')
      const allowedIds = new Set(database.apis.filter((api) => api.clientLinks.some((link) => link.clientId === application.clientId)).map((api) => api.id))
      if (requestApiIds.some((apiId) => !allowedIds.has(apiId))) return fail(400, 'Une application ne peut utiliser que les APIs associées à son client.')
      const updated = { ...application, apiIds: [...new Set(requestApiIds)], updatedOn: new Date().toISOString() }
      database = { ...database, applications: database.applications.map((item) => item.id === id ? updated : item) }
      return updated
    }
  }

  if (entity === 'apis' && (relation === 'clients' || relation === 'applications') && method === 'GET') {
    const api = requireRecord(database.apis, id, 'API')
    if (relation === 'clients') return api.clientLinks.flatMap((link) => database.clients.filter((client) => client.id === link.clientId))
    return database.applications.filter((application) => application.apiIds.includes(id) && api.clientLinks.some((link) => link.clientId === application.clientId))
  }
  return undefined
}

function handleCollection(method: HttpMethod, segments: string[], body: unknown): unknown {
  const [entityName, id] = segments
  if (!entityName || !isEntity(entityName)) return fail(404, 'Route API introuvable.')
  const collection = database[entityName] as EntityRecord[]
  if (!id) {
    if (method === 'GET') return collection
    if (method === 'POST') {
      if (!isRecordForEntity(entityName, body)) return fail(400, 'Enregistrement invalide.')
      const record = body
      if (typeof record.id !== 'string' || typeof record.name !== 'string') return fail(400, 'Enregistrement invalide.')
      if (collection.some((item) => item.id === record.id)) return fail(409, 'Cet identifiant existe déjà.')
      validateParent(entityName, record)
      database = { ...database, [entityName]: [record, ...collection] }
      return record
    }
    return fail(405, 'Méthode non autorisée pour cette collection.')
  }
  const existing = collection.find((item) => item.id === id)
  if (method === 'GET') return existing ?? fail(404, 'Enregistrement introuvable.')
  if (method === 'PUT') {
    if (!existing) return fail(404, 'Enregistrement introuvable.')
    if (!isRecordForEntity(entityName, body)) return fail(400, 'Enregistrement invalide.')
    const record = body
    if (!record || record.id !== id || typeof record.name !== 'string') return fail(400, 'Enregistrement invalide.')
    validateParent(entityName, record, existing)
    database = { ...database, [entityName]: collection.map((item) => item.id === id ? record : item) }
    return record
  }
  if (method === 'DELETE') {
    if (!existing) return fail(404, 'Enregistrement introuvable.')
    removeRecord(entityName, id)
    return { id, deleted: true }
  }
  return fail(405, 'Méthode non autorisée pour cet enregistrement.')
}

async function mockApiV1Middleware(request: Request): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, 60))
  try {
    const url = new URL(request.url)
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments[0] !== 'api' || segments[1] !== 'v1') fail(404, 'API v1 introuvable.')
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) fail(405, 'Méthode HTTP non prise en charge.')
    const method = request.method as HttpMethod
    const body = method === 'POST' || method === 'PUT' ? await request.json() as unknown : undefined
    let result: unknown
    if (segments.length > 4) {
      result = handleRelationship(method, segments.slice(2), body)
      if (result === undefined) fail(404, 'Route de relation introuvable.')
    } else {
      result = handleCollection(method, segments.slice(2), body)
    }
    if (method !== 'GET') persist()
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    return new Response(JSON.stringify({ message: error.message }), { status: error.status, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function apiRequest<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
  const request = new Request(new URL(url, 'http://api.local'), {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const response = await mockApiV1Middleware(request)
  const result: unknown = await response.json()
  if (!response.ok) {
    const message = typeof result === 'object' && result !== null && 'message' in result && typeof result.message === 'string'
      ? result.message
      : `La requête API a échoué (${response.status}).`
    throw new Error(message)
  }
  return clone(result) as T
}

export async function fetchApiStore(): Promise<Store> {
  const [clients, users, applications, apis, apiKeys] = await Promise.all([
    apiRequest<ClientItem[]>('GET', '/api/v1/clients'),
    apiRequest<UserItem[]>('GET', '/api/v1/users'),
    apiRequest<ApplicationItem[]>('GET', '/api/v1/applications'),
    apiRequest<ApiItem[]>('GET', '/api/v1/apis'),
    apiRequest<ApiKeyItem[]>('GET', '/api/v1/api-keys'),
  ])
  return { clients, users, applications, apis, 'api-keys': apiKeys }
}
