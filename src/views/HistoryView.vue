<template>
  <div class="history-wrapper">
    <header class="history-header">
      <button type="button" class="back-button" @click="goBack" aria-label="마이페이지로 돌아가기">
        ←
      </button>
      <h1>이용 기록</h1>
    </header>

    <main class="history-content">
      <section
        v-for="ride in rides"
        :key="ride.id"
        class="history-card"
      >
        <header class="card-header">
          <div class="ride-meta">
            <span class="ride-icon">🚕</span>
            <div>
              <h2>택시</h2>
              <p class="ride-date">{{ ride.date }}</p>
            </div>
          </div>
        </header>

        <dl class="ride-details">
          <div class="ride-row">
            <dt>운행 시간</dt>
            <dd>{{ ride.time }}</dd>
          </div>
          <div class="ride-row">
            <dt>출발</dt>
            <dd>{{ ride.origin }}</dd>
          </div>
          <div class="ride-row">
            <dt>도착</dt>
            <dd>{{ ride.destination }}</dd>
          </div>
          <div class="ride-row total">
            <dt>금액</dt>
            <dd>{{ ride.fare }}</dd>
          </div>
        </dl>

        <div class="card-actions">
          <button
            type="button"
            class="action-button action-button--primary"
            @click="goToReview(ride.id)"
          >
            평가하기
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const rides = [
  {
    id: 1,
    date: "25.xx.xx (월)",
    time: "13:21 - 13:29",
    origin: "출발지",
    destination: "도착지",
    fare: "5,700원",
  },
  {
    id: 2,
    date: "25.10.14 (월)",
    time: "07:10 - 07:17",
    origin: "전북대학교 전주캠퍼스 창의관",
    destination: "전주시외버스공용터미널",
    fare: "5,000원",
  },
  {
    id: 3,
    date: "25.10.06 (일)",
    time: "10:23 - 10:30",
    origin: "전북대학교 한울관",
    destination: "전주역 서부광장",
    fare: "6,200원",
  },
];

const goBack = () => {
  router.back();
};

const goToReview = (rideId: number) => {
  router.push({ name: "ride-review", query: { rideId } }).catch((error) => {
    console.warn("리뷰 페이지 이동 중 오류", error);
  });
};
</script>

<style scoped>
.history-wrapper {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffe4b3 0%, #fff1d8 35%, #ffffff 100%);
  font-family: "Pretendard", "Apple SD Gothic Neo", sans-serif;
  padding: 3.5rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-header h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #2f2f33;
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
  font-size: 1.05rem;
  cursor: pointer;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.history-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.4rem 1.3rem 1.25rem;
  box-shadow: 0 18px 32px rgba(233, 184, 116, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ride-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.ride-icon {
  font-size: 1.6rem;
}

.ride-meta h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #2f2f33;
}

.ride-date {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: #6a6a70;
}

.ride-details {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin: 0;
}

.ride-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #3a3a40;
}

.ride-row dt {
  font-weight: 600;
  color: #6a6a70;
}

.ride-row.total dt {
  color: #2f2f33;
}

.ride-row.total dd {
  font-weight: 700;
  color: #ff775f;
}

.ride-row dd {
  margin: 0;
  text-align: right;
  flex: 1;
}

.card-actions {
  display: flex;
  margin-top: 0.4rem;
}

.action-button {
  flex: 1;
  border: none;
  border-radius: 14px;
  padding: 0.75rem 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.action-button--primary {
  background: linear-gradient(135deg, #ff9c8b 0%, #ff775f 100%);
  color: #ffffff;
  box-shadow: 0 12px 20px rgba(255, 119, 95, 0.32);
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button:focus-visible {
  outline: 2px solid rgba(255, 119, 95, 0.35);
  outline-offset: 2px;
}

@media (min-width: 768px) {
  .history-wrapper {
    padding: 4rem 2.5rem;
  }

  .history-card {
    padding: 1.6rem 1.8rem 1.4rem;
  }

  .ride-row {
    font-size: 1rem;
  }
}
</style>
