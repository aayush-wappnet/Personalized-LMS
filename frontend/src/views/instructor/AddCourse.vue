<template>
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="pa-6 add-course-card elevation-6" :class="{ 'scale-up': showCard }">
            <v-row>
              <v-col cols="12">
                <h1 class="text-h4 primary--text mb-6 text-center">
                  <v-icon large left>mdi-plus-box</v-icon>
                  Add New Course
                </h1>
              </v-col>
            </v-row>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="title"
                label="Course Title"
                :rules="rules.title"
                prepend-icon="mdi-book-open"
                outlined
                dense
                class="mb-4 transition-input custom-input-height"
              ></v-text-field>
              <v-textarea
                v-model="description"
                label="Course Description"
                :rules="rules.description"
                prepend-icon="mdi-text"
                outlined
                dense
                class="mb-4 transition-input custom-input-height"
                rows="3"
              ></v-textarea>
              <v-file-input
                v-model="thumbnail"
                label="Thumbnail Image"
                :rules="rules.thumbnail"
                prepend-icon="mdi-image"
                accept="image/*"
                outlined
                dense
                class="mb-4 transition-input custom-input-height"
                @change="onFileChange"
              ></v-file-input>
              <v-img
                v-if="thumbnailPreview"
                :src="thumbnailPreview"
                max-height="150px"
                class="mb-4 rounded-lg mx-auto"
                style="max-width: 100%;"
              ></v-img>
              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading"
                class="mt-4 transition-btn"
                :class="{ 'hover-btn': isHovered }"
                @mouseover="isHovered = true"
                @mouseleave="isHovered = false"
              >
                Create Course
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.store';
  import { useToast } from '../../composables/useToast';
  import { createCourse } from '../../api/course.api';
  import * as yup from 'yup';
  import { useForm, useField } from 'vee-validate';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const { showToast } = useToast();
  const loading = ref(false);
  const isHovered = ref(false);
  const showCard = ref(false);
  const thumbnailPreview = ref<string | null>(null);
  
  interface CreateCourseForm {
    title: string;
    description: string;
    thumbnail: File | null;
  }
  
  const schema = yup.object({
    title: yup.string().required('Course title is required').min(3, 'Title must be at least 3 characters'),
    description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    thumbnail: yup
      .mixed()
      .required('Thumbnail image is required')
      .test('fileType', 'Only image files are allowed', (value: any) => {
        if (!value) return false;
        const file = value as File; // Cast to File for type checking
        return file && ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      })
      .test('fileSize', 'File size must be less than 5MB', (value: any) => {
        if (!value) return false;
        const file = value as File;
        return file && file.size <= 5 * 1024 * 1024; // 5MB limit
      }),
  });
  
  const { handleSubmit } = useForm<CreateCourseForm>({
    validationSchema: schema,
  });
  
  const { value: title } = useField<string>('title');
  const { value: description } = useField<string>('description');
  const { value: thumbnail } = useField<File | null>('thumbnail');
  
  const rules = {
    title: [(v: string) => !!v || 'Course title is required', (v: string) => v.length >= 3 || 'Minimum 3 characters'],
    description: [(v: string) => !!v || 'Description is required', (v: string) => v.length >= 10 || 'Minimum 10 characters'],
    thumbnail: [
      (v: File | null) => !!v || 'Thumbnail image is required',
      (v: File | null) => (v ? ['image/jpeg', 'image/png', 'image/gif'].includes(v.type) : true) || 'Only image files are allowed',
      (v: File | null) => (v ? v.size <= 5 * 1024 * 1024 : true) || 'File size must be less than 5MB',
    ],
  };
  
  onMounted(() => {
    setTimeout(() => (showCard.value = true), 100);
  });
  
  const onFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        thumbnailPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      thumbnailPreview.value = null;
    }
  };
  
  const onSubmit = handleSubmit(async (values: CreateCourseForm) => {
    if (authStore.user?.role !== 'instructor') {
      showToast('Access denied. Only instructors can create courses.', 'error');
      return;
    }
  
    if (!values.thumbnail) {
      showToast('Please upload a thumbnail image.', 'error');
      return;
    }
  
    loading.value = true;
    try {
      await createCourse({
        title: values.title,
        description: values.description,
        thumbnail: values.thumbnail,
      });
      showToast('Course created successfully!', 'success');
      router.push('/instructor/courses');
    } catch (error) {
      showToast('Failed to create course. Please try again.', 'error');
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  .add-course-card {
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    transition: transform 0.3s ease;
  }
  
  .scale-up {
    transform: scale(1.02);
  }
  
  .transition-input {
    transition: all 0.3s ease;
  }
  
  .transition-input:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .custom-input-height .v-input__control {
    height: 40px;
  }
  
  .custom-input-height .v-textarea .v-input__control {
    height: auto;
    min-height: 80px;
  }
  
  .transition-btn {
    transition: all 0.3s ease;
  }
  
  .hover-btn {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  </style>