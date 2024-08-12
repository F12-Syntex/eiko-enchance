<template>
  <div class="advanced-options">
    <div class="header" @click="isCollapsed = !isCollapsed">
      <h2>Advanced Options</h2>
      <i :class="['arrow', isCollapsed ? 'down' : 'up']"></i>
    </div>
    <div class="content" v-show="!isCollapsed">
      <div class="option-grid">
        <div class="option-group">
          <label for="start-time">Start Time</label>
          <div class="time-select">
            <select v-model="options.startTimeMinutes">
              <option v-for="minute in maxMinutes" :key="minute" :value="minute">{{ formatTime(minute) }}</option>
            </select>
            <span>:</span>
            <select v-model="options.startTimeSeconds">
              <option v-for="second in 60" :key="second" :value="second">{{ formatTime(second) }}</option>
            </select>
          </div>
          <p class="description">Start time in minutes:seconds (default: 00:00)</p>
        </div>
        <div class="option-group">
          <label for="duration">Duration</label>
          <div class="time-select">
            <select v-model="options.durationMinutes">
              <option v-for="minute in maxMinutes" :key="minute" :value="minute">{{ formatTime(minute) }}</option>
            </select>
            <span>:</span>
            <select v-model="options.durationSeconds">
              <option v-for="second in 60" :key="second" :value="second">{{ formatTime(second) }}</option>
            </select>
          </div>
          <p class="description">Duration in minutes:seconds (default: 00:00)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';

export default {
  name: 'AdvancedOptions',
  setup(props, { emit }) {
    const isCollapsed = ref(false);
    const options = ref({
      startTimeMinutes: 0,
      startTimeSeconds: 0,
      durationMinutes: 0,
      durationSeconds: 0,
    });

    const videoDuration = ref(parseInt(sessionStorage.getItem('videoDuration')) || 0);

    const maxMinutes = computed(() => Math.floor(videoDuration.value / 60));

    const emitOptions = () => {
      emit('update:options', options.value);
      saveOptionsToSession();
    };

    const saveOptionsToSession = () => {
      sessionStorage.setItem('startTimeMinutes', options.value.startTimeMinutes);
      sessionStorage.setItem('startTimeSeconds', options.value.startTimeSeconds);
      sessionStorage.setItem('durationMinutes', options.value.durationMinutes);
      sessionStorage.setItem('durationSeconds', options.value.durationSeconds);
    };

    const loadOptionsFromSession = () => {
      options.value.startTimeMinutes = parseInt(sessionStorage.getItem('startTimeMinutes')) || 0;
      options.value.startTimeSeconds = parseInt(sessionStorage.getItem('startTimeSeconds')) || 0;
      options.value.durationMinutes = parseInt(sessionStorage.getItem('durationMinutes')) || 0;
      options.value.durationSeconds = parseInt(sessionStorage.getItem('durationSeconds')) || 0;
    };

    const formatTime = (value) => {
      return value.toString().padStart(2, '0');
    };

    onMounted(() => {
      loadOptionsFromSession();
    });

    onUnmounted(() => {
      saveOptionsToSession();
    });

    return {
      isCollapsed,
      options,
      emitOptions,
      formatTime,
      maxMinutes,
    };
  },
};
</script>

<style scoped>
.advanced-options {
  width: 100%;
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(20px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

h2 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0;
}

.arrow {
  border: solid #e0e0e0;
  border-width: 0 3px 3px 0;
  padding: 5px;
  transition: transform 0.3s ease;
}

.up {
  transform: rotate(-135deg);
}

.down {
  transform: rotate(45deg);
}

.content {
  margin-top: 1rem;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

select {
  padding: 0.75rem;
  border-radius: 10px;
  background-color: #444444;
  color: #e0e0e0;
  border: 1px solid #555555;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
}

select:focus {
  outline: none;
  background-color: #555555;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.description {
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-top: 0.25rem;
}

.time-select {
  display: flex;
  align-items: center;
}

.time-select select {
  width: auto;
  margin: 0 0.5rem;
}
</style>