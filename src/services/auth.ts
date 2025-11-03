// src/services/auth.ts
export type User = {
  id: string
  name: string
  password: string
  gender: 'M' | 'F' | ''
  sms: boolean
  terms: boolean
}

const USERS_KEY = 'gtx_users'
const TOKEN_KEY = 'auth_token'
const CURRENT_KEY = 'auth_user';

// ✅ 최초 1회 목업 유저 심기
(function seedMockUsers() {
  const exist = localStorage.getItem(USERS_KEY)
  if (!exist) {
    const mock: User[] = [
      { id: 'test1', name: '테스트1', password: '1111', gender: 'M', sms: false, terms: true },
      { id: 'kim',   name: '김고고',  password: '1234', gender: 'F', sms: true,  terms: true },
    ]
    localStorage.setItem(USERS_KEY, JSON.stringify(mock))
  }
})()

function loadUsers(): User[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserById(id: string) {
  return loadUsers().find(u => u.id === id)
}

export function registerUser(user: User) {
  const users = loadUsers()
  if (users.some(u => u.id === user.id)) throw new Error('이미 사용 중인 아이디입니다.')
  users.push(user); saveUsers(users)
}

export function login(id: string, password: string) {
  const u = findUserById(id)
  if (!u) throw new Error('존재하지 않는 아이디입니다.')
  if (u.password !== password) throw new Error('비밀번호가 일치하지 않습니다.')
  const token = 'local-' + Date.now()
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CURRENT_KEY, JSON.stringify({ id: u.id, name: u.name }))
  return token
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_KEY)
}

export function isAuthed() {
  return !!localStorage.getItem(TOKEN_KEY)
}
