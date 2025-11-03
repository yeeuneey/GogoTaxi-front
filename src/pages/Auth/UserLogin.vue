<template>
  <section class="auth-wrap">
    <div class="card">
      <!-- 상단 로고 -->
      <div class="logo">🥚</div>
      <h1 class="title">로그인</h1>

      <!-- 입력 -->
      <form class="form" @submit.prevent="login">
        <div class="field">
          <input
            v-model="id"
            type="text"
            placeholder="아이디"
            autocomplete="username"
          />
        </div>
        <div class="field">
          <input
            v-model="pw"
            type="password"
            placeholder="비밀번호"
            autocomplete="current-password"
          />
        </div>

        <button class="primary" type="submit">로그인</button>

        <div class="sub-links">
          <router-link to="/find-account">아이디/비밀번호 찾기</router-link>
          <router-link to="/register">회원가입</router-link>
        </div>
      </form>

      <!-- 간편 로그인 -->
      <div class="sep"><span>또는</span></div>
      <div class="social">
        <button class="kakao" @click="kakaoLogin">카카오로 계속하기</button>
        <button class="google" @click="googleLogin">Google로 계속하기</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login as mockLogin } from '@/services/auth'   // ✅ 목업 검증 함수

const router = useRouter()
const route = useRoute()

const id = ref('')
const pw = ref('')

async function login() {
  if (!id.value || !pw.value) {
    alert('아이디/비밀번호를 입력하세요.')
    return
  }
  try {
    // ✅ 존재하는 아이디/비밀번호일 때만 통과 (auth.ts의 mock 목록 기준)
    mockLogin(id.value, pw.value)

    const redirect = (route.query.redirect as string) || '/home'
    router.push(redirect)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '로그인 실패'
    alert(msg)   // ❌ 틀리면 여기서 막혀서 메인으로 안 감
  }
}

// 👉 카카오/구글 버튼은 그대로 유지(나중에 SDK 연결만 추가)
function kakaoLogin() {
  alert('카카오 로그인 SDK 연동 예정')
}
function googleLogin() {
  alert('Google 로그인 SDK 연동 예정')
}
</script>


<style scoped>
.auth-wrap {
  min-height: calc(100vh - var(--tab-h, 64px));
  display: grid;
  place-items: start center;
  padding: 32px 16px;
  background: #f6f7f9;
}
.card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,.06);
  padding: 24px 20px 20px;
}
.logo {
  width: 60px; height: 60px; border-radius: 50%;
  display: grid; place-items: center; margin: 0 auto 8px;
  background: #fff7d1; font-size: 28px;
  box-shadow: inset 0 0 0 2px #ffe48e;
}
.title { text-align: center; margin: 0 0 16px; font-size: 20px; }
.form { display: grid; gap: 10px; }
.field input {
  width: 100%; padding: 12px 14px; border-radius: 12px;
  border: 1px solid #e3e6ec; outline: none;
  font-size: 14px; background: #fafbff;
}
.field input:focus { border-color: #8aa8ff; background: #fff; }
.primary {
  margin-top: 4px;
  background: #ffcf33; border: none; color: #201a00; font-weight: 700;
  padding: 12px; border-radius: 12px; cursor: pointer;
}
.sub-links {
  margin-top: 6px; display: flex; justify-content: space-between; font-size: 13px;
}
.sep { margin: 14px 0 8px; text-align: center; color: #9aa3af; font-size: 12px; }
.sep span { background: #fff; padding: 0 8px; }
.social { display: grid; gap: 8px; }
.kakao {
  background: #fee500; border: 0; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 700;
}
.google {
  background: #fff; border: 1px solid #e3e6ec; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 600;
}
</style>
