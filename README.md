Role-Based Access Control (RBAC) System with AI Assistant

A SaaS-style user management system built using the MERN stack, featuring secure JWT authentication, role-based authorization, and an AI-powered assistant to enhance user experience.


Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT (JSON Web Tokens)

AI Integration: Gemini API


Features

🔐 Authentication & Security

User registration and login with JWT

Secure password hashing

Token-based session management

🧑‍💼 Role-Based Access Control

Enum-based roles: User | Manager | Admin

Middleware-based permission enforcement

Route-level protection

📊 Role Capabilities

Admin: Full user management (create, update, delete)

Manager: Limited user control

User: Profile-level access

🤖 AI Assistant

Integrated AI chatbot powered by Gemini API

Provides guidance on system features and usage

🏗️ Architecture

Modular backend structure

Middleware-based authorization flow

Clean separation of concerns (routes, controllers, middleware)

🧠 System Flow

User logs in → receives JWT

Request sent to protected route

Middleware:

Verifies token

Checks role permissions

Request is processed if authorized

AI assistant available for contextual help


⚙️ Setup

Clone the repository

Create .env file:

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

GEMINI_API_KEY=your_api_key

Install dependencies

Run the app:

npm run dev


📸 Screenshots

Admin Dashboard
<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/fbb86437-fccd-46e8-8ffe-43b8fac62923" />

Manager Dashboard
<img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/570097c7-83a7-44cf-ae07-cf548fddb128" />
