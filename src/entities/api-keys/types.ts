import type { RecordItem } from '../record'

export interface ApiKeyItem extends RecordItem {
  appId: string
}

export function isApiKeyItem(record: RecordItem): record is ApiKeyItem {
  return 'appId' in record
}
