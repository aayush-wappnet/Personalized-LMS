<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title class="headline primary white--text">
        <v-icon left>mdi-account</v-icon>
        Profile
      </v-card-title>
      <v-card-text v-if="profile" class="pa-6">
        <div class="profile-item">
          <div class="profile-label">
            <v-icon small class="mr-2">mdi-account-box</v-icon>
            Username
          </div>
          <div class="profile-value">{{ profile.userName }}</div>
        </div>
        
        <v-divider class="my-3"></v-divider>
        
        <div class="profile-item">
          <div class="profile-label">
            <v-icon small class="mr-2">mdi-email</v-icon>
            Email
          </div>
          <div class="profile-value">{{ profile.email }}</div>
        </div>
        
        <v-divider v-if="profile.role === 'student'" class="my-3"></v-divider>
        
        <div v-if="profile.role === 'student'" class="profile-item">
          <div class="profile-label">
            <v-icon small class="mr-2">mdi-star</v-icon>
            Points
          </div>
          <div class="profile-value">{{ profile.points || 0 }}</div>
        </div>
        
        <v-divider v-if="profile.role === 'student' && profile.badges && profile.badges.length > 0" class="my-3"></v-divider>
        
        <div v-if="profile.role === 'student' && profile.badges && profile.badges.length > 0" class="profile-item">
          <div class="profile-label">
            <v-icon small class="mr-2">mdi-medal</v-icon>
            Badges
          </div>
          <div class="profile-value badges-container">
            <v-chip
              v-for="(badge, index) in profile.badges"
              :key="index"
              small
              class="ma-1"
              :color="badgeColors[index % badgeColors.length]"
            >
              <v-icon small left>mdi-award</v-icon>
              {{ badge }}
            </v-chip>
          </div>
        </div>
        
        <v-divider class="my-3"></v-divider>
        
        <div class="profile-item">
          <div class="profile-label">
            <v-icon small class="mr-2">mdi-account-key</v-icon>
            Role
          </div>
          <div class="profile-value">{{ profile.role }}</div>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false">
          <v-icon left>mdi-close</v-icon>
          CLOSE
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { AuthProfile } from '../types/auth';

defineProps<{
  profile: AuthProfile | null;
}>();

const dialog = ref(false);
const badgeColors = ['primary', 'success', 'warning', 'error', 'info'];

defineExpose({ open: () => (dialog.value = true) });
</script>

<style scoped>
.headline {
  padding: 16px;
}

.profile-item {
  margin-bottom: 16px;
}

.profile-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.profile-value {
  font-size: 1rem;
  padding-left: 28px; /* Align with icon text */
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>