<template>
  <div class="mypage-wrapper">
    <main class="mypage-card">
      <header class="card-header">
        <div class="profile-avatar">
          <img
            :src="user.gender === 'female' ? '/images/female-profile.png' : '/images/male-profile.png'"
            alt="프로필 이미지"
          />
        </div>
        <div class="nickname-block">
          <div class="nickname-row">
            <span class="nickname-label">{{ user.nickname }}</span>
            <button type="button" class="edit-button" @click="openProfileSettings">
              <span class="sr-only">프로필 수정 페이지로 이동</span>
              <svg class="edit-icon" viewBox="0 0 24 24" aria-hidden="true">
                <g class="edit-icon-shadow">
                  <path d="M4 17.3 13.7 7.6l3.1 3.1-9.7 9.7Z" />
                </g>
                <path
                  class="edit-icon-body"
                  d="m4.3 17.1 2.7 2.7 10.1-10.1-2.7-2.7L4.3 17.1Z"
                />
                <rect
                  class="edit-icon-mid"
                  x="12.1"
                  y="4.6"
                  width="4"
                  height="4"
                  rx="0.7"
                  transform="rotate(-45 14.1 6.6)"
                />
                <path
                  class="edit-icon-eraser"
                  d="m14.9 3.4 1.8-1.8a1.1 1.1 0 0 1 1.6 0l1.3 1.3a1.1 1.1 0 0 1 0 1.6l-1.8 1.8-2.9-2.9Z"
                />
                <path
                  class="edit-icon-tip"
                  d="M4.1 17.3 3.3 21l3.7-.8-.9-2.9Z"
                />
                <path
                  class="edit-icon-outline"
                  d="m3.2 21 1-4.9 10.1-10.1 3.7 3.7-10.1 10.1L3.2 21Z"
                />
              </svg>
            </button>
          </div>
          <div class="nickname-underline"></div>
        </div>
      </header>

      <nav class="menu-list">
        <button type="button" class="menu-item" @click="goTo('history')">
          <span class="menu-item-label">이용 기록</span>
          <i class="menu-item-arrow" aria-hidden="true">›</i>
        </button>
        <button type="button" class="menu-item" @click="goTo('payment')">
          <span class="menu-item-label">결제 수단 관리</span>
          <i class="menu-item-arrow" aria-hidden="true">›</i>
        </button>
        <button type="button" class="menu-item" @click="goTo('notice')">
          <span class="menu-item-label">공지사항</span>
          <i class="menu-item-arrow" aria-hidden="true">›</i>
        </button>
      </nav>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const user = ref({
  gender: "female",
  nickname: "김예은",
});

const routeNameMap: Record<string, string> = {
  history: "History",
  payment: "payment-methods",
  notice: "notice",
};

const goTo = (page: string) => {
  const routeName = routeNameMap[page];

  if (!routeName) {
    console.warn(`Unknown MyPage destination: ${page}`);
    return;
  }

  router.push({ name: routeName });
};

const openProfileSettings = () => {
  router.push("/mypage/settings");
};
</script>

<style scoped>
.mypage-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffe4b3 0%, #fff1d8 35%, #ffffff 100%);
  padding: 3.5rem 1rem 3rem;
  font-family: "Pretendard", "Apple SD Gothic Neo", sans-serif;
}

.mypage-card {
  width: min(420px, 100%);
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 18px 32px rgba(238, 187, 110, 0.28);
  padding: 2.2rem 1.6rem 1.9rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffe9c3, #f8c983);
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 5px #fff;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: #fff7e3;
}

.nickname-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nickname-label {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2f2f33;
}

.nickname-underline {
  margin-top: 0.5rem;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, #f9c66a 0%, rgba(249, 198, 106, 0) 100%);
}

.edit-button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ffd890 0%, #f9b462 100%);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.edit-icon {
  width: 24px;
  height: 24px;
}

.edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 14px rgba(203, 128, 38, 0.24);
}

.edit-button:focus-visible {
  outline: 3px solid rgba(203, 128, 38, 0.4);
  outline-offset: 3px;
}

.edit-icon-shadow path {
  fill: rgba(0, 0, 0, 0.08);
}

.edit-icon-outline {
  fill: none;
  stroke: #6f3a00;
  stroke-width: 1.1;
  stroke-linejoin: round;
}

.edit-icon-body {
  fill: #ffdf7b;
  stroke: #f6b74b;
  stroke-width: 1;
}

.edit-icon-mid {
  fill: #f7c974;
  stroke: #f1a74c;
  stroke-width: 1;
}

.edit-icon-eraser {
  fill: #f8a0a9;
  stroke: #dc6c7b;
  stroke-width: 1;
}

.edit-icon-tip {
  fill: #fdecc9;
  stroke: #ba8042;
  stroke-width: 0.9;
  stroke-linejoin: round;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.menu-item {
  width: 100%;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff3d5 0%, #ffe7c3 100%);
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.05rem;
  font-weight: 600;
  color: #2f2f33;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(244, 193, 122, 0.18);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(237, 173, 98, 0.26);
}

.menu-item:focus-visible {
  outline: 3px solid rgba(237, 173, 98, 0.4);
  outline-offset: 3px;
}

.menu-item-label {
  flex: 1;
  text-align: left;
}

.menu-item-arrow {
  font-style: normal;
  font-size: 1.2rem;
  color: #c48332;
  margin-left: 0.75rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 360px) {
  .profile-avatar {
    width: 76px;
    height: 76px;
  }

  .profile-avatar img {
    width: 62px;
    height: 62px;
  }

  .nickname-label {
    font-size: 1.1rem;
  }

  .edit-button {
    width: 36px;
    height: 36px;
  }
}

@media (min-width: 768px) {
  .mypage-wrapper {
    padding: 4.5rem 2rem;
  }

  .mypage-card {
    width: min(520px, 100%);
    padding: 2.5rem 2.2rem 2.2rem;
  }

  .nickname-label {
    font-size: 1.3rem;
  }
}
</style>
