import type { RecordItem } from '../record'

export type ClientStatus = 'Activated' | 'Deactivated' | 'Pending'

export interface ClientItem extends RecordItem {
  description: string
  status: ClientStatus
}

export function isClientItem(record: RecordItem): record is ClientItem {
  return 'description' in record && 'status' in record
}
