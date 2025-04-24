# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

```
frontend/
├── node_modules/
├── public/
│   ├── favicon.ico
│   ├── logo.png           # LMS logo for navbar
│   └── images/            # Static images for the app
├── src/
│   ├── api/               # API service layer for backend communication
│   │   ├── auth.api.ts
│   │   ├── course.api.ts
│   │   └── api.config.ts
│   ├── assets/            # Static assets (CSS, images, fonts)
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── fonts/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Generic components (e.g., buttons, modals)
│   │   │   ├── AppButton.vue
│   │   │   └── ToastMessage.vue
│   │   ├── layout/        # Layout components (e.g., navbar, footer)
│   │   │   ├── Navbar.vue
│   │   │   └── Footer.vue
│   │   └── dashboard/     # Dashboard-specific components
│   │       ├── CourseCard.vue
│   │       └── ProgressBar.vue
│   ├── composables/       # Reusable composable functions
│   │   └── useToast.ts
│   ├── layouts/           # Page layouts
│   │   ├── DefaultLayout.vue
│   │   └── AuthLayout.vue
│   ├── router/            # Vue Router configuration
│   │   └── index.ts
│   ├── stores/            # Pinia stores for state management
│   │   ├── auth.store.ts
│   │   ├── course.store.ts
│   │   └── notification.store.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── course.ts
│   │   └── user.ts
│   ├── utils/             # Utility functions
│   │   ├── axios.ts       # Axios configuration
│   │   └── validators.ts  # Form validation helpers
│   ├── views/             # Page-level components (mapped to routes)
│   │   ├── auth/
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── student/
│   │   │   ├── Dashboard.vue
│   │   │   └── Quiz.vue
│   │   ├── instructor/
│   │   │   └── CourseCreator.vue
│   │   └── admin/
│   │       └── Analytics.vue
│   ├── App.vue            # Root Vue component
│   ├── main.ts            # Application entry point
│   └── env.d.ts           # TypeScript environment declarations
├── .env                   # Environment variables
├── .gitignore
├── index.html             # Vite entry point
├── package.json
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts         # Vite configuration
```
