import { createRouter, createWebHistory } from 'vue-router'

// 각 페이지 import
import MainPage from '@/pages/Home/MainPage.vue'
import UserLogin from '@/pages/Auth/UserLogin.vue'
import UserRegister from '@/pages/Auth/UserRegister.vue'
import FindAccount from '@/pages/Auth/FindAccount.vue'

const routes = [
 { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: UserLogin, meta: { hideBottomNav: true } },
  { path: '/register', name: 'register', component: UserRegister, meta: { hideBottomNav: true } },
  { path: '/find-account', name: 'find-account', component: FindAccount, meta: { hideBottomNav: true } },

  { path: '/home', name: 'home', component: MainPage, meta: { requiresAuth: true } },
  { path: '/find-room', name: 'find-room', component: () => import('@/pages/Stub/FindRoom.vue'), meta: { requiresAuth: true } },
  { path: '/my-rooms', name: 'my-rooms', component: () => import('@/pages/Stub/MyRooms.vue'), meta: { requiresAuth: true } },
  { path: '/mypage', name: 'mypage', component: () => import('@/pages/Stub/MyPage.vue'), meta: { requiresAuth: true } },
  { path: '/notice', name: 'notice', component: () => import('@/pages/Home/Notice/NoticeList.vue'), meta: { requiresAuth: true } },
  { path: '/payment-methods', name: 'payment-methods', component: () => import('@/pages/Payments/PaymentMethods.vue'), meta: { requiresAuth: true } },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
