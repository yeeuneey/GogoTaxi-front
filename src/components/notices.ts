export type NoticeType = 'update' | 'info' | 'maintenance'

export interface Notice {
  id: string
  title: string
  summary: string
  content: string[]
  date: string
  type: NoticeType
}

export const notices: Notice[] = [
  {
    id: 'launch-202407',
    title: '꼬꼬택 앱 정식 론칭 안내',
    summary: '서비스 준비를 마치고 꼬꼬택 앱이 드디어 정식 오픈했습니다.',
    content: [
      '안녕하세요, 꼬꼬택 팀입니다. 여러분께 기다리던 소식을 전해드려요!',
      '7월 1일부로 꼬꼬택 앱이 정식으로 론칭되었습니다. 방 만들기, 방 찾기, 나의 방 관리 등 주요 기능을 모두 이용하실 수 있으며, 빠르고 안정적인 택시 합승 경험을 제공하기 위해 다양한 편의 기능을 더했습니다.',
      '지금 바로 앱을 업데이트하거나 새로 설치하셔서 신규 기능을 확인해 보세요. 앞으로도 더 풍부한 서비스와 안정적인 운영을 위해 지속적으로 개선하겠습니다. 많은 관심과 이용 부탁드립니다!',
    ],
    date: '2024-07-01',
    type: 'update',
  },
  {
    id: 'maintenance-202407',
    title: '7월 정기 점검 예정 안내',
    summary: '안정적인 서비스를 위해 7월 10일 새벽 시스템 점검이 예정되어 있습니다.',
    content: [
      '7월 10일(수) 02:00부터 04:00까지 서비스 안정화를 위한 정기 점검이 진행됩니다.',
      '점검 시간 동안에는 일부 기능이 일시적으로 제한될 수 있으니 이용에 참고 부탁드립니다. 더 좋은 서비스를 위해 항상 노력하는 꼬꼬택이 되겠습니다.',
    ],
    date: '2024-07-05',
    type: 'maintenance',
  },
]
