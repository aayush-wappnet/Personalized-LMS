<template>
    <div class="video-player-container">
      <video
        ref="videoRef"
        class="video-player"
        :src="src"
        @timeupdate="updateTime"
      >
        Your browser does not support the video tag.
      </video>
      <div class="controls">
        <v-btn icon @click="playPause">
          <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
        <v-btn icon @click="muteUnmute">
          <v-icon>{{ isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}</v-icon>
        </v-btn>
        <v-btn icon @click="skipBackward">
          <v-icon>mdi-rewind-10</v-icon>
        </v-btn>
        <v-btn icon @click="skipForward">
          <v-icon>mdi-fast-forward-10</v-icon>
        </v-btn>
        <v-slider
          v-model="currentTime"
          :max="duration"
          @change="seek"
          class="slider"
        ></v-slider>
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  defineProps<{
    src: string;
  }>();
  
  const emit = defineEmits<{
    (e: 'contentCompleted', contentId: number): void;
  }>();
  
  const videoRef = ref<HTMLVideoElement | null>(null);
  const isPlaying = ref(false);
  const isMuted = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  
  const updateTime = () => {
    if (videoRef.value) {
      currentTime.value = videoRef.value.currentTime;
      duration.value = videoRef.value.duration;
      if (!isPlaying.value && videoRef.value.ended) {
        emit('contentCompleted', 0); // Placeholder contentId; adjust as needed
      }
    }
  };
  
  const playPause = () => {
    if (videoRef.value) {
      if (isPlaying.value) {
        videoRef.value.pause();
      } else {
        videoRef.value.play();
      }
      isPlaying.value = !isPlaying.value;
    }
  };
  
  const muteUnmute = () => {
    if (videoRef.value) {
      videoRef.value.muted = !isMuted.value;
      isMuted.value = !isMuted.value;
    }
  };
  
  const skipBackward = () => {
    if (videoRef.value) {
      videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10);
    }
  };
  
  const skipForward = () => {
    if (videoRef.value) {
      videoRef.value.currentTime = Math.min(videoRef.value.duration, videoRef.value.currentTime + 10);
    }
  };
  
  const seek = (value: number) => {
    if (videoRef.value) {
      videoRef.value.currentTime = value;
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  onMounted(() => {
    if (videoRef.value) {
      videoRef.value.addEventListener('timeupdate', updateTime);
    }
  });
  
  onUnmounted(() => {
    if (videoRef.value) {
      videoRef.value.removeEventListener('timeupdate', updateTime);
    }
  });
  </script>
  
  <style scoped>
  .video-player-container {
    position: relative;
  }
  
  .video-player {
    width: 100%;
    max-height: 500px;
  }
  
  .controls {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #000;
    color: #fff;
  }
  
  .slider {
    width: 200px;
    margin: 0 10px;
  }
  </style>