export type GeoPoint = {
  lat: number
  lng: number
}

export type RoomLocation = {
  label: string
  position: GeoPoint
}

export type RoomPreview = {
  id: string
  title: string
  departure: RoomLocation
  arrival: RoomLocation
  time: string
  seats: number
  tags: string[]
  eta?: string
  fare?: number
  myFare?: number
  status?: 'recruiting' | 'dispatching' | 'success' | 'failed'
  taxi?: {
    carNumber: string
    driverName: string
    carModel: string
  }
}
