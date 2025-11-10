import { ref } from 'vue'
import type { RoomPreview } from '@/types/rooms'

const STORAGE_KEY = 'gogo-taxi:joined-rooms'

export type RoomMembershipEntry = {
  roomId: string
  seat?: number
  joinedAt: string
  snapshot?: RoomPreview
}

function loadInitialState(): RoomMembershipEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item) => typeof item?.roomId === 'string')
  } catch {
    return []
  }
}

const joinedRooms = ref<RoomMembershipEntry[]>(loadInitialState())

function persistState() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(joinedRooms.value))
  } catch (error) {
    console.warn('Failed to persist room membership state', error)
  }
}

function joinRoom(snapshot: RoomPreview) {
  const existing = joinedRooms.value.find((entry) => entry.roomId === snapshot.id)

  if (existing) {
    existing.snapshot = snapshot
  } else {
    joinedRooms.value.unshift({
      roomId: snapshot.id,
      snapshot,
      joinedAt: new Date().toISOString(),
    })
  }

  persistState()
}

function updateSeat(roomId: string, seatNumber: number) {
  let entry = joinedRooms.value.find((joined) => joined.roomId === roomId)

  if (!entry) {
    entry = {
      roomId,
      joinedAt: new Date().toISOString(),
    }
    joinedRooms.value.unshift(entry)
  }

  entry.seat = seatNumber
  persistState()
}

export function useRoomMembership() {
  return {
    joinedRooms,
    joinRoom,
    updateSeat,
  }
}
