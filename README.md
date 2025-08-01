# 🔁 SkillSwap

> A full-stack, real-time skill-sharing platform featuring **live video mentoring**, **screen sharing**, and **resource sharing**, built for learners and mentors to connect, collaborate, and grow together.

🔗 **Live Demo:** [SkillSwap](https://skillswap-client-jm4y.onrender.com/)

---

## 🧠 About the Project

**SkillSwap** is a collaborative platform where users can explore mentors or learners based on skills, request live mentoring sessions, and interact through a public wall. It integrates **WebRTC-based live video sessions**, **real-time session requests**, and a **centralized Resource Hub** to enable efficient peer-to-peer learning.

---

## 🚀 Key Features

### 🧑‍💻 Live Skill-Sharing Sessions
- 1-on-1 Mentoring with WebRTC
- Screen Sharing Support
- Real-time Video & Audio Communication
- Session scheduling and management via dashboards

### 📩 Session Management
- Explore users by role/skill
- Send session requests with skill/topic
- Accept/Reject workflows
- Track upcoming & completed sessions

### 🔔 Real-Time Notifications
- Socket.io-based updates for:
  - Session requests
  - Status changes
  - New public posts & comments

### 📢 Public Wall (Social Feed)
- Create posts
- Like and comment
- Promote skill offerings or learning achievements

### 📚 Resource Hub (with Cloudinary)
- Upload and download study materials

### 📌 Frontend
- React.js 
- Tailwind CSS
- Framer Motion
- Axios, React Icons

### 📌 Backend
- Node.js, Express.js
- MongoDB
- JWT Authentication

### 📡 Real-Time / Video
- WebRTC for peer-to-peer video mentoring
- Socket.io for notifications and session events

### ☁️ External Integrations
- Cloudinary for file uploads
- MongoDB Atlas for cloud database
- Render for client hosting

---

## 📦 Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/riddhi010/skillswap.git
cd skillswap

# 2. Install Backend Dependencies
cd server
npm install

# 3. Create a .env file in the /server directory and add the following:
