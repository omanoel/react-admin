import type { ApiItem } from './apis/types'
import type { ApiKeyItem } from './api-keys/types'
import type { ApplicationItem } from './applications/types'
import type { ClientItem } from './clients/types'
import type { UserItem } from './users/types'

export type Entity = 'clients' | 'users' | 'applications' | 'apis' | 'api-keys'
export type Status = ClientItem['status']
export type EntityRecord = ClientItem | UserItem | ApplicationItem | ApiItem | ApiKeyItem
export type Store = {
  clients: ClientItem[]
  users: UserItem[]
  applications: ApplicationItem[]
  apis: ApiItem[]
  'api-keys': ApiKeyItem[]
}

export interface RecordFormValues {
  id: string
  name: string
  createdOn?: string
  updatedOn?: string
  clientId?: string
  clientIds?: string[]
  appId?: string
  description?: string
  status?: Status
  givenName?: string
  familyName?: string
  email?: string
  phoneNumber?: string
  role?: UserItem['role']
  oauth2ClientId?: string
  oauth2Secret?: string
  externalClientId?: string
  quotaValue?: number
  quotaUnit?: ApplicationItem['quotaUnit']
  apiIds?: string[]
}
