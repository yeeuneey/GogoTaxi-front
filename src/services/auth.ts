// src/services/auth.ts

export type User = {
  id: string
  name: string
  password: string
  gender: 'M' | 'F' | ''
  sms: boolean
  terms: boolean
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const USERS_KEY = 'gtx_users'
const TOKEN_KEY = 'auth_token'
const CURRENT_KEY = 'auth_user'

const memoryStorage: StorageLike = (() => {
  const store = new Map<string, string>()
  return {
    getItem(key) {
      return store.has(key) ? store.get(key)! : null
    },
    setItem(key, value) {
      store.set(key, value)
    },
    removeItem(key) {
      store.delete(key)
    },
  }
})()

function getStorage(): StorageLike {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return memoryStorage
}

// 초기 목업 사용자 데이터를 한 번만 심어 둠
;(function seedMockUsers() {
  const storage = getStorage()
  const exist = storage.getItem(USERS_KEY)
  if (!exist) {
    const mock: User[] = [
      { id: 'test1', name: '테스트1', password: '1111', gender: 'M', sms: false, terms: true },
      { id: 'kim', name: '김고고', password: '1234', gender: 'F', sms: true, terms: true },
    ]
    storage.setItem(USERS_KEY, JSON.stringify(mock))
  }
})()

function loadUsers(): User[] {
  const storage = getStorage()
  try {
    return JSON.parse(storage.getItem(USERS_KEY) || '[]') as User[]
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  const storage = getStorage()
  storage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserById(id: string) {
  return loadUsers().find(u => u.id === id)
}

export function findUserByName(name: string) {
  return loadUsers().find(u => u.name === name)
}

export function registerUser(user: User) {
  const users = loadUsers()
  if (users.some(u => u.id === user.id)) throw new Error('이미 사용 중인 아이디입니다.')
  users.push(user)
  saveUsers(users)
}

export function login(id: string, password: string) {
  const user = findUserById(id)
  if (!user) throw new Error('존재하지 않는 아이디입니다.')
  if (user.password !== password) throw new Error('비밀번호가 일치하지 않습니다.')
  const token = 'local-' + Date.now()
  const storage = getStorage()
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, name: user.name }))
  return token
}

export function logout() {
  const storage = getStorage()
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(CURRENT_KEY)
}

export function isAuthed() {
  const storage = getStorage()
  return Boolean(storage.getItem(TOKEN_KEY))
}

export function updateUserPassword(id: string, nextPassword: string): Pick<User, 'id' | 'name'> {
  const users = loadUsers()
  const targetIndex = users.findIndex(u => u.id === id)
  if (targetIndex < 0) throw new Error('존재하지 않는 아이디입니다.')
  const targetUser = users[targetIndex]
  if (!targetUser) throw new Error('존재하지 않는 아이디입니다.')
  const updatedUser: User = { ...targetUser, password: nextPassword }
  users[targetIndex] = updatedUser
  saveUsers(users)
  return { id: updatedUser.id, name: updatedUser.name }
}

export type SocialProvider = 'kakao' | 'google'
type SocialProfile = { id: string; name?: string }

export function socialLogin(provider: SocialProvider, profile: SocialProfile) {
  const token = `${provider}-${Date.now()}`
  const storage = getStorage()
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(
    CURRENT_KEY,
    JSON.stringify({
      id: profile.id,
      name: profile.name || `${provider} 사용자`,
    })
  )
  return token
}
