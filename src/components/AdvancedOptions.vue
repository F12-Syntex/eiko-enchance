<template>
  <div class="advanced-options">
    <div class="header" @click="isCollapsed = !isCollapsed">
      <h2 class="unselectable">Advanced Options</h2>
      <i :class="['arrow', isCollapsed ? 'down' : 'up']"></i>
    </div>
    <div class="content" v-show="!isCollapsed">
      <p class="description unselectable">
        Start: {{ formatTime(start) }} | End: {{ formatTime(end) }}
      </p>
      <div class="slider-container">
        <div class="slider" ref="slider">
          <div class="track">
            <div v-for="minute in maxMinutes" :key="minute"
              :style="{ left: `${(minute * 60 / videoDuration.value) * 100}%` }" class="marker"></div>
          </div>
          <div class="range" :style="{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }"
            @mousedown="startMove($event, 'range')"></div>
          <div class="thumb start-thumb" :style="{ left: `${startPercent}%` }" @mousedown="startMove($event, 'start')">
          </div>
          <div class="thumb end-thumb" :style="{ left: `${endPercent}%` }" @mousedown="startMove($event, 'end')"></div>
        </div>
      </div>
      <div v-for="option in options" :key="option.name" class="option-container">
        <label :for="option.name">{{ option.label }}</label>
        <input :id="option.name" :type="option.type" v-model="optionValues[option.name]" @change="updateOptionValue(option.name)">
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';

export default {
  name: 'AdvancedOptions',
  setup(props, { emit, expose }) {
    const isCollapsed = ref(false);
    const videoDuration = ref(parseInt(sessionStorage.getItem('videoDuration')) || 10);
    const start = ref(0);
    const end = ref(videoDuration.value);

    const options = [
      { name: 'quality', label: 'Quality', type: 'number' },
      { name: 'framerate', label: 'Frame Rate', type: 'number' },
      { name: 'resolution', label: 'Resolution', type: 'text' },
      { name: 'format', label: 'Format', type: 'text' },
    ];

    const optionValues = reactive({});

    const maxMinutes = computed(() => Math.floor(videoDuration.value / 60));

    const startPercent = computed(() => (start.value / videoDuration.value) * 100);
    const endPercent = computed(() => (end.value / videoDuration.value) * 100);

    const updateOptions = () => {
      const startTimeMinutes = Math.floor(start.value / 60);
      const startTimeSeconds = Math.round(start.value % 60);
      const durationSeconds = end.value - start.value;
      const durationMinutes = Math.floor(durationSeconds / 60);
      const durationSecondsRounded = Math.round(durationSeconds % 60);

      sessionStorage.setItem('startTimeMinutes', startTimeMinutes);
      sessionStorage.setItem('startTimeSeconds', startTimeSeconds);
      sessionStorage.setItem('durationMinutes', durationMinutes);
      sessionStorage.setItem('durationSeconds', durationSecondsRounded);

      emit('update:options', {
        startTimeMinutes,
        startTimeSeconds,
        durationMinutes,
        durationSeconds: durationSecondsRounded,
        ...optionValues
      });
    };

    const updateOptionValue = (optionName) => {
      sessionStorage.setItem(optionName, optionValues[optionName]);
      updateOptions();
    };

    const loadOptionsFromSession = () => {
      const startTimeMinutes = parseInt(sessionStorage.getItem('startTimeMinutes')) || 0;
      const startTimeSeconds = parseInt(sessionStorage.getItem('startTimeSeconds')) || 0;
      const durationMinutes = parseInt(sessionStorage.getItem('durationMinutes')) || 10;
      const durationSeconds = parseInt(sessionStorage.getItem('durationSeconds')) || 10;

      start.value = 0;
      end.value = videoDuration.value;

      options.forEach(option => {
        const value = sessionStorage.getItem(option.name);
        if (value !== null) {
          optionValues[option.name] = value;
        }
      });

      emit('update:options', {
        startTimeMinutes,
        startTimeSeconds,
        durationMinutes,
        durationSeconds: durationSeconds,
        ...optionValues
      });

      console.log('Loaded options from session storage:', { startTimeMinutes, startTimeSeconds, durationMinutes, durationSeconds, ...optionValues });
    };

    const reload = () => {
      const newDuration = parseInt(sessionStorage.getItem('videoDuration')) || 10;
      videoDuration.value = newDuration;
      start.value = 0;
      end.value = newDuration;
      loadOptionsFromSession();
      updateOptions();
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      const millis = Math.round((seconds - Math.floor(seconds)) * 1000);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(3, '0')}`;
    };

    const startMove = (event, type) => {
      event.preventDefault();
      const slider = event.target.closest('.slider');
      const rect = slider.getBoundingClientRect();
      const initialPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const initialStart = start.value;
      const initialEnd = end.value;
      const rangeWidth = initialEnd - initialStart;

      const onMouseMove = (e) => {
        const currentPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const deltaPercent = currentPercent - initialPercent;
        const deltaValue = (deltaPercent / 100) * videoDuration.value;

        if (type === 'start' && initialStart + deltaValue < end.value) {
          start.value = Math.max(0, Math.min(initialStart + deltaValue, videoDuration.value));
        } else if (type === 'end' && initialEnd + deltaValue > start.value) {
          end.value = Math.max(0, Math.min(initialEnd + deltaValue, videoDuration.value));
        } else if (type === 'range') {
          const newStart = Math.max(0, Math.min(initialStart + deltaValue, videoDuration.value - rangeWidth));
          const newEnd = newStart + rangeWidth;
          if (newEnd <= videoDuration.value) {
            start.value = newStart;
            end.value = newEnd;
          }
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        updateOptions();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    onMounted(() => {
      loadOptionsFromSession();
    });

    expose({ reload: reload });

    return {
      isCollapsed,
      start,
      end,
      videoDuration,
      maxMinutes,
      startPercent,
      endPercent,
      startMove,
      formatTime,
      options,
      optionValues,
      updateOptionValue
    };
  }
};
</script>

<style scoped>
.unselectable {
  user-select: none;
}

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

.slider-container {
  position: relative;
  width: 100%;
  margin: 1rem 0;
}

.slider {
  position: relative;
  width: 100%;
  height: 12px;
  background-color: #444;
}

.track {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #444;
}

.marker {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: #ccc;
}

.range {
  position: absolute;
  height: 100%;
  background-color: #888;
  cursor: move;
}

.thumb {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.start-thumb {
  background-color: rgba(76, 175, 80, 0.8);
  cursor: ew-resize;
}

.end-thumb {
  background-color: rgba(244, 67, 54, 0.8);
  cursor: ew-resize;
}

.description {
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-top: 0.25rem;
}

.option-container {
  margin-top: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #444;
  background-color: #333;
  color: #ffffff;
  border-radius: 4px;
}
</style>