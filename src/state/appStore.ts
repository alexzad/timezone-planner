import { create } from 'zustand'

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
  toggleTarget: (zoneId: string) => void
  resetTargets: () => void
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
