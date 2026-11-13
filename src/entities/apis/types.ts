import type { RecordItem } from '../record'

export interface ApiClientLink {
  clientId: string
  createdOn: string
}

export interface ApiItem extends RecordItem {
  description: string
  clientLinks: ApiClientLink[]
}

export function isApiItem(record: RecordItem): record is ApiItem {
  return 'description' in record && 'clientLinks' in record && Array.isArray(record.clientLinks) && !('status' in record)
}
