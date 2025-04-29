<template>
  <v-footer app color="secondary" dark class="pa-6">
    <v-container>
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-img
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png" 
            max-height="40"
            max-width="40"
            class="mb-2"
            alt="LMS Logo"
          ></v-img>
          <div>Smart Learn © {{ new Date().getFullYear() }} All rights reserved.</div>
        </v-col>
        <v-col cols="12" md="4" class="text-center">
          <v-btn text to="/about" class="mr-4">About Us</v-btn>
          <v-btn text to="/contact">Contact</v-btn>
        </v-col>
        <v-col cols="12" md="4" class="text-right">
          <v-btn icon class="mr-4">
            <v-icon>mdi-facebook</v-icon>
          </v-btn>
          <v-btn icon class="mr-4">
            <v-icon>mdi-twitter</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-linkedin</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.v-footer {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style>