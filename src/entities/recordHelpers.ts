import type { EntityRecord, Store } from './types'

export function getClientName(store: Store, item: EntityRecord) {
  return 'clientId' in item ? store.clients.find((client) => client.id === item.clientId)?.name ?? '' : ''
}
