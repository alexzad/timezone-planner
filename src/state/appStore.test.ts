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
})
