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

export type AppState = {
  selectedZones: SelectedTimeZone[]
  addZone: (zone: string, city: string) => void
  removeZone: (zoneId: string) => void
  moveZoneEarlier: (zoneId: string) => void
  moveZoneLater: (zoneId: string) => void
  toggleTarget: (zoneId: string) => void
  resetTargets: () => void
}

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

export const useAppStore = create<AppState>()((set) => ({
  selectedZones: cloneSeededTimeZones(),
  addZone: (zone, city) => {
    set((state) => {
      if (state.selectedZones.some((z) => z.zone === zone)) {
        return state
      }

      const id = zone.replace(/[/_]/g, '-').toLowerCase()
      const color = ZONE_COLORS[state.selectedZones.length % ZONE_COLORS.length]

      return {
        selectedZones: [
          ...state.selectedZones,
          {
            id,
            city,
            zone,
            color,
            isTarget: false,
            businessHours: { start: '09:00', end: '17:00', weekdaysOnly: true },
          },
        ],
      }
    })
  },
  removeZone: (zoneId) => {
    set((state) => {
      const remaining = state.selectedZones.filter((z) => z.id !== zoneId)
      const hasTarget = remaining.some((z) => z.isTarget)

      return {
        selectedZones:
          hasTarget || remaining.length === 0
            ? remaining
            : remaining.map((z, i) => ({ ...z, isTarget: i === 0 })),
      }
    })
  },
  moveZoneEarlier: (zoneId) => {
    set((state) => {
      const currentIndex = state.selectedZones.findIndex(
        (entry) => entry.id === zoneId,
      )

      return {
        selectedZones: moveItem(
          state.selectedZones,
          currentIndex,
          currentIndex - 1,
        ),
      }
    })
  },
  moveZoneLater: (zoneId) => {
    set((state) => {
      const currentIndex = state.selectedZones.findIndex(
        (entry) => entry.id === zoneId,
      )

      return {
        selectedZones: moveItem(
          state.selectedZones,
          currentIndex,
          currentIndex + 1,
        ),
      }
    })
  },
  toggleTarget: (zoneId) => {
    set((state) => ({
      selectedZones: state.selectedZones.map((entry) =>
        entry.id === zoneId ? { ...entry, isTarget: !entry.isTarget } : entry,
      ),
    }))
  },
  resetTargets: () => {
    set((state) => ({
      selectedZones: state.selectedZones.map((entry, index) => ({
        ...entry,
        isTarget: index === 0,
      })),
    }))
  },
}))
