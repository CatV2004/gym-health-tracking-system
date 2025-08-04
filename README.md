# 🏋️‍♂️ Comprehensive Gym Management & Health Tracking System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/catv2004/gymcare)
[![Stars](https://img.shields.io/github/stars/catv2004/gymcare)](https://github.com/catv2004/gymcare/stargazers)

A full-featured software solution designed to digitize and optimize gym operations while enhancing the training experience for members. The system seamlessly connects **Managers**, **Personal Trainers (PTs)**, and **Members** on a unified platform.

![Project Banner](https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Z3ltLGludGVyaW9yLHdlaWdodHN8fHx8fHwxNzIzNTQyMzYy&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Workflow](#user-workflow)
- [Tech Stack](#tech-stack)
- [Installation Guide](#installation-guide)
- [Usage](#usage)
- [Author](#author)

---

## 📌 Overview

This project addresses the challenges of manual management in gyms, such as tracking members, scheduling sessions, processing payments, and communication between stakeholders. By offering a centralized platform, the system saves time, reduces errors, and delivers a more professional service to customers.

---

## ✨ Key Features

<details>
<summary><strong>👨‍💼 For Gym Managers</strong></summary>

- 📊 **Analytics & Reports**: Visual reports on revenue, new members, usage by hour/day/month.
- 📦 **Training Packages Management**: Create and manage training packages with pricing, benefits, and PT sessions.
- 👥 **User Account Management**: Manage and assign roles for Trainers and Members.
- 💬 **Support & Interaction**: Receive and respond to member support requests via live chat.

</details>

<details>
<summary><strong>🏋️ For Personal Trainers (PTs)</strong></summary>

- 🗓️ **Schedule Management**: View, approve, or suggest changes to member sessions.
- 📈 **Progress Tracking**: Record body metrics (weight, fat, muscle) and progress charts for easy visualization.
- 💬 **Real-Time Chat**: Interact with members anytime using Firebase Chat.

</details>

<details>
<summary><strong>🧘 For Members</strong></summary>

- 👤 **Health Profile**: Provide basic health info and set personal fitness goals.
- 📅 **Flexible Booking**: Book sessions with PTs or choose free workout slots.
- 💳 **Online Payment**: Pay for training packages via MoMo, VNPAY, or bank transfer and upload receipts.
- 🔔 **Notifications**: Auto-reminders for sessions and package expiration.
- ⭐ **Review & Feedback**: Rate PTs and gym services for continuous improvement.
- 📊 **Track Progress**: Visualize personal fitness progress over time.

</details>

---

## 🔄 User Workflow

1. **Registration**: Users select a role (Manager, PT, Member) and create an account. Members must provide basic health info.
2. **Purchase Package**: Members browse and purchase suitable training packages online.
3. **Schedule Sessions**: Members book with PTs or select available times for self-workout.
4. **Training & Tracking**: PTs lead sessions and log progress after each workout.
5. **Communication**: Members and PTs communicate via chat. Feedback and ratings can be submitted.
6. **Admin Oversight**: Managers monitor all activity, revenue, and gym performance via dashboards.

---

## 🧰 Tech Stack

| Area             | Technologies                                                                                  |
|------------------|-----------------------------------------------------------------------------------------------|
| **Frontend**      | `React Native` – `TailwindCSS` / `NativeWind`                                                |
| **Backend**       | `Django` – Django REST Framework                                                             |
| **Database**      | `MySQL` – used for structured relational data (users, subscriptions, workout logs, etc.)     |
| **Real-time**     | `Firestore` (used for real-time chat)                         |
| **Payments**      | Integrated APIs: `MoMo`, `VNPAY`                                                              |
| **Deployment**    | `Expo Go`              |
| **CI/CD**         | `GitHub Actions`                                                                             |
| **State Management** | `Redux Toolkit`                                                           |

---

## ⚙️ Installation Guide

To run this project locally, follow these steps:

### 1. Requirements

- Node.js (v18 or higher)
- npm / yarn / pnpm
- Python 3.x + pip
- Git

### 2. Clone the repository

```bash
git clone https://github.com/catv2004/gymcare.git
cd gymcare
```

**3. Install Dependencies**

### Backend (Django)::

```bash
cd server
npm install
```

### Frontend (React Native):

```bash
cd server
npm install
```

**4.⚙️ Configure Environment Variables**
* Create a .env file in the gymcare (backend) folder using .env.example as reference.
* Example .env content:

```bash
# Ví dụ file .env trong server
DATABASE_URL="your_mongodb_connection_string"
PORT=8080
JWT_SECRET="your_super_secret_key"
```

## Usage

**1. Run Backend (Django):**

```bash
cd gymcare
docker-compose up --build
```

This will start:
- Django backend at: http://localhost:8000
- MySql service
- (Optionally) admin tools like pgAdmin if defined in docker-compose.yml


**1. Run Frontend (React Native):**

```bash
cd gymcare-app
npm run dev 
```

App will run via Expo or open in a simulator or physical device.

## 🔧 Docker Tips
- To run in detached mode:
  ```bash
  docker-compose up -d
  ```
  
- To stop and remove containers:
  ```bash
  docker-compose down
  ```
  
- To apply environment changes:
  ```bash
  docker-compose up --build
  ```

## Tác Giả

- **[Nguyen Manh Cuong (CatV2004)]** – Project Leader, Backend & Frontend Developer – [GitHub Profile](https://github.com/catv2004)



