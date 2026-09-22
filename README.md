# 📚 Online Assignment Submission System

A full-featured academic web application designed for colleges and universities.

Developed by **Ishita Kulshreshth**

---

## 🌟 Key Features

### 👨‍🏫 Teacher Portal
- **Secure Authentication**: Pre-configured faculty login.
- **Assignment Management**: Publish, update, and delete assignments with title, subject, instructions, deadlines, and maximum score.
- **Submission Tracking**: Real-time counter of student submissions.
- **Review & Grading**: View uploaded student PDFs, award marks, and provide evaluation remarks.

### 👩‍🎓 Student Portal
- **Registration & Login**: Student self-registration with password validation.
- **Assignment Discovery**: Browse active assignments with live status badges (`Active`, `Submitted`, `Closed`).
- **PDF Upload**: Single-file submission panel with `.pdf` validation and 5 MB size limit.
- **Deadline Lock**: Automatically prevents late submissions once the due date passes.
- **Submissions History**: Track past submissions, review timestamps, scores, and instructor feedback.

---

## 🛠️ Tech Stack & Architectures

1. **Frontend / Standalone App (`/project`)**:
   - Pure HTML5, CSS3, JavaScript (ES6)
   - Bootstrap 5 + Bootstrap Icons
   - LocalStorage client-side persistence
   - Built-in zero-dependency Java server (`Server.java`)
   - **Vercel Deploy Ready**

2. **Advanced Java Enterprise Application (`/src`)**:
   - **MVC Architecture with DAO Pattern**
   - Java Servlets (`javax.servlet`)
   - JavaServer Pages (JSP) with JSTL and Expression Language (EL)
   - JDBC with MySQL Database (`assignment_db`)
   - SHA-256 password hashing
   - Role-based `AuthFilter` security

---

## 🚀 Quick Start (Local Run)

```powershell
cd project
java Server.java
```
Open in browser: `http://localhost:8080`
