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
}
