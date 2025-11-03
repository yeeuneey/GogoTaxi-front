<template>
  <section class="auth-wrap">
    <div class="card">
      <div class="logo small">🥚</div>
      <h1 class="title">회원가입</h1>

      <form class="form" @submit.prevent="submit">
        <!-- 이름 -->
        <div class="field">
          <input v-model.trim="name" type="text" placeholder="이름" />
        </div>

        <!-- 아이디 + 중복확인 -->
        <div class="field row">
          <input v-model.trim="userid" type="text" placeholder="아이디" />
          <button type="button" class="ghost" @click="checkId">중복확인</button>
        </div>

        <!-- 비밀번호 -->
        <div class="field">
          <input v-model="pw" type="password" placeholder="비밀번호" autocomplete="new-password" />
        </div>
        <div class="field">
          <input v-model="pw2" type="password" placeholder="비밀번호 확인" autocomplete="new-password" />
        </div>

        <!-- 성별 -->
        <div class="field inline">
          <label><input type="radio" value="M" v-model="gender" /> 남성</label>
          <label><input type="radio" value="F" v-model="gender" /> 여성</label>
        </div>

        <!-- 동의 -->
        <div class="agreements">
          <label><input type="checkbox" v-model="sms" /> SMS 수신 동의(선택)</label>
          <label><input type="checkbox" v-model="terms" /> 이용약관 동의(필수)</label>
        </div>

        <button class="primary" type="submit">회원가입</button>

        <div class="sub-links center">
          <router-link to="/login">이미 계정이 있으신가요? 로그인</router-link>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const userid = ref('')
const pw = ref('')
const pw2 = ref('')
const gender = ref<'M' | 'F' | ''>('')
const sms = ref(false)
const terms = ref(false)

function checkId() {
  // TODO: 실제 중복확인 API 호출
  if (!userid.value) return alert('아이디를 입력하세요.')
  alert(`'${userid.value}' 사용 가능한 아이디예요. (예시)`)
}

function submit() {
  if (!name.value || !userid.value || !pw.value || !pw2.value) return alert('필수 항목을 입력하세요.')
  if (pw.value !== pw2.value) return alert('비밀번호가 일치하지 않습니다.')
  if (!terms.value) return alert('이용약관 동의는 필수입니다.')
  // TODO: 실제 회원가입 API 호출
  alert('회원가입 완료!')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.auth-wrap {
  min-height: calc(100vh - var(--tab-h, 64px));
  display: grid; place-items: start center;
  padding: 32px 16px; background: #f6f7f9;
}
.card {
  width: 100%; max-width: 420px;
  background: #fff; border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,.06);
  padding: 24px 20px 20px;
}
.logo.small { width: 50px; height: 50px; }
.logo {
  width: 60px; height: 60px; border-radius: 50%;
  display: grid; place-items: center; margin: 0 auto 8px;
  background: #fff7d1; font-size: 24px; box-shadow: inset 0 0 0 2px #ffe48e;
}
.title { text-align: center; margin: 0 0 16px; font-size: 20px; }
.form { display: grid; gap: 10px; }

.field input {
  width: 100%; padding: 12px 14px; border-radius: 12px;
  border: 1px solid #e3e6ec; background: #fafbff; outline: none; font-size: 14px;
}
.field input:focus { border-color: #8aa8ff; background: #fff; }
.field.row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
.field.inline { display: flex; gap: 16px; align-items: center; color: #555; }

.ghost {
  padding: 10px 12px; border-radius: 12px; background: #fff;
  border: 1px solid #e3e6ec; cursor: pointer; font-weight: 600;
}

.agreements { display: grid; gap: 6px; color: #555; font-size: 14px; }

.primary {
  margin-top: 6px; background: #ffcf33; border: none; color: #201a00;
  font-weight: 700; padding: 12px; border-radius: 12px; cursor: pointer;
}
.sub-links.center { text-align: center; margin-top: 6px; }
</style>
