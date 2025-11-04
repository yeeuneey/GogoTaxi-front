import { createRouter, createWebHistory } from 'vue-router'

// 페이지 import
import MainPageView from '@/views/MainPageView.vue'
import UserLoginView from '@/views/UserLoginView.vue'
import UserRegisterView from '@/views/UserRegisterView.vue'
import FindAccountView from '@/views/FindAccountView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: UserLoginView, meta: { hideBottomNav: true } },
  { path: '/register', name: 'register', component: UserRegisterView, meta: { hideBottomNav: true } },
  { path: '/find-account', name: 'find-account', component: FindAccountView, meta: { hideBottomNav: true } },
  {
    path: '/create-room',
    name: 'create-room',
    component: () => import('@/views/CreateRoomView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/home', name: 'home', component: MainPageView, meta: { requiresAuth: true } },
  {
    path: '/find-room',
    name: 'find-room',
    component: () => import('@/views/FindRoomView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-rooms',
    name: 'my-rooms',
    component: () => import('@/views/MyRoomsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mypage',
    name: 'mypage',
    component: () => import('@/views/MyPageView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notice',
    name: 'notice',
    component: () => import('@/views/NoticeListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notice/:id',
    name: 'notice-detail',
    component: () => import('@/views/NoticeDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ride-review',
    name: 'ride-review',
    component: () => import('@/views/RideReviewView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/seat-selection',
    name: 'seat-selection',
    component: () => import('@/views/SeatSelectionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payment-methods',
    name: 'payment-methods',
    component: () => import('@/views/PaymentMethodsView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
