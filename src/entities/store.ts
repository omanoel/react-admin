import type { RecordFormValues, Status, Store } from './types'
import type { ApiClientLink } from './apis/types'

const date = (daysAgo: number) => {
  const value = new Date()
  value.setDate(value.getDate() - daysAgo)
  return value.toISOString()
}

const initialStore: Store = {
  clients: [
    { id: 'CL-1042', name: 'Acme Studio', description: 'Studio de création et partenaire depuis 2022.', status: 'Activated', createdOn: date(32), updatedOn: date(2) },
    { id: 'CL-1041', name: 'Maison Kitsuné', description: 'Maison de mode et de musique.', status: 'Activated', createdOn: date(21), updatedOn: date(4) },
    { id: 'CL-1039', name: 'Atelier Auguste', description: 'Atelier de design indépendant.', status: 'Pending', createdOn: date(15), updatedOn: date(7) },
    { id: 'CL-1036', name: 'Studio Fable', description: 'Studio de production créative.', status: 'Deactivated', createdOn: date(8), updatedOn: date(8) },
  ],
  users: [
    { id: 'US-2081', name: 'Camille Laurent', givenName: 'Camille', familyName: 'Laurent', email: 'camille.laurent@acme.studio', phoneNumber: '+33 6 12 34 56 78', status: 'Activated', role: 'MainUser', clientId: 'CL-1042', createdOn: date(28), updatedOn: date(1) },
    { id: 'US-2079', name: 'Thomas Bernard', givenName: 'Thomas', familyName: 'Bernard', email: 'thomas@kitsune.fr', phoneNumber: '+33 6 23 45 67 89', status: 'Activated', role: 'MainUser', clientId: 'CL-1041', createdOn: date(19), updatedOn: date(3) },
    { id: 'US-2075', name: 'Léa Moreau', givenName: 'Léa', familyName: 'Moreau', email: 'lea.moreau@acme.studio', phoneNumber: '+33 6 34 56 78 90', status: 'Pending', role: 'User', clientId: 'CL-1042', createdOn: date(13), updatedOn: date(6) },
    { id: 'US-2072', name: 'Hugo Petit', givenName: 'Hugo', familyName: 'Petit', email: 'hugo@auguste.fr', phoneNumber: '+33 6 45 67 89 01', status: 'Activated', role: 'User', clientId: 'CL-1039', createdOn: date(9), updatedOn: date(9) },
  ],
  applications: [
    { id: 'AP-3018', name: 'Espace client', clientId: 'CL-1042', oauth2ClientId: 'acme-web-portal', oauth2Secret: 'demo-secret-acme', externalClientId: 'acme-ext-01', quotaValue: 5000, quotaUnit: 'month', apiIds: ['API-4010', 'API-4011'], createdOn: date(26), updatedOn: date(2) },
    { id: 'AP-3016', name: 'Gestion des stocks', clientId: 'CL-1041', oauth2ClientId: 'kitsune-stock', oauth2Secret: 'demo-secret-kitsune', externalClientId: 'kit-ext-02', quotaValue: 800, quotaUnit: 'day', apiIds: ['API-4020'], createdOn: date(18), updatedOn: date(5) },
    { id: 'AP-3012', name: 'Portail partenaire', clientId: 'CL-1039', oauth2ClientId: 'auguste-partner', oauth2Secret: 'demo-secret-auguste', externalClientId: 'aug-ext-03', quotaValue: 120, quotaUnit: 'hur', apiIds: [], createdOn: date(12), updatedOn: date(8) },
    { id: 'AP-3009', name: 'Analytics', clientId: 'CL-1042', oauth2ClientId: 'acme-analytics', oauth2Secret: 'demo-secret-analytics', externalClientId: 'acme-ext-04', quotaValue: 30, quotaUnit: 'minute', apiIds: ['API-4011'], createdOn: date(6), updatedOn: date(1) },
  ],
  apis: [
    { id: 'API-4010', name: 'Customer profile', description: 'Consultation et mise à jour des profils clients.', clientLinks: [{ clientId: 'CL-1042', createdOn: date(25) }], createdOn: date(25), updatedOn: date(3) },
    { id: 'API-4011', name: 'Orders', description: 'Consultation et suivi des commandes.', clientLinks: [{ clientId: 'CL-1042', createdOn: date(22) }, { clientId: 'CL-1041', createdOn: date(20) }], createdOn: date(22), updatedOn: date(2) },
    { id: 'API-4020', name: 'Inventory', description: 'Consultation des stocks et disponibilités.', clientLinks: [{ clientId: 'CL-1041', createdOn: date(16) }], createdOn: date(16), updatedOn: date(4) },
  ],
  'api-keys': [
    { id: 'KEY-5010', name: 'Production key', appId: 'AP-3018', createdOn: date(20), updatedOn: date(2) },
    { id: 'KEY-5011', name: 'Analytics key', appId: 'AP-3009', createdOn: date(10), updatedOn: date(1) },
  ],
}

interface LegacyRecord extends Omit<Partial<RecordFormValues>, 'status'> {
  id: string
  name: string
  status?: Status | 'Actived'
  clientLinks?: ApiClientLink[]
  createdAt?: string
  updatedAt?: string
}

function getLegacyRecords(value: unknown): LegacyRecord[] {
  return Array.isArray(value) ? value as LegacyRecord[] : []
}

function normalizeStatus(status: LegacyRecord['status'], fallback: Status): Status {
  if (status === 'Actived') return 'Activated'
  return status ?? fallback
}

function migrateStore(value: Record<string, unknown>): Store {
  const clients = getLegacyRecords(value.clients)
  const users = getLegacyRecords(value.users)
  const applications = getLegacyRecords(value.applications)
  const apis = getLegacyRecords(Array.isArray(value.apis) ? value.apis : initialStore.apis)
  const apiKeys = getLegacyRecords(Array.isArray(value['api-keys']) ? value['api-keys'] : initialStore['api-keys'])
  const now = new Date().toISOString()
  return {
    clients: clients.map((item) => {
      const defaults = initialStore.clients.find((sample) => sample.id === item.id)
      return { id: item.id, name: item.name, description: item.description ?? defaults?.description ?? '', status: normalizeStatus(item.status, defaults?.status ?? 'Activated'), createdOn: item.createdOn ?? item.createdAt ?? defaults?.createdOn ?? now, updatedOn: item.updatedOn ?? item.updatedAt ?? defaults?.updatedOn ?? now }
    }),
    users: users.map((item) => {
      const [givenName = '', ...familyNames] = item.name.split(' ')
      const defaults = initialStore.users.find((sample) => sample.id === item.id)
      return { id: item.id, name: item.name, givenName: item.givenName ?? defaults?.givenName ?? givenName, familyName: item.familyName ?? defaults?.familyName ?? familyNames.join(' '), email: item.email ?? defaults?.email ?? '', phoneNumber: item.phoneNumber ?? defaults?.phoneNumber ?? '', status: normalizeStatus(item.status, defaults?.status ?? 'Activated'), role: item.role ?? defaults?.role ?? 'User', clientId: item.clientId ?? defaults?.clientId ?? '', createdOn: item.createdOn ?? item.createdAt ?? defaults?.createdOn ?? now, updatedOn: item.updatedOn ?? item.updatedAt ?? defaults?.updatedOn ?? now }
    }),
    applications: applications.map((item) => {
      const defaults = initialStore.applications.find((sample) => sample.id === item.id)
      return { id: item.id, name: item.name, clientId: item.clientId ?? defaults?.clientId ?? '', oauth2ClientId: item.oauth2ClientId ?? defaults?.oauth2ClientId ?? '', oauth2Secret: item.oauth2Secret ?? defaults?.oauth2Secret ?? '', externalClientId: item.externalClientId ?? defaults?.externalClientId ?? '', quotaValue: item.quotaValue ?? defaults?.quotaValue ?? 0, quotaUnit: item.quotaUnit ?? defaults?.quotaUnit ?? 'month', apiIds: item.apiIds ?? defaults?.apiIds ?? [], createdOn: item.createdOn ?? item.createdAt ?? defaults?.createdOn ?? now, updatedOn: item.updatedOn ?? item.updatedAt ?? defaults?.updatedOn ?? now }
    }),
    apis: apis.map((item) => {
      const defaults = initialStore.apis.find((sample) => sample.id === item.id)
      const createdOn = item.createdOn ?? item.createdAt ?? defaults?.createdOn ?? now
      const legacyClientIds = item.clientIds ?? (item.clientId !== undefined ? (item.clientId ? [item.clientId] : []) : undefined)
      const clientLinks = item.clientLinks ?? legacyClientIds?.map((clientId) => ({ clientId, createdOn })) ?? defaults?.clientLinks ?? []
      return { id: item.id, name: item.name, description: item.description ?? '', clientLinks, createdOn, updatedOn: item.updatedOn ?? item.updatedAt ?? defaults?.updatedOn ?? now }
    }),
    'api-keys': apiKeys.map((item) => ({ id: item.id, name: item.name, appId: item.appId ?? '', createdOn: item.createdOn ?? item.createdAt ?? now, updatedOn: item.updatedOn ?? item.updatedAt ?? now })),
  }
}

export function getInitialStore(): Store {
  const stored = localStorage.getItem('atelier-admin-data')
  if (!stored) return initialStore
  try {
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed === 'object' && parsed !== null && 'clients' in parsed && 'users' in parsed && 'applications' in parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.users) && Array.isArray(parsed.applications)) {
      return migrateStore(parsed as Record<string, unknown>)
    }
  } catch {
    return initialStore
  }
  return initialStore
}
