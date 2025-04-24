<template>
    <v-footer app color="secondary" dark class="pa-4">
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-img
              src="@/public/logo.png"
              max-height="30"
              max-width="30"
              class="mb-2"
              alt="LMS Logo"
            ></v-img>
            <div>LMS Platform &copy; {{ new Date().getFullYear() }}</div>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-btn text to="/about">About</v-btn>
            <v-btn text to="/contact">Contact</v-btn>
            <v-btn text to="/privacy">Privacy Policy</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </template>
  
  <script lang="ts" setup>
  </script>