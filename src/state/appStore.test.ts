import { act } from '@testing-library/react'
import { cloneSeededTimeZones, seededTimeZones, useAppStore } from './appStore'

describe('app store', () => {
  beforeEach(() => {
    useAppStore.setState({ selectedZones: cloneSeededTimeZones() })
  })

  it('starts with the seeded timezone scenario', () => {
    const { selectedZones } = useAppStore.getState()

    expect(selectedZones).toHaveLength(seededTimeZones.length)
    expect(selectedZones.map((entry) => entry.city)).toEqual([
      'New York',
      'London',
      'Tokyo',
    ])
    expect(selectedZones.filter((entry) => entry.isTarget)).toHaveLength(1)
  })

  it('toggles target selection for a timezone', () => {
    act(() => {
      useAppStore.getState().toggleTarget('tokyo')
    })

    const targetIds = useAppStore
      .getState()
      .selectedZones.filter((entry) => entry.isTarget)
      .map((entry) => entry.id)

    expect(targetIds).toEqual(['new-york', 'tokyo'])
  })

  it('resets targets back to the primary seeded timezone', () => {
    act(() => {
      useAppStore.getState().toggleTarget('tokyo')
      useAppStore.getState().resetTargets()
    })

    const targetIds = useAppStore
      .getState()
      .selectedZones.filter((entry) => entry.isTarget)
      .map((entry) => entry.id)

    expect(targetIds).toEqual(['new-york'])
  })

  it('moves a timezone earlier in the ordered list', () => {
    act(() => {
      useAppStore.getState().moveZoneEarlier('tokyo')
    })

    expect(
      useAppStore.getState().selectedZones.map((entry) => entry.id),
    ).toEqual(['new-york', 'tokyo', 'london'])
  })

  it('does not move the first timezone earlier', () => {
    act(() => {
      useAppStore.getState().moveZoneEarlier('new-york')
    })

    expect(
      useAppStore.getState().selectedZones.map((entry) => entry.id),
    ).toEqual(['new-york', 'london', 'tokyo'])
  })

  it('moves a timezone later in the ordered list', () => {
    act(() => {
      useAppStore.getState().moveZoneLater('london')
    })

    expect(
      useAppStore.getState().selectedZones.map((entry) => entry.id),
    ).toEqual(['new-york', 'tokyo', 'london'])
  })

  it('does not move the last timezone later', () => {
    act(() => {
      useAppStore.getState().moveZoneLater('tokyo')
    })

    expect(
      useAppStore.getState().selectedZones.map((entry) => entry.id),
    ).toEqual(['new-york', 'london', 'tokyo'])
  })

  it('adds a new timezone to the selected list', () => {
    act(() => {
      useAppStore.getState().addZone('Europe/Paris', 'Paris')
    })

    const { selectedZones } = useAppStore.getState()

    expect(selectedZones).toHaveLength(4)
    expect(selectedZones.at(-1)).toMatchObject({
      zone: 'Europe/Paris',
      city: 'Paris',
      isTarget: false,
      businessHours: { start: '09:00', end: '17:00' },
    })
  })

  it('blocks adding a timezone already in the selected list', () => {
    act(() => {
      useAppStore.getState().addZone('America/New_York', 'New York')
    })

    expect(useAppStore.getState().selectedZones).toHaveLength(3)
  })

  it('removes a timezone from the selected list', () => {
    act(() => {
      useAppStore.getState().removeZone('london')
    })

    const cities = useAppStore.getState().selectedZones.map((z) => z.city)

    expect(cities).toEqual(['New York', 'Tokyo'])
  })

  it('reassigns the target when the targeted zone is removed', () => {
    act(() => {
      useAppStore.getState().removeZone('new-york')
    })

    const { selectedZones } = useAppStore.getState()

    expect(selectedZones.filter((z) => z.isTarget)).toHaveLength(1)
    expect(selectedZones[0].isTarget).toBe(true)
  })

  it('reorders zones via drag id swap', () => {
    act(() => {
      useAppStore.getState().reorderZones('tokyo', 'london')
    })

    expect(useAppStore.getState().selectedZones.map((z) => z.id)).toEqual([
      'new-york',
      'tokyo',
      'london',
    ])
  })

  it('updates business hours for a single timezone without affecting others', () => {
    act(() => {
      useAppStore.getState().setBusinessHours('london', '08:00', '16:00')
    })

    const { selectedZones } = useAppStore.getState()
    const london = selectedZones.find((z) => z.id === 'london')
    const newYork = selectedZones.find((z) => z.id === 'new-york')

    expect(london?.businessHours.start).toBe('08:00')
    expect(london?.businessHours.end).toBe('16:00')
    expect(newYork?.businessHours.start).toBe('09:00')
  })
})
