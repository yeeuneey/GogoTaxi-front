import { createRouter, createWebHistory } from "vue-router";
import MyPageView from "../view/mypageView.vue";
import ProfileSettingsView from "../view/profileSettingsView.vue";
import UserLogin from "../view/UserLogin.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "UserLogin",
    component: UserLogin,
  },
  {
    path: "/mypage",
    name: "MyPage",
    component: MyPageView,
  },
  {
    path: "/mypage/settings",
    name: "ProfileSettings",
    component: ProfileSettingsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
