import type { RecordItem } from '../record'
import type { ClientStatus } from '../clients/types'

export interface UserItem extends RecordItem {
  givenName: string
  familyName: string
  email: string
  phoneNumber: string
  status: ClientStatus
  role: 'User' | 'MainUser'
  clientId: string
}

export function isUserItem(record: RecordItem): record is UserItem {
  return 'givenName' in record && 'familyName' in record
}
