<template>
  <v-container class="home-container">
    <!-- Hero Section -->
    <v-row class="hero-section" align="center" justify="center">
      <v-col cols="12" md="10" class="text-center">
        <v-img
          :src="heroImages[0]"
          max-height="400"
          class="hero-image mb-6"
          alt="Online Certification Concept"
        ></v-img>
        <h1 class="text-h2 font-weight-bold primary--text mb-4">Welcome to Smart Learn</h1>
        <p class="text-h6 mb-6">Your personalized Learning Management System for growth and success.</p>
        <v-btn
          color="primary"
          large
          :to="{ name: 'Courses' }"
          class="enroll-btn"
        >
          <v-icon left>mdi-school</v-icon>
          Enroll Now
        </v-btn>
      </v-col>
    </v-row>

    <!-- About Section -->
    <v-row class="about-section py-12">
      <v-col cols="12" md="6">
        <v-img
          :src="heroImages[1]"
          max-height="300"
          class="about-image"
          alt="Learning Management System Illustration"
        ></v-img>
      </v-col>
      <v-col cols="12" md="6">
        <h2 class="text-h4 primary--text mb-4">About Smart Learn</h2>
        <p class="text-body-1">Smart Learn is designed to empower learners with a seamless online education experience. Access a wide range of courses, track your progress, and earn certifications at your own pace.</p>
      </v-col>
    </v-row>

    <!-- Featured Courses -->
    <v-row class="featured-section py-12" align="center">
      <v-col cols="12">
        <h2 class="text-h4 text-center primary--text mb-6">Featured Courses</h2>
        <v-row>
          <v-col v-for="n in 3" :key="n" cols="12" sm="4">
            <v-card class="elevation-4 pa-4">
              <v-img
                src="https://via.placeholder.com/300x200"
                height="150"
                class="mb-4"
                alt="Course Thumbnail"
              ></v-img>
              <v-card-title>Course {{ n }}</v-card-title>
              <v-card-text>Learn the basics of modern web development.</v-card-text>
              <v-card-actions>
                <v-btn color="primary" text to="/courses">View Details</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Testimonials -->
    <v-row class="testimonials-section py-12" align="center">
      <v-col cols="12">
        <h2 class="text-h4 text-center primary--text mb-6">What Our Learners Say</h2>
        <v-row>
          <v-col cols="12" sm="4" v-for="testimonial in testimonials" :key="testimonial.name">
            <v-card class="elevation-4 pa-4 text-center">
              <v-icon x-large color="primary">mdi-format-quote-open</v-icon>
              <p class="text-body-1 mt-4">{{ testimonial.quote }}</p>
              <p class="text-caption font-weight-bold">{{ testimonial.name }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Call to Action -->
    <v-row class="cta-section py-12" align="center" justify="center" style="background-color: #f5f5f5;">
      <v-col cols="12" md="8" class="text-center">
        <h2 class="text-h4 primary--text mb-4">Ready to Start Learning?</h2>
        <p class="text-body-1 mb-6">Join thousands of learners and unlock your potential today!</p>
        <v-btn
          color="primary"
          large
          :to="{ name: 'Courses' }"
          class="enroll-btn"
        >
          <v-icon left>mdi-school</v-icon>
          Explore Courses
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const heroImages = [
  'https://www.freepik.com/free-vector/online-certification-concept_8725120.htm#fromView=keyword&page=1&position=4&uuid=eebc49a1-bdf9-485e-8761-b97843910f2e&query=Learning+Management+System',
  'https://www.freepik.com/premium-vector/vector-illustration-concept-learning-management-system-lms-as-online-education_371573574.htm#fromView=keyword&page=1&position=5&uuid=eebc49a1-bdf9-485e-8761-b97843910f2e&query=Learning+Management+System',
];

const testimonials = ref([
  { name: 'John Doe', quote: 'Amazing platform to enhance my skills!' },
  { name: 'Jane Smith', quote: 'The courses are well-structured and engaging.' },
  { name: 'Mike Johnson', quote: 'Highly recommend for lifelong learning.' },
]);
</script>

<style scoped>
.home-container {
  padding-top: 64px; /* Adjust for navbar height */
}

.hero-section {
  min-height: 100vh;
  background-color: #f9f9f9;
  padding-top: 80px;
}

.hero-image {
  border-radius: 8px;
}

.enroll-btn {
  text-transform: none;
  font-weight: 500;
  padding: 12px 24px;
}

.about-section {
  background-color: #fff;
}

.about-image {
  border-radius: 8px;
}

.featured-section {
  background-color: #e0f7fa;
}

.testimonials-section {
  background-color: #fff;
}

.cta-section {
  border-radius: 8px;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>