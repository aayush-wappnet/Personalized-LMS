<template>
  <v-app>
    <Navbar />
    <v-main>
      <router-view />
    </v-main>
    <Footer />
  </v-app>
</template>

<script lang="ts" setup>
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';
</script>