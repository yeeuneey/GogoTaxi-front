import type { RoomPreview } from '@/types/rooms'

export const mockRooms: RoomPreview[] = [
  {
    id: 'room-101',
    title: '강남역 → 인천공항 새벽 합승',
    departure: {
      label: '강남역 5번 출구',
      position: { lat: 37.498095, lng: 127.02761 },
    },
    arrival: {
      label: '인천국제공항 제1터미널',
      position: { lat: 37.4602, lng: 126.4407 },
    },
    time: '오늘 23:30 출발',
    eta: '오늘 23:55 도착 예정',
    seats: 2,
    capacity: 4,
    filled: 2,
    tags: ['야간', '공항', '편안한 분위기'],
    fare: 42000,
    status: 'success',
    taxi: {
      carNumber: '서울 12가 3456',
      driverName: '박진수 기사님',
      carModel: '쏘나타 DN8',
    },
  },
  {
    id: 'room-102',
    title: '신촌역 → 수원역 아침 출근',
    departure: {
      label: '신촌역 2번 출구',
      position: { lat: 37.55515, lng: 126.9368 },
    },
    arrival: {
      label: '수원역 AK플라자 앞',
      position: { lat: 37.2664, lng: 126.9997 },
    },
    time: '오늘 19:10 출발',
    eta: '오늘 20:00 도착 예상',
    seats: 1,
    capacity: 3,
    filled: 1,
    tags: ['출근', '정시출발'],
    fare: 36000,
    status: 'dispatching',
  },
  {
    id: 'room-103',
    title: '홍대입구역 → 판교역',
    departure: {
      label: '홍대입구역 9번 출구',
      position: { lat: 37.5575, lng: 126.9242 },
    },
    arrival: {
      label: '판교역 2번 출구',
      position: { lat: 37.3948, lng: 127.1109 },
    },
    time: '오늘 20:00 출발',
    eta: '오늘 20:50 도착 예상',
    seats: 3,
    capacity: 4,
    filled: 1,
    tags: ['직장인', '음악조용히', '비흡연'],
    fare: 28000,
    status: 'recruiting',
  },
  {
    id: 'room-104',
    title: '부산 서면 → 해운대 야간',
    departure: {
      label: '서면역 7번 출구 택시승강장',
      position: { lat: 35.1576, lng: 129.0593 },
    },
    arrival: {
      label: '해운대 해수욕장 입구',
      position: { lat: 35.1587, lng: 129.1604 },
    },
    time: '오늘 22:10 출발',
    eta: '오늘 22:50 도착 예상',
    seats: 1,
    capacity: 3,
    filled: 3,
    tags: ['야경투어', '편안한 분위기'],
    fare: 18000,
    status: 'failed',
  },
]

export function getRoomById(id: string) {
  return mockRooms.find((room) => room.id === id)
}
