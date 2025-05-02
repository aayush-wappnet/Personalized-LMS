# AI-Based Personalized Learning Management System(LMS)
-AI-Based Personalized Learning Management System (LMS) is a full-stack web application where AI-driven recommendations, course management, and gamificatio
## 🚀 Features
### 🔑 User Authentication
-Register and login for Students, Instructors, and Admins
-JWT-based authentication with Role-Based Access Control (RBAC)
-Protected routes for different user roles

### 🎓 Learning Management
-Course Management: Create, manage, and track courses with modules, content, quizzes, and completion status
-Student Features: View enrolled courses, progress, and recommended topics based on AI analysis
-Instructor Features: Create courses, modules, and questions
-Admin Features: Monitor user activity, engagement analytics, and identify top
-Gamification Engine: Tracks points and badges


## 🛠 Tech Stack
### Backend
- **Fastify (modular architecture with plugins, services, controllers)**
- **PostgreSQL (with TypeORM)**
- **TypeScript**
- **JWT Authentication**
- **Fastify Schema Validation**
- **Cloudinary (for image and video storage)**

### Frontend
- **Vue.js (with TypeScript)**
- **Pinia (for state management)**
- **Vue Router (for navigation)**
- **Vuetify (for UI components)**
- **Vue Form Libraries (for form validation)**

## Setup Instructions
### Prerequisites
- **Node.js (v18 or higher)**
- **npm**
- **PostgreSQL**
- **Cloudinary Account**
- **Hugging Face API Token**



### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
 ```bash
    npm install
```
3. Create a `.env` file in the backend directory with the following variables:
   ```
    PORT=3000
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_NAME=lms_db
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    HUGGINGFACE_API_TOKEN=your_huggingface_token
    ```
4. Start the development server:
   ```bash
   npm run dev
   ```

5. The backend API will be available at http://localhost:3000


### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Create .env files in frontend:
    ```
    VITE_API_BASE_URL=http://localhost:3000/api
    ```

4. Start the development server:
 ```bash
    npm run dev
```
5. The frontend application will be available at http://localhost:5173

## API Documentation

The complete API documentation is available on Postman:
[AI-Based Personalized Learning Management System API Documentation](https://documenter.postman.com/preview/43270454-2b028a5c-882c-4f59-95a2-6795250f7d37?environment=&versionTag=latest&apiName=CURRENT&version=latest&documentationLayout=classic-double-column&documentationTheme=light&logo=https%3A%2F%2Fres.cloudinary.com%2Fpostman%2Fimage%2Fupload%2Ft_team_logo%2Fv1%2Fteam%2Fanonymous_team&logoDark=https%3A%2F%2Fres.cloudinary.com%2Fpostman%2Fimage%2Fupload%2Ft_team_logo%2Fv1%2Fteam%2Fanonymous_team&right-sidebar=303030&top-bar=FFFFFF&highlight=FF6C37&right-sidebar-dark=303030&top-bar-dark=212121&highlight-dark=FF6C37)


# 📽️ AI-Based Personalized Learning Management System - Demo Video  

Watch the demo of the **AI-Based Personalized Learning Management System**:  
🔗 **[Click here to watch the demo]([https://drive.google.com/file/d/1UOWps0XXWWmrnetPL-d8MZU6X9ce0cMU/view?usp=sharing](https://drive.google.com/file/d/186VvZQIIoWbvGx9Bp9u7gutdh6PvGmxX/view?usp=sharing))** 
