import { create } from 'zustand'

const ZONE_COLORS = [
  '#ef9a9a',
  '#f48fb1',
  '#ce93d8',
  '#9fa8da',
  '#80cbc4',
  '#fff176',
  '#ffcc80',
  '#ffab91',
  '#bcaaa4',
  '#b0bec5',
]

export const APP_STATE_VERSION = 1
export const APP_STATE_STORAGE_KEY = 'timezone-planner/state'
export const APP_STATE_URL_PARAM = 'tz'

type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
}

const memoryStorageData = new Map<string, string>()

const memoryStorage: StorageLike = {
  getItem: (key) => memoryStorageData.get(key) ?? null,
  setItem: (key, value) => {
    memoryStorageData.set(key, value)
  },
  removeItem: (key) => {
    memoryStorageData.delete(key)
  },
  clear: () => {
    memoryStorageData.clear()
  },
}

export type BusinessHoursPreset = {
  start: string
  end: string
  weekdaysOnly: boolean
}

export type SelectedTimeZone = {
  id: string
  city: string
  zone: string
  color: string
  isTarget: boolean
  businessHours: BusinessHoursPreset
}

type PersistedAppState = {
  version: number
  selectedZones: SelectedTimeZone[]
}

export type AppState = {
  selectedZones: SelectedTimeZone[]
  addZone: (zone: string, city: string) => void
  removeZone: (zoneId: string) => void
  reorderZones: (activeId: string, overId: string) => void
  setBusinessHours: (zoneId: string, start: string, end: string) => void
  moveZoneEarlier: (zoneId: string) => void
  moveZoneLater: (zoneId: string) => void
  toggleTarget: (zoneId: string) => void
  resetTargets: () => void
}

const deriveZoneId = (zone: string): string =>
  zone.replace(/[/_]/g, '-').toLowerCase()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isBusinessHoursPreset = (value: unknown): value is BusinessHoursPreset =>
  isRecord(value) &&
  typeof value.start === 'string' &&
  typeof value.end === 'string' &&
  typeof value.weekdaysOnly === 'boolean'

const isSelectedTimeZone = (value: unknown): value is SelectedTimeZone =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.city === 'string' &&
  typeof value.zone === 'string' &&
  typeof value.color === 'string' &&
  typeof value.isTarget === 'boolean' &&
  isBusinessHoursPreset(value.businessHours)

const moveItem = <T>(items: T[], fromIndex: number, toIndex: number): T[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items
  }

  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)

  nextItems.splice(toIndex, 0, movedItem)

  return nextItems
}

export const seededTimeZones: SelectedTimeZone[] = [
  {
    id: 'new-york',
    city: 'New York',
    zone: 'America/New_York',
    color: '#4dd0e1',
    isTarget: true,
    businessHours: { start: '09:00', end: '17:00', weekdaysOnly: true },
  },
  {
    id: 'london',
    city: 'London',
    zone: 'Europe/London',
    color: '#ffb74d',
    isTarget: false,
    businessHours: { start: '09:00', end: '17:00', weekdaysOnly: true },
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    zone: 'Asia/Tokyo',
    color: '#81c784',
    isTarget: false,
    businessHours: { start: '09:00', end: '17:00', weekdaysOnly: true },
  },
]

export const cloneSeededTimeZones = (): SelectedTimeZone[] =>
  seededTimeZones.map((entry) => ({
    ...entry,
    businessHours: { ...entry.businessHours },
  }))

const normalizeSelectedZones = (
  zones: SelectedTimeZone[],
): SelectedTimeZone[] => {
  const deduped: SelectedTimeZone[] = []
  const seenZones = new Set<string>()

  for (const [index, entry] of zones.entries()) {
    if (seenZones.has(entry.zone)) {
      continue
    }

    seenZones.add(entry.zone)
    deduped.push({
      ...entry,
      id: entry.id || deriveZoneId(entry.zone),
      color: entry.color || ZONE_COLORS[index % ZONE_COLORS.length],
      businessHours: {
        ...entry.businessHours,
        weekdaysOnly: Boolean(entry.businessHours.weekdaysOnly),
      },
    })
  }

  if (deduped.length === 0) {
    return cloneSeededTimeZones()
  }

  if (!deduped.some((entry) => entry.isTarget)) {
    return deduped.map((entry, index) => ({
      ...entry,
      isTarget: index === 0,
    }))
  }

  return deduped
}

const getStorage = (): StorageLike => {
  if (
    typeof window !== 'undefined' &&
    typeof window.localStorage?.getItem === 'function' &&
    typeof window.localStorage?.setItem === 'function'
  ) {
    return window.localStorage
  }

  return memoryStorage
}

export const serializeAppState = (selectedZones: SelectedTimeZone[]): string =>
  JSON.stringify({
    version: APP_STATE_VERSION,
    selectedZones,
  } satisfies PersistedAppState)

const parsePersistedAppState = (
  raw: string | null,
): SelectedTimeZone[] | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!isRecord(parsed) || parsed.version !== APP_STATE_VERSION) {
      return null
    }

    if (!Array.isArray(parsed.selectedZones)) {
      return null
    }

    const selectedZones = parsed.selectedZones.filter(isSelectedTimeZone)

    if (selectedZones.length !== parsed.selectedZones.length) {
      return null
    }

    return normalizeSelectedZones(selectedZones)
  } catch {
    return null
  }
}

export const readSelectedZonesFromLocalStorage = ():
  | SelectedTimeZone[]
  | null => {
  return parsePersistedAppState(getStorage().getItem(APP_STATE_STORAGE_KEY))
}

export const readSelectedZonesFromUrl = (
  search: string = typeof window === 'undefined' ? '' : window.location.search,
): SelectedTimeZone[] | null => {
  const params = new URLSearchParams(search)
  return parsePersistedAppState(params.get(APP_STATE_URL_PARAM))
}

export const writeSelectedZonesToLocalStorage = (
  selectedZones: SelectedTimeZone[],
): void => {
  getStorage().setItem(APP_STATE_STORAGE_KEY, serializeAppState(selectedZones))
}

export const writeSelectedZonesToUrl = (
  selectedZones: SelectedTimeZone[],
): void => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.set(APP_STATE_URL_PARAM, serializeAppState(selectedZones))
  window.history.replaceState({}, '', url)
}

export const persistSelectedZones = (
  selectedZones: SelectedTimeZone[],
): void => {
  const normalized = normalizeSelectedZones(selectedZones)
  writeSelectedZonesToLocalStorage(normalized)
  writeSelectedZonesToUrl(normalized)
}

export const clearPersistedState = (): void => {
  getStorage().removeItem(APP_STATE_STORAGE_KEY)

  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.delete(APP_STATE_URL_PARAM)
  window.history.replaceState({}, '', url)
}

export const resolveSelectedZonesFromPersistence = (): SelectedTimeZone[] => {
  const fromUrl = readSelectedZonesFromUrl()
  if (fromUrl) {
    return fromUrl
  }

  const fromLocalStorage = readSelectedZonesFromLocalStorage()
  if (fromLocalStorage) {
    return fromLocalStorage
  }

  return cloneSeededTimeZones()
}

const createZoneEntry = (
  zone: string,
  city: string,
  index: number,
): SelectedTimeZone => ({
  id: deriveZoneId(zone),
  city,
  zone,
  color: ZONE_COLORS[index % ZONE_COLORS.length],
  isTarget: false,
  businessHours: { start: '09:00', end: '17:00', weekdaysOnly: true },
})

const updateSelectedZones = (
  set: (fn: (state: AppState) => Pick<AppState, 'selectedZones'>) => void,
  updater: (state: AppState) => SelectedTimeZone[],
) => {
  set((state) => {
    const selectedZones = normalizeSelectedZones(updater(state))
    persistSelectedZones(selectedZones)
    return { selectedZones }
  })
}

export const useAppStore = create<AppState>()((set) => ({
  selectedZones: resolveSelectedZonesFromPersistence(),
  addZone: (zone, city) => {
    updateSelectedZones(set, (state) => {
      if (state.selectedZones.some((z) => z.zone === zone)) {
        return state.selectedZones
      }

      return [
        ...state.selectedZones,
        createZoneEntry(zone, city, state.selectedZones.length),
      ]
    })
  },
  removeZone: (zoneId) => {
    updateSelectedZones(set, (state) => {
      const remaining = state.selectedZones.filter((z) => z.id !== zoneId)
      const hasTarget = remaining.some((z) => z.isTarget)

      return hasTarget || remaining.length === 0
        ? remaining
        : remaining.map((z, i) => ({ ...z, isTarget: i === 0 }))
    })
  },
  reorderZones: (activeId, overId) => {
    updateSelectedZones(set, (state) => {
      const from = state.selectedZones.findIndex((z) => z.id === activeId)
      const to = state.selectedZones.findIndex((z) => z.id === overId)

      return moveItem(state.selectedZones, from, to)
    })
  },
  setBusinessHours: (zoneId, start, end) => {
    updateSelectedZones(set, (state) =>
      state.selectedZones.map((z) =>
        z.id === zoneId
          ? { ...z, businessHours: { ...z.businessHours, start, end } }
          : z,
      ),
    )
  },
  moveZoneEarlier: (zoneId) => {
    updateSelectedZones(set, (state) => {
      const currentIndex = state.selectedZones.findIndex(
        (entry) => entry.id === zoneId,
      )

      return moveItem(state.selectedZones, currentIndex, currentIndex - 1)
    })
  },
  moveZoneLater: (zoneId) => {
    updateSelectedZones(set, (state) => {
      const currentIndex = state.selectedZones.findIndex(
        (entry) => entry.id === zoneId,
      )

      return moveItem(state.selectedZones, currentIndex, currentIndex + 1)
    })
  },
  toggleTarget: (zoneId) => {
    updateSelectedZones(set, (state) =>
      state.selectedZones.map((entry) =>
        entry.id === zoneId ? { ...entry, isTarget: !entry.isTarget } : entry,
      ),
    )
  },
  resetTargets: () => {
    updateSelectedZones(set, (state) =>
      state.selectedZones.map((entry, index) => ({
        ...entry,
        isTarget: index === 0,
      })),
    )
  },
}))
