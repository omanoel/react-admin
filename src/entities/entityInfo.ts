import type { Entity } from './types'

export const entityInfo: Record<Entity, { label: string; singular: string; icon: string; color: string; prefix: string }> = {
  clients: { label: 'Clients', singular: 'Client', icon: 'building', color: 'violet', prefix: 'CL' },
  users: { label: 'Utilisateurs', singular: 'Utilisateur', icon: 'users', color: 'blue', prefix: 'US' },
  applications: { label: 'Applications', singular: 'Application', icon: 'grid', color: 'orange', prefix: 'AP' },
  apis: { label: 'APIs', singular: 'API', icon: 'code', color: 'teal', prefix: 'API' },
  'api-keys': { label: 'Clés API', singular: 'Clé API', icon: 'key', color: 'pink', prefix: 'KEY' },
}
