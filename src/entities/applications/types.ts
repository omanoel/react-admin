import type { RecordItem } from '../record'

export type QuotaUnit = 'month' | 'week' | 'day' | 'hur' | 'minute'

export interface ApplicationItem extends RecordItem {
  clientId: string
  oauth2ClientId: string
  oauth2Secret: string
  externalClientId: string
  quotaValue: number
  quotaUnit: QuotaUnit
  apiIds: string[]
}

export function isApplicationItem(record: RecordItem): record is ApplicationItem {
  return 'oauth2ClientId' in record && 'apiIds' in record
}
