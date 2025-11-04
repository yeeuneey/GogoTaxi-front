<template>
  <section class="auth-wrap">
    <div class="card">
      <!-- 상단 로고 -->
      <div class="logo">
        <img src="@/assets/logo_my.png" alt="택시 로고" class="logo-img" />
      </div>
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
        <button class="kakao" type="button" @click="kakaoLogin">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#3d1d1f" />
            <path
              d="M12 6c-3.314 0-6 2.203-6 4.92 0 1.75 1.24 3.275 3.08 4.04L8 18l3.246-2.12c.244.02.492.04.754.04 3.314 0 6-2.203 6-4.92S15.314 6 12 6Z"
              fill="#fee500"
            />
          </svg>
          카카오로 계속하기
        </button>
        <button class="google" type="button" @click="googleLogin">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21.6 12.227c0-.76-.068-1.492-.195-2.227H12v4.216h5.404c-.232 1.21-.932 2.233-1.983 2.92v2.42h3.2c1.872-1.72 2.979-4.257 2.979-7.329Z" fill="#4285f4" />
            <path d="M12 22c2.7 0 4.968-.893 6.624-2.447l-3.2-2.42c-.888.6-2.024.96-3.424.96-2.63 0-4.858-1.772-5.657-4.153H3.04v2.487C4.68 19.983 8.056 22 12 22Z" fill="#34a853" />
            <path d="M6.343 13.94A5.999 5.999 0 0 1 6 12c0-.672.117-1.324.333-1.94V7.573H3.04A9.983 9.983 0 0 0 2 12c0 1.61.384 3.127 1.04 4.427l3.303-2.487Z" fill="#fbbc04" />
            <path d="M12 6.25c1.468 0 2.788.505 3.824 1.494l2.868-2.868C16.968 3.565 14.7 2.5 12 2.5 8.056 2.5 4.68 4.517 3.04 7.573l3.293 2.487C7.142 8.678 9.37 6.25 12 6.25Z" fill="#ea4335" />
          </svg>
          Google로 계속하기
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login as mockLogin, socialLogin } from '@/services/auth'
import { loginWithKakao } from '@/services/kakao'
import { loginWithGoogle } from '@/services/google'

const router = useRouter()
const route = useRoute()

const id = ref('')
const pw = ref('')

function resolveRedirect() {
  return (route.query.redirect as string) || '/home'
}

async function login() {
  if (!id.value || !pw.value) {
    alert('아이디와 비밀번호를 입력해주세요.')
    return
  }
  try {
    mockLogin(id.value, pw.value)
    router.push(resolveRedirect())
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '로그인에 실패했어요.'
    alert(msg)
  }
}

async function kakaoLogin() {
  try {
    const profile = await loginWithKakao()
    socialLogin('kakao', profile)
    router.push(resolveRedirect())
  } catch (err: unknown) {
    console.error(err)
    const msg = err instanceof Error ? err.message : '카카오 로그인에 실패했습니다. 다시 시도해주세요.'
    alert(msg)
  }
}

async function googleLogin() {
  try {
    const { code } = await loginWithGoogle()
    // TODO: 서버에 code를 전달해 토큰 교환 및 사용자 정보 조회
    socialLogin('google', { id: code, name: 'Google 사용자' })
    router.push(resolveRedirect())
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.'
    alert(msg)
  }
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 28px 22px 22px;
}
.logo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  background: #fff7d1;
  box-shadow: inset 0 0 0 2px #ffe48e;
}
.logo-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}
.title {
  text-align: center;
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
}
.form {
  display: grid;
  gap: 12px;
}
.field input {
  width: 100%;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid #e3e6ec;
  outline: none;
  font-size: 14px;
  background: #fafbff;
}
.field input:focus {
  border-color: #8aa8ff;
  background: #fff;
}
.primary {
  margin-top: 6px;
  background: #ffcf33;
  border: none;
  color: #201a00;
  font-weight: 700;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
}
.sub-links {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.sep {
  margin: 18px 0 10px;
  text-align: center;
  color: #9aa3af;
  font-size: 12px;
}
.sep span {
  background: #fff;
  padding: 0 8px;
}
.social {
  display: grid;
  gap: 8px;
}
.social button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}
.icon {
  width: 16px;
  height: 16px;
}
.kakao {
  background: #fee500;
  border: none;
  color: #191919;
  font-weight: 700;
}
.google {
  background: #fff;
  border: 1px solid #e3e6ec;
  color: #202124;
}
</style>
