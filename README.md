# Hệ Thống Quản Lý Phòng Gym & Theo Dõi Sức Khỏe Toàn Diện

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-username/your-repo)
[![Stars](https://img.shields.io/github/stars/your-username/your-repo)](https://github.com/your-username/your-repo/stargazers)

Một giải pháp phần mềm toàn diện được thiết kế để số hóa và tối ưu hóa hoạt động của phòng gym, đồng thời nâng cao trải nghiệm tập luyện cho hội viên. Hệ thống kết nối liền mạch giữa **Quản Lý**, **Huấn Luyện Viên (PT)** và **Hội Viên** trên một nền tảng duy nhất.

![Project Banner](https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Z3ltLGludGVyaW9yLHdlaWdodHN8fHx8fHwxNzIzNTQyMzYy&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1080)

---

## MỤC LỤC

- [Tổng Quan](#tổng-quan)
- [Tính Năng Nổi Bật](#tính-năng-nổi-bật)
- [Luồng Hoạt Động Người Dùng](#luồng-hoạt-động-người-dùng)
- [Công Nghệ Sử Dụng (Tech Stack)](#công-nghệ-sử-dụng-tech-stack)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Cách Sử Dụng](#cách-sử-dụng)
- [Tác Giả](#tác-giả)

---

## Tổng Quan

Dự án này giải quyết các thách thức trong việc quản lý thủ công tại các phòng gym như quản lý hội viên, sắp xếp lịch tập, theo dõi thanh toán và tương tác giữa các bên. Bằng cách cung cấp một nền tảng tập trung, hệ thống giúp tiết kiệm thời gian, giảm thiểu sai sót và mang lại dịch vụ chuyên nghiệp hơn cho khách hàng.

## Tính Năng Nổi Bật

<details>
<summary><strong> dành cho Quản Lý Phòng Gym</strong></summary>

-   📊 **Thống Kê & Báo Cáo:** Xem báo cáo trực quan về doanh thu, số lượng hội viên mới, mức độ sử dụng phòng tập theo giờ/ngày/tháng.
-   📦 **Quản Lý Gói Tập:** Dễ dàng tạo, chỉnh sửa, và quản lý các gói tập (tháng, quý, năm) với giá, quyền lợi, và số buổi tập kèm PT.
-   👥 **Quản Lý Tài Khoản:** Quản lý thông tin và phân quyền cho các tài khoản Huấn luyện viên và Hội viên.
-   💬 **Hỗ Trợ & Tương Tác:** Nhận và xử lý các yêu cầu hỗ trợ từ hội viên qua hệ thống chat.

</details>

<details>
<summary><strong> dành cho Huấn Luyện Viên (PT)</strong></summary>

-   🗓️ **Quản Lý Lịch Tập:** Xem, duyệt, hoặc đề xuất thay đổi lịch hẹn từ hội viên.
-   📈 **Theo Dõi Tiến Độ:** Cập nhật các chỉ số cơ thể (cân nặng, cơ, mỡ) và tiến độ tập luyện của hội viên. Biểu đồ hóa quá trình để hội viên dễ theo dõi.
-   💬 **Chat Thời Gian Thực:** Tương tác, tư vấn và trả lời câu hỏi của hội viên mọi lúc mọi nơi qua Firebase Chat.

</details>

<details>
<summary><strong> dành cho Hội Viên</strong></summary>

-   👤 **Hồ Sơ Sức Khỏe:** Cung cấp thông tin sức khỏe ban đầu (chiều cao, cân nặng) và đặt ra mục tiêu tập luyện cá nhân.
-   📅 **Đặt Lịch Linh Hoạt:** Chủ động đặt lịch tập với PT hoặc chọn khung giờ tự tập phù hợp.
-   💳 **Thanh Toán Online:** Thanh toán gói tập tiện lợi qua **MoMo**, **VNPAY**, hoặc chuyển khoản ngân hàng và upload biên lai trực tiếp lên hệ thống.
-   🔔 **Nhắc Nhở & Thông Báo:** Không bao giờ bỏ lỡ buổi tập hay hạn gói tập với hệ thống thông báo tự động.
-   ⭐ **Đánh Giá & Phản Hồi:** Đánh giá chất lượng dịch vụ, PT và phòng gym để giúp cải thiện trải nghiệm chung.
-   📊 **Xem Tiến Độ Cá Nhân:** Theo dõi sự thay đổi của bản thân qua các biểu đồ tiến độ trực quan.

</details>

---

## Luồng Hoạt Động Người Dùng

1.  **Đăng ký:** Người dùng chọn vai trò (Quản lý, PT, Hội viên) và tạo tài khoản. Hội viên cần nhập các chỉ số sức khỏe cơ bản.
2.  **Chọn & Mua Gói Tập:** Hội viên xem các gói tập, chọn gói phù hợp và tiến hành thanh toán online.
3.  **Đặt Lịch:** Sau khi có gói tập, hội viên đặt lịch với PT hoặc khung giờ tự do.
4.  **Tập Luyện & Ghi Nhận:** PT hướng dẫn và cập nhật tiến độ sau mỗi buổi tập.
5.  **Tương Tác:** Hội viên và PT trao đổi qua chat. Hội viên có thể gửi phản hồi, đánh giá sau khi trải nghiệm.
6.  **Quản Lý & Theo Dõi:** Quản lý giám sát toàn bộ hoạt động, doanh thu và hiệu suất của phòng gym qua dashboard.

---

## Công Nghệ Sử Dụng (Tech Stack)

| Phần             | Công nghệ                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Frontend** | `ReactJS` / `Next.js` / `VueJS` - `TypeScript` - `TailwindCSS` / `Material-UI`                            |
| **Backend** | `Node.js` - `Express.js` / `NestJS`                                                                     |
| **Database** | `MongoDB` / `PostgreSQL`                                                                                |
| **Real-time** | `Firebase Realtime Database` / `Firestore` (cho tính năng Chat)                                         |
| **Thanh Toán** | Tích hợp API `MoMo`, `VNPAY`                                                                            |
| **Deployment** | `Vercel` (Frontend), `Heroku` / `AWS` / `DigitalOcean` (Backend)                                          |
| **CI/CD** | `GitHub Actions`                                                                                        |
| **State Mngmt** | `Redux Toolkit` / `Zustand` (cho React)                                                                 |

---

## Hướng Dẫn Cài Đặt

Để chạy dự án này trên máy cục bộ của bạn, hãy làm theo các bước sau:

**1. Yêu cầu hệ thống:**
* Node.js (phiên bản 18.x trở lên)
* npm / yarn / pnpm
* Git

**2. Clone repository:**
```bash
git clone [https://github.com/your-username/your-repo.git](https://github.com/your-username/your-repo.git)
cd your-repo
```

**3. 🧩 Cài đặt Dependencies**

### 📦 Đối với Backend (`gymcare`):

```bash
cd server
npm install
```

### 📦 Đối với Frontend (thư mục gymcare-app):

```bash
cd server
npm install
```

**4.⚙️ Cấu Hình Biến Môi Trường**
* Tạo file .env trong thư mục server từ file .env.example.
* Điền các thông tin cần thiết như DATABASE_URL, JWT_SECRET, FIREBASE_CONFIG, MOMO_API_KEY, etc.

```bash
# Ví dụ file .env trong server
DATABASE_URL="your_mongodb_connection_string"
PORT=8080
JWT_SECRET="your_super_secret_key"
```

## Cách sử dụng

**1. Chạy Backend Server:**

```bash
cd gymcare
python manage.py runserver 0.0.0.0:8000
```

Server sẽ chạy tại http://localhost:8080 (hoặc port bạn cấu hình trong .env).

**1. Chạy Frontend App:**

```bash
cd gymcare-app
npm run dev 
```

Ứng dụng sẽ mở tại http://localhost:3000.


## Tác Giả

- **[Nguyen Manh Cuong]** – Project Leader & Backend Developer & Frontend Developer – [GitHub Profile](https://github.com/catv2004)



