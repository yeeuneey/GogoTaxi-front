<template>
  <div class="settings-wrapper">
    <main class="settings-card">
      <header class="settings-header">
        <button type="button" class="back-button" @click="goBack" aria-label="마이페이지로 돌아가기">
          ←
        </button>
        <div class="settings-title">
          <h1>프로필 수정</h1>
          <p>가입 시 입력한 정보를 확인하세요.</p>
        </div>
      </header>

      <section class="info-section">
        <h2 class="section-title">기본 정보</h2>
        <div class="info-list">
          <article class="info-item" :class="{ 'info-item--editing': editingField === 'nickname' }">
            <span class="info-label">닉네임</span>
            <div v-if="editingField === 'nickname'" class="info-editor">
              <input
                v-model.trim="editForm.nickname"
                type="text"
                class="info-input"
                placeholder="새 닉네임을 입력하세요"
                maxlength="16"
                @keyup.enter="saveNickname"
              />
              <p v-if="errors.nickname" class="info-error">{{ errors.nickname }}</p>
              <div class="editor-actions">
                <button type="button" class="editor-button editor-button--primary" @click="saveNickname">저장</button>
                <button type="button" class="editor-button" @click="cancelEdit">취소</button>
              </div>
            </div>
            <div v-else class="info-content">
              <span class="info-text">{{ account.nickname }}</span>
              <button type="button" class="info-action" @click="startEdit('nickname')">변경</button>
            </div>
          </article>

          <article class="info-item" :class="{ 'info-item--editing': editingField === 'phone' }">
            <span class="info-label">전화번호</span>
            <div v-if="editingField === 'phone'" class="info-editor">
              <input
                v-model.trim="editForm.phone"
                type="tel"
                class="info-input"
                placeholder="010-0000-0000"
                @keyup.enter="savePhone"
              />
              <p v-if="errors.phone" class="info-error">{{ errors.phone }}</p>
              <div class="editor-actions">
                <button type="button" class="editor-button editor-button--primary" @click="savePhone">저장</button>
                <button type="button" class="editor-button" @click="cancelEdit">취소</button>
              </div>
            </div>
            <div v-else class="info-content">
              <span class="info-text">{{ account.phone }}</span>
              <button type="button" class="info-action" @click="startEdit('phone')">변경</button>
            </div>
          </article>

          <article class="info-item">
            <span class="info-label">아이디</span>
            <div class="info-content">
              <span class="info-text">{{ account.username }}</span>
              <button type="button" class="info-action info-action--ghost" @click="copyUsername">복사</button>
            </div>
          </article>
          <p v-if="copyFeedback" class="copy-feedback">{{ copyFeedback }}</p>

          <article class="info-item" :class="{ 'info-item--editing': editingField === 'password' }">
            <span class="info-label">비밀번호</span>
            <div v-if="editingField === 'password'" class="info-editor">
              <input
                v-model="editForm.password"
                type="password"
                class="info-input"
                placeholder="새 비밀번호를 입력하세요"
              />
              <input
                v-model="editForm.passwordConfirm"
                type="password"
                class="info-input"
                placeholder="비밀번호를 한 번 더 입력하세요"
                @keyup.enter="savePassword"
              />
              <p v-if="errors.password" class="info-error">{{ errors.password }}</p>
              <div class="editor-actions">
                <button type="button" class="editor-button editor-button--primary" @click="savePassword">저장</button>
                <button type="button" class="editor-button" @click="cancelEdit">취소</button>
              </div>
            </div>
            <div v-else class="info-content">
              <span class="info-text">{{ passwordMask }}</span>
              <button type="button" class="info-action" @click="startEdit('password')">재설정</button>
            </div>
          </article>
        </div>
      </section>

      <section class="info-section">
        <h2 class="section-title">부가 정보</h2>
        <div class="info-list">
          <article class="info-item">
            <span class="info-label">성별</span>
            <div class="info-content">
              <span class="info-text">{{ account.gender }}</span>
            </div>
          </article>
          <article class="info-item">
            <span class="info-label">생년월일</span>
            <div class="info-content">
              <span class="info-text">{{ account.birthDate }}</span>
            </div>
          </article>
        </div>
      </section>

      <button type="button" class="logout-button" @click="requestLogout">로그아웃</button>
    </main>

    <transition name="fade">
      <div
        v-if="showLogoutConfirm"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <div class="alert-card">
          <h3 id="logout-modal-title">로그아웃 하시겠습니까?</h3>
          <p>현재 기기에서 로그아웃되며 로그인 페이지로 이동합니다.</p>
          <div class="alert-actions">
            <button type="button" class="alert-button alert-button--primary" @click="confirmLogout">확인</button>
            <button type="button" class="alert-button" @click="cancelLogout">취소</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, onBeforeUnmount, reactive, ref } from "vue";

const router = useRouter();

const account = reactive({
  nickname: "김예은",
  phone: "010-1234-5678",
  username: "gogotaxi_ye",
  password: "Taxi!2024",
  gender: "여성",
  birthDate: "2000-08-15",
});

type EditableField = "nickname" | "phone" | "password";

const editingField = ref<EditableField | null>(null);
const showLogoutConfirm = ref(false);

const editForm = reactive({
  nickname: "",
  phone: "",
  password: "",
  passwordConfirm: "",
});

const errors = reactive({
  nickname: "",
  phone: "",
  password: "",
});

const copyFeedback = ref("");
let copyTimeout: number | null = null;

const passwordMask = computed(() => "•".repeat(account.password.length));

const resetErrors = () => {
  errors.nickname = "";
  errors.phone = "";
  errors.password = "";
};

const resetForm = () => {
  editForm.nickname = "";
  editForm.phone = "";
  editForm.password = "";
  editForm.passwordConfirm = "";
};

const resetCopyFeedback = () => {
  if (copyTimeout) {
    window.clearTimeout(copyTimeout);
    copyTimeout = null;
  }
  copyFeedback.value = "";
};

const startEdit = (field: EditableField) => {
  resetErrors();
  editingField.value = field;
  if (field === "nickname") {
    editForm.nickname = account.nickname;
  } else if (field === "phone") {
    editForm.phone = account.phone;
  } else {
    editForm.password = "";
    editForm.passwordConfirm = "";
  }
};

const cancelEdit = () => {
  resetErrors();
  resetForm();
  editingField.value = null;
};

const saveNickname = () => {
  const nextNickname = editForm.nickname.trim();
  if (!nextNickname) {
    errors.nickname = "닉네임을 입력해주세요.";
    return;
  }
  if (nextNickname.length < 2) {
    errors.nickname = "닉네임은 두 글자 이상이어야 합니다.";
    return;
  }
  account.nickname = nextNickname;
  cancelEdit();
};

const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;

const savePhone = () => {
  const nextPhone = editForm.phone.trim();
  if (!nextPhone) {
    errors.phone = "전화번호를 입력해주세요.";
    return;
  }
  if (!phonePattern.test(nextPhone)) {
    errors.phone = "010-1234-5678 형식으로 입력해주세요.";
    return;
  }
  account.phone = nextPhone;
  cancelEdit();
};

const savePassword = () => {
  const nextPassword = editForm.password;
  const confirmPassword = editForm.passwordConfirm;
  if (!nextPassword || !confirmPassword) {
    errors.password = "비밀번호와 확인 비밀번호를 모두 입력해주세요.";
    return;
  }
  if (nextPassword.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다.";
    return;
  }
  if (nextPassword !== confirmPassword) {
    errors.password = "입력한 비밀번호가 일치하지 않습니다.";
    return;
  }
  account.password = nextPassword;
  cancelEdit();
};

const copyUsername = async () => {
  resetCopyFeedback();
  const text = account.username;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    copyFeedback.value = "아이디를 복사했어요.";
  } catch (error) {
    console.error("copy failed", error);
    copyFeedback.value = "복사에 실패했어요. 다시 시도해주세요.";
  } finally {
    if (copyTimeout) {
      window.clearTimeout(copyTimeout);
    }
    copyTimeout = window.setTimeout(() => {
      copyFeedback.value = "";
      copyTimeout = null;
    }, 1800);
  }
};

onBeforeUnmount(() => {
  if (copyTimeout) {
    window.clearTimeout(copyTimeout);
  }
});

const requestLogout = () => {
  showLogoutConfirm.value = true;
};

const goBack = () => {
  router.back();
};

const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

const confirmLogout = () => {
  showLogoutConfirm.value = false;
  // TODO: 실제 로그아웃 API 연동
  router.push({ name: "UserLogin" }).catch((error) => {
    console.warn("로그아웃 후 이동 중 오류", error);
  });
};
</script>

<style scoped>
.settings-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffe4b3 0%, #fff1d8 35%, #ffffff 100%);
  padding: 3.5rem 1rem 3rem;
  font-family: "Pretendard", "Apple SD Gothic Neo", sans-serif;
}

.settings-card {
  width: min(440px, 100%);
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 18px 32px rgba(238, 187, 110, 0.28);
  padding: 2.2rem 1.6rem 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 16px rgba(233, 184, 116, 0.25);
  color: #a0641b;
  font-size: 1.1rem;
  cursor: pointer;
}

.settings-title {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.settings-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2f2f33;
}

.settings-title p {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: #6a6a6f;
  line-height: 1.5;
}


.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #413e48;
  margin: 0;
}

.info-list {
  background: linear-gradient(135deg, #fff6de 0%, #ffe9c6 100%);
  border-radius: 18px;
  box-shadow: 0 12px 20px rgba(244, 193, 122, 0.16);
  padding: 0.4rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.info-item {
  padding: 0.8rem 0.35rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
}

.info-item:last-of-type {
  border-bottom: none;
}

.info-item--editing {
  background: rgba(255, 241, 216, 0.55);
  border-radius: 14px;
  padding: 0.85rem 0.5rem;
}

.info-label {
  flex: 0 0 88px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #66616c;
  line-height: 1.6;
}

.info-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.98rem;
  color: #2f2f33;
}

.info-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-action {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd890 0%, #f9b462 100%);
  color: #784308;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.info-action--ghost {
  background: #fff5e5;
  color: #a0641b;
  border: 1px solid rgba(160, 100, 27, 0.2);
}

.info-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 14px rgba(203, 128, 38, 0.22);
}

.info-action:focus-visible {
  outline: 2px solid rgba(203, 128, 38, 0.35);
  outline-offset: 2px;
}

.copy-feedback {
  margin: -0.5rem 0 0.5rem;
  font-size: 0.82rem;
  color: #a0641b;
  text-align: right;
}

.info-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-input {
  width: 100%;
  border: 1px solid rgba(203, 128, 38, 0.3);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  font-size: 0.95rem;
  background: #fff;
  color: #2f2f33;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.info-input:focus {
  outline: none;
  border-color: #f0a545;
  box-shadow: 0 0 0 3px rgba(240, 165, 69, 0.25);
}

.info-error {
  margin: -0.3rem 0 0;
  font-size: 0.82rem;
  color: #d64545;
}

.editor-actions {
  display: flex;
  gap: 0.6rem;
}

.editor-button {
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  background: #fff0dd;
  color: #a0641b;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.editor-button--primary {
  background: linear-gradient(135deg, #ffd890 0%, #f9b462 100%);
  color: #623500;
}

.editor-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(203, 128, 38, 0.2);
}

.editor-button:focus-visible {
  outline: 2px solid rgba(203, 128, 38, 0.35);
  outline-offset: 2px;
}

.logout-button {
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 1rem 1.2rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #ff9c8b 0%, #ff775f 100%);
  box-shadow: 0 16px 26px rgba(255, 119, 95, 0.28);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 28px rgba(255, 119, 95, 0.35);
}

.logout-button:focus-visible {
  outline: 3px solid rgba(255, 119, 95, 0.45);
  outline-offset: 3px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(47, 47, 51, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
}

.alert-card {
  width: min(320px, 100%);
  background: #ffffff;
  border-radius: 24px;
  padding: 1.8rem 1.6rem 1.4rem;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
}

.alert-card h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #2f2f33;
}

.alert-card p {
  margin: 0.9rem 0 1.6rem;
  font-size: 0.96rem;
  line-height: 1.5;
  color: #5a5a5f;
}

.alert-actions {
  display: flex;
  gap: 0.8rem;
}

.alert-button {
  flex: 1;
  border: none;
  border-radius: 999px;
  padding: 0.65rem 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  background: #f3f3f8;
  color: #3f3f47;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.alert-button--primary {
  background: linear-gradient(135deg, #ff9c8b 0%, #ff775f 100%);
  color: #ffffff;
  box-shadow: 0 12px 20px rgba(255, 119, 95, 0.32);
}

.alert-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
}

.alert-button:focus-visible {
  outline: 2px solid rgba(255, 119, 95, 0.45);
  outline-offset: 2px;
}

@media (max-width: 360px) {
  .settings-header {
    gap: 0.75rem;
  }

  .back-button {
    width: 34px;
    height: 34px;
    font-size: 1rem;
  }

  .settings-card {
    padding: 2rem 1.2rem;
  }

  .info-label {
    flex-basis: 72px;
    font-size: 0.92rem;
  }

  .info-action {
    padding: 0.3rem 0.6rem;
    font-size: 0.78rem;
  }

  .editor-button {
    font-size: 0.85rem;
  }
}

@media (min-width: 768px) {
  .settings-wrapper {
    padding: 4.5rem 2rem;
  }

  .settings-card {
    width: min(540px, 100%);
    padding: 2.6rem 2.4rem 2.6rem;
  }

  .info-label {
    flex-basis: 96px;
  }
}
</style>
