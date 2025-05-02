<template>
  <div class="home-page">
    <!-- Hero Section -->
    <v-row class="hero-section" no-gutters>
      <v-col cols="12" md="6" class="hero-content pa-8">
        <div class="hero-text-content">
          <h1 class="text-h3 font-weight-bold mb-4">
            SmartLearn
          </h1>
          <p class="text-h6 mb-6">
            Your personalized Learning Management System for growth and success.
          </p>
          
          <div class="feature-list">
            <div v-for="(feature, i) in features" :key="i" class="feature-item">
              <v-icon small color="primary" class="mr-2">mdi-check</v-icon>
              <span>{{ feature }}</span>
            </div>
          </div>
          <v-btn
          color="primary"
          large
          :to="{ name: 'Courses' }"
          class="enroll-btn"
        >
          <v-icon left>mdi-school</v-icon>
          Enroll Now
        </v-btn>
        </div>
      </v-col>
      
      <v-col cols="12" md="6" class="hero-image-col pa-0">
        <v-img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          class="hero-image"
          height="100%"
          cover
        ></v-img>
      </v-col>
    </v-row>

    <!-- Why Choose Section -->
    <v-row class="section why-choose-section" no-gutters>
      <v-col cols="12" class="pa-8">
        <div class="section-header">
          <h2 class="text-h4 primary--text mb-2 text-center">Why Choose SmartLearn?</h2>
          <p class="text-subtitle-1 secondary--text mb-8 text-center">Learn smarter, grow faster</p>
        </div>
        
        <v-row class="features-row" justify="center">
          <v-col cols="12" sm="6" md="4" class="feature-card">
            <v-icon x-large color="primary">mdi-account-tie</v-icon>
            <h3 class="text-h6 mt-4 mb-2">Expert Instructors</h3>
            <p class="text-body-1">Learn from industry professionals with real-world experience</p>
          </v-col>
          
          <v-col cols="12" sm="6" md="4" class="feature-card">
            <v-icon x-large color="primary">mdi-clock-outline</v-icon>
            <h3 class="text-h6 mt-4 mb-2">Flexible Learning</h3>
            <p class="text-body-1">Study at your own pace, anytime and anywhere</p>
          </v-col>
          
          <v-col cols="12" sm="6" md="4" class="feature-card">
            <v-icon x-large color="primary">mdi-certificate</v-icon>
            <h3 class="text-h6 mt-4 mb-2">Certification</h3>
            <p class="text-body-1">Earn recognized certificates upon completion</p>
          </v-col>
          
          <v-col cols="12" sm="6" md="4" class="feature-card">
            <v-icon x-large color="primary">mdi-headset</v-icon>
            <h3 class="text-h6 mt-4 mb-2">24/7 Support</h3>
            <p class="text-body-1">Get help whenever you need it</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Featured Courses -->
    <v-row class="section courses-section" no-gutters>
      <v-col cols="12" class="pa-8">
        <div class="section-header">
          <h2 class="text-h4 primary--text mb-2 text-center">Featured Courses</h2>
          <p class="text-subtitle-1 secondary--text mb-8 text-center">Start learning with our most popular courses</p>
        </div>
        
        <v-row class="courses-row" justify="center">
          <v-col v-for="(course, i) in featuredCourses" :key="i" cols="12" sm="6" md="4" class="course-card">
            <v-card elevation="2" class="h-100">
              <v-img
                :src="course.image"
                height="160"
                cover
              ></v-img>
              <v-card-title class="text-h6">{{ course.title }}</v-card-title>
              <v-card-text>
                <p class="text-body-1">{{ course.description }}</p>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" text>View Details</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Testimonials -->
    <v-row class="section testimonials-section" no-gutters>
      <v-col cols="12" class="pa-8">
        <div class="section-header">
          <h2 class="text-h4 primary--text mb-8 text-center">What Our Learners Say</h2>
        </div>
        
        <v-row class="testimonials-row" justify="center">
          <v-col v-for="(testimonial, i) in testimonials" :key="i" cols="12" md="4" class="testimonial-card">
            <v-card elevation="2" class="pa-6 h-100">
              <v-avatar size="80" class="mb-4">
                <v-img :src="testimonial.avatar"></v-img>
              </v-avatar>
              <p class="text-body-1 font-italic mb-4">"{{ testimonial.quote }}"</p>
              <h3 class="text-h6 mb-1">{{ testimonial.name }}</h3>
              <p class="text-caption secondary--text">{{ testimonial.position }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const features = [
  'Personalized learning paths',
  'Expert-led courses',
  'Interactive content',
  'Progress tracking'
];

const featuredCourses = [
  {
    title: 'Data Science Essentials',
    description: 'Introduction to Python for data analysis and visualization',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    title: 'Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript and modern frameworks',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    title: 'Mobile App Development',
    description: 'Build cross-platform apps with Flutter',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

const testimonials = [
  { 
    name: 'John Doe', 
    quote: 'SmartLearn transformed my career with their comprehensive courses.',
    position: 'Web Developer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  { 
    name: 'Jane Smith', 
    quote: 'The platform is intuitive and the instructors are knowledgeable.',
    position: 'Data Analyst',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  { 
    name: 'Mike Johnson', 
    quote: 'Earning certifications helped me get promoted at work.',
    position: 'Mobile Developer',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
  }
];
</script>

<style scoped>
.home-page {
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.hero-text-content {
  max-width: 600px;
  width: 100%;
}

.hero-image-col {
  min-height: 100vh;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.feature-list {
  margin: 24px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.explore-btn {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Sections */
.section {
  padding: 80px 0;
}

.section-header {
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: center;
}

.why-choose-section {
  background-color: white;
}

.features-row {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 24px;
}

.courses-section {
  background-color: #f8f9fa;
}

.courses-row {
  max-width: 1200px;
  margin: 0 auto;
}

.course-card {
  padding: 12px;
}

.testimonials-section {
  background-color: white;
}

.testimonials-row {
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  padding: 12px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .hero-section {
    flex-direction: column;
  }
  
  .hero-content,
  .hero-image-col {
    min-height: 50vh;
    width: 100%;
  }
  
  .hero-text-content {
    padding: 40px 24px;
  }
  
  .feature-card,
  .course-card,
  .testimonial-card {
    padding: 8px;
    margin-bottom: 16px;
  }
  
  .section {
    padding: 60px 0;
  }
}
</style>