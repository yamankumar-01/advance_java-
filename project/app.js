// ==========================================================
// Online Assignment Submission System - Frontend Logic
// Uses LocalStorage for full persistence (Zero server required)
// ==========================================================

// Initial Seed Data setup if first time running
(function initDatabase() {
    let users = JSON.parse(localStorage.getItem('users'));
    if (!users) {
        users = [
            {
                id: 1,
                name: 'Dr. Rajesh Sharma',
                email: 'teacher@college.edu',
                password: 'password123',
                role: 'TEACHER'
            },
            {
                id: 2,
                name: 'Ishita Kulshreshth',
                email: 'ishita@college.edu',
                password: 'password123',
                role: 'STUDENT'
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        // Auto-update if previous name was stored in browser cache
        users.forEach(u => {
            if (u.name === 'Ishita Patel') {
                u.name = 'Ishita Kulshreshth';
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (!localStorage.getItem('assignments')) {
        // Set dates: one active (due in 5 days), one expired (due yesterday)
        const now = new Date();
        const futureDate = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000));
        const pastDate = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));

        const initialAssignments = [
            {
                id: 1,
                title: 'Servlet Lifecycle & Session Tracking',
                subject: 'Advanced Java Programming',
                description: 'Explain the init(), service(), and destroy() methods in detail. Implement an example using HttpSession to count user visits and display personal greeting.',
                deadline: futureDate.toISOString().slice(0, 16),
                maxMarks: 100,
                createdBy: 1,
                teacherName: 'Dr. Rajesh Sharma'
            },
            {
                id: 2,
                title: 'JDBC Connection Pooling & PreparedStatement',
                subject: 'Database Management Systems',
                description: 'Write a comprehensive report on differences between Statement and PreparedStatement. Detail how Connection Pooling optimizes performance under high concurrent loads.',
                deadline: pastDate.toISOString().slice(0, 16),
                maxMarks: 50,
                createdBy: 1,
                teacherName: 'Dr. Rajesh Sharma'
            }
        ];
        localStorage.setItem('assignments', JSON.stringify(initialAssignments));
    }

    let submissions = JSON.parse(localStorage.getItem('submissions'));
    if (!submissions) {
        submissions = [
            {
                id: 1,
                assignmentId: 2,
                studentId: 2,
                studentName: 'Ishita Kulshreshth',
                studentEmail: 'ishita@college.edu',
                fileName: 'Ishita_Kulshreshth_DBMS_Assignment.pdf',
                submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleString(),
                marks: 46,
                feedback: 'Excellent explanation of PreparedStatements and connection pooling lifecycle!'
            }
        ];
        localStorage.setItem('submissions', JSON.stringify(submissions));
    } else {
        // Auto-update previous name in existing submission records
        submissions.forEach(s => {
            if (s.studentName === 'Ishita Patel') {
                s.studentName = 'Ishita Kulshreshth';
                s.fileName = s.fileName.replace('Ishita_Patel', 'Ishita_Kulshreshth');
            }
        });
        localStorage.setItem('submissions', JSON.stringify(submissions));
    }
})();

// Application State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
if (currentUser && currentUser.name === 'Ishita Patel') {
    currentUser.name = 'Ishita Kulshreshth';
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}
let activeAssignmentId = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const teacherDashboard = document.getElementById('teacher-dashboard');
const studentDashboard = document.getElementById('student-dashboard');
const userNav = document.getElementById('user-nav');
const authNav = document.getElementById('auth-nav');

// Alert Helper
function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('global-alert');
    alertBox.className = `alert alert-${type} alert-dismissible fade show`;
    alertBox.innerHTML = `
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertBox.classList.remove('d-none');
    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 4000);
}

// Format Deadline for Display
function formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Check if a deadline has expired
function isExpired(isoString) {
    if (!isoString) return false;
    return new Date().getTime() > new Date(isoString).getTime();
}

// ================= View Routing =================

function updateView() {
    authSection.classList.add('d-none');
    teacherDashboard.classList.add('d-none');
    studentDashboard.classList.add('d-none');

    if (!currentUser) {
        authSection.classList.remove('d-none');
        userNav.classList.add('d-none');
        authNav.classList.remove('d-none');
    } else {
        userNav.classList.remove('d-none');
        authNav.classList.add('d-none');
        document.getElementById('nav-user-name').textContent = currentUser.name;
        
        const roleBadge = document.getElementById('nav-user-role');
        roleBadge.textContent = currentUser.role;
        roleBadge.className = `badge ${currentUser.role === 'TEACHER' ? 'badge-teacher' : 'badge-student'} ms-1`;

        if (currentUser.role === 'TEACHER') {
            teacherDashboard.classList.remove('d-none');
            renderTeacherDashboard();
        } else {
            studentDashboard.classList.remove('d-none');
            renderStudentDashboard();
        }
    }
}

// ================= Authentication =================

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);

    if (found) {
        currentUser = found;
        localStorage.setItem('currentUser', JSON.stringify(found));
        showAlert(`Welcome back, ${found.name}!`, 'success');
        updateView();
    } else {
        showAlert('Invalid email or password. Please try again.', 'danger');
    }
}

function registerStudent(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (exists) {
        showAlert('This email is already registered. Please login.', 'danger');
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: 'STUDENT'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showAlert('Registration successful! You can now login.', 'success');
    // Switch to login tab
    const loginTabTrigger = document.querySelector('#login-tab');
    bootstrap.Tab.getInstance(loginTabTrigger)?.show() || new bootstrap.Tab(loginTabTrigger).show();
    document.getElementById('login-email').value = email;
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAlert('You have been logged out successfully.', 'info');
    updateView();
}

// Quick Demo Login
function quickLogin(role) {
    if (role === 'TEACHER') {
        loginUser('teacher@college.edu', 'password123');
    } else {
        loginUser('ishita@college.edu', 'password123');
    }
}

// ================= Teacher Dashboard =================

function renderTeacherDashboard() {
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const myAssignments = assignments.filter(a => a.createdBy === currentUser.id);

    // Update Stats
    document.getElementById('teacher-total-assignments').textContent = myAssignments.length;
    
    let totalSubs = 0;
    myAssignments.forEach(a => {
        totalSubs += submissions.filter(s => s.assignmentId === a.id).length;
    });
    document.getElementById('teacher-total-submissions').textContent = totalSubs;

    const activeCount = myAssignments.filter(a => !isExpired(a.deadline)).length;
    document.getElementById('teacher-active-assignments').textContent = activeCount;

    // Render Table
    const tbody = document.getElementById('teacher-assignments-table-body');
    if (myAssignments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No assignments created yet. Click "+ Create Assignment" to add one.</td></tr>`;
        return;
    }

    tbody.innerHTML = myAssignments.map((item, index) => {
        const subCount = submissions.filter(s => s.assignmentId === item.id).length;
        const expired = isExpired(item.deadline);

        return `
            <tr>
                <td class="text-muted">${index + 1}</td>
                <td>
                    <div class="fw-bold">${escapeHtml(item.title)}</div>
                    <small class="text-muted">${escapeHtml(item.subject)}</small>
                </td>
                <td>
                    <div>${formatDateTime(item.deadline)}</div>
                    <span class="badge ${expired ? 'bg-danger' : 'bg-success'}">${expired ? 'Closed' : 'Active'}</span>
                </td>
                <td class="text-center fw-bold">${item.maxMarks}</td>
                <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm" onclick="openSubmissionsModal(${item.id})">
                        <i class="bi bi-people-fill me-1"></i> ${subCount} Submissions
                    </button>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="openEditAssignmentModal(${item.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAssignment(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function saveAssignment(id, title, subject, deadline, maxMarks, description) {
    let assignments = JSON.parse(localStorage.getItem('assignments')) || [];

    if (id) {
        // Edit
        const index = assignments.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            assignments[index] = {
                ...assignments[index],
                title: title.trim(),
                subject: subject.trim(),
                deadline: deadline,
                maxMarks: parseInt(maxMarks),
                description: description.trim()
            };
            showAlert('Assignment updated successfully!', 'success');
        }
    } else {
        // New
        const newAssignment = {
            id: Date.now(),
            title: title.trim(),
            subject: subject.trim(),
            deadline: deadline,
            maxMarks: parseInt(maxMarks),
            description: description.trim(),
            createdBy: currentUser.id,
            teacherName: currentUser.name
        };
        assignments.unshift(newAssignment);
        showAlert('Assignment published successfully!', 'success');
    }

    localStorage.setItem('assignments', JSON.stringify(assignments));
    renderTeacherDashboard();
    
    // Close modal
    const modalEl = document.getElementById('assignmentModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();
}

function deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment? All submissions for it will also be deleted!')) {
        return;
    }

    let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    let submissions = JSON.parse(localStorage.getItem('submissions')) || [];

    assignments = assignments.filter(a => a.id !== id);
    submissions = submissions.filter(s => s.assignmentId !== id);

    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('submissions', JSON.stringify(submissions));

    showAlert('Assignment deleted.', 'success');
    renderTeacherDashboard();
}

function openEditAssignmentModal(id) {
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;

    document.getElementById('assignment-modal-title').textContent = 'Edit Assignment';
    document.getElementById('assignment-id').value = assignment.id;
    document.getElementById('assignment-title').value = assignment.title;
    document.getElementById('assignment-subject').value = assignment.subject;
    document.getElementById('assignment-deadline').value = assignment.deadline;
    document.getElementById('assignment-max-marks').value = assignment.maxMarks;
    document.getElementById('assignment-desc').value = assignment.description;

    const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
    modal.show();
}

function openCreateAssignmentModal() {
    document.getElementById('assignment-modal-title').textContent = 'Create New Assignment';
    document.getElementById('assignment-form').reset();
    document.getElementById('assignment-id').value = '';

    // Set default deadline to 7 days from now
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    document.getElementById('assignment-deadline').value = nextWeek.toISOString().slice(0, 16);

    const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
    modal.show();
}

// Submissions Review Modal for Teacher
function openSubmissionsModal(assignmentId) {
    activeAssignmentId = assignmentId;
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    document.getElementById('submissions-modal-assignment-title').textContent = assignment.title;
    document.getElementById('submissions-modal-assignment-max').textContent = assignment.maxMarks;

    const mySubmissions = submissions.filter(s => s.assignmentId === assignmentId);
    const container = document.getElementById('submissions-list-container');

    if (mySubmissions.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted">No students have submitted solutions yet.</div>`;
    } else {
        container.innerHTML = mySubmissions.map((sub, idx) => `
            <div class="card card-custom mb-3 p-3">
                <div class="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                        <h6 class="fw-bold mb-1">${escapeHtml(sub.studentName)}</h6>
                        <small class="text-muted">${escapeHtml(sub.studentEmail)} | Submitted: ${sub.submittedAt}</small>
                    </div>
                    <div>
                        <span class="badge bg-danger text-truncate d-inline-block p-2" style="max-width: 200px;">
                            <i class="bi bi-file-earmark-pdf-fill me-1"></i> ${escapeHtml(sub.fileName)}
                        </span>
                    </div>
                </div>

                <hr class="my-2">

                <!-- Grade Form -->
                <div class="row g-2 align-items-center mt-1">
                    <div class="col-sm-3">
                        <label class="form-label small mb-1 fw-bold">Marks (Max: ${assignment.maxMarks})</label>
                        <input type="number" id="grade-marks-${sub.id}" class="form-control form-control-sm" 
                               min="0" max="${assignment.maxMarks}" value="${sub.marks !== undefined && sub.marks !== null ? sub.marks : ''}" placeholder="Marks">
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label small mb-1 fw-bold">Teacher Feedback</label>
                        <input type="text" id="grade-feedback-${sub.id}" class="form-control form-control-sm" 
                               value="${sub.feedback ? escapeHtml(sub.feedback) : ''}" placeholder="Enter remarks...">
                    </div>
                    <div class="col-sm-3 text-end mt-sm-4">
                        <button class="btn btn-sm btn-primary w-100" onclick="saveGrade(${sub.id}, ${assignment.maxMarks})">
                            <i class="bi bi-check-lg me-1"></i> Save Grade
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const modal = new bootstrap.Modal(document.getElementById('submissionsModal'));
    modal.show();
}

function saveGrade(submissionId, maxMarks) {
    const marksInput = document.getElementById(`grade-marks-${submissionId}`).value;
    const feedbackInput = document.getElementById(`grade-feedback-${submissionId}`).value;

    if (marksInput === '' || isNaN(marksInput)) {
        showAlert('Please enter valid marks.', 'danger');
        return;
    }

    const marks = parseInt(marksInput);
    if (marks < 0 || marks > maxMarks) {
        showAlert(`Marks must be between 0 and ${maxMarks}.`, 'danger');
        return;
    }

    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
        submissions[index].marks = marks;
        submissions[index].feedback = feedbackInput.trim();
        localStorage.setItem('submissions', JSON.stringify(submissions));
        showAlert('Grade and remarks updated successfully!', 'success');
        openSubmissionsModal(activeAssignmentId);
    }
}

// ================= Student Dashboard =================

function renderStudentDashboard() {
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);

    // 1. Render Available Assignments Table
    const tbody = document.getElementById('student-assignments-table-body');
    if (assignments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No assignments available currently.</td></tr>`;
    } else {
        tbody.innerHTML = assignments.map((item, index) => {
            const mySub = mySubmissions.find(s => s.assignmentId === item.id);
            const expired = isExpired(item.deadline);

            let statusBadge = '';
            let actionBtn = '';

            if (mySub) {
                statusBadge = `<span class="badge bg-success"><i class="bi bi-check2 me-1"></i>Submitted</span>`;
                actionBtn = `<button class="btn btn-sm btn-outline-primary" onclick="openStudentViewModal(${item.id})">View Status</button>`;
            } else if (expired) {
                statusBadge = `<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Closed</span>`;
                actionBtn = `<button class="btn btn-sm btn-outline-secondary" onclick="openStudentViewModal(${item.id})">Details (Closed)</button>`;
            } else {
                statusBadge = `<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`;
                actionBtn = `<button class="btn btn-sm btn-success" onclick="openStudentViewModal(${item.id})">Submit Work</button>`;
            }

            return `
                <tr>
                    <td class="text-muted">${index + 1}</td>
                    <td>
                        <div class="fw-bold">${escapeHtml(item.title)}</div>
                        <small class="text-muted">${escapeHtml(item.subject)}</small>
                    </td>
                    <td>${escapeHtml(item.teacherName || 'Instructor')}</td>
                    <td>
                        <div>${formatDateTime(item.deadline)}</div>
                        ${expired && !mySub ? '<small class="text-danger fw-bold">Deadline Passed</small>' : ''}
                    </td>
                    <td class="text-center">${statusBadge}</td>
                    <td class="text-end">${actionBtn}</td>
                </tr>
            `;
        }).join('');
    }

    // 2. Render My Submissions Tab
    const historyTbody = document.getElementById('student-history-table-body');
    if (mySubmissions.length === 0) {
        historyTbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">You haven't submitted any assignments yet.</td></tr>`;
    } else {
        historyTbody.innerHTML = mySubmissions.map((sub, index) => {
            const assignment = assignments.find(a => a.id === sub.assignmentId) || {};
            const isGraded = sub.marks !== undefined && sub.marks !== null;

            return `
                <tr>
                    <td class="text-muted">${index + 1}</td>
                    <td>
                        <div class="fw-bold">${escapeHtml(assignment.title || 'Assignment')}</div>
                        <small class="text-muted">${escapeHtml(assignment.subject || '')}</small>
                    </td>
                    <td><small class="text-muted">${sub.submittedAt}</small></td>
                    <td>
                        <span class="badge bg-light text-danger border">
                            <i class="bi bi-file-earmark-pdf-fill me-1"></i> ${escapeHtml(sub.fileName)}
                        </span>
                    </td>
                    <td class="text-center">
                        ${isGraded ? `<span class="badge bg-success fs-6">${sub.marks} / ${assignment.maxMarks || 100}</span>` : '<span class="badge bg-warning text-dark">Under Review</span>'}
                    </td>
                    <td>
                        <small class="text-dark">${sub.feedback ? escapeHtml(sub.feedback) : '<em>Pending evaluation</em>'}</small>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Student View & Submit Modal
function openStudentViewModal(assignmentId) {
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const mySub = submissions.find(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);
    const expired = isExpired(assignment.deadline);

    document.getElementById('student-modal-title').textContent = assignment.title;
    document.getElementById('student-modal-subject').textContent = assignment.subject;
    document.getElementById('student-modal-teacher').textContent = assignment.teacherName || 'Instructor';
    document.getElementById('student-modal-deadline').textContent = formatDateTime(assignment.deadline);
    document.getElementById('student-modal-max-marks').textContent = assignment.maxMarks;
    document.getElementById('student-modal-desc').textContent = assignment.description;

    const uploadArea = document.getElementById('student-modal-upload-area');
    const submittedArea = document.getElementById('student-modal-submitted-area');
    const closedAlert = document.getElementById('student-modal-closed-alert');

    uploadArea.classList.add('d-none');
    submittedArea.classList.add('d-none');
    closedAlert.classList.add('d-none');

    if (mySub) {
        // Already submitted
        submittedArea.classList.remove('d-none');
        document.getElementById('submitted-time').textContent = mySub.submittedAt;
        document.getElementById('submitted-filename').textContent = mySub.fileName;

        const gradedBox = document.getElementById('submitted-grade-box');
        if (mySub.marks !== undefined && mySub.marks !== null) {
            gradedBox.innerHTML = `
                <div class="alert alert-info py-2">
                    <strong>Score:</strong> <span class="badge bg-success fs-6">${mySub.marks} / ${assignment.maxMarks}</span><br>
                    <strong>Teacher Feedback:</strong> ${mySub.feedback ? escapeHtml(mySub.feedback) : 'No remarks provided.'}
                </div>
            `;
        } else {
            gradedBox.innerHTML = `<div class="text-muted small"><i class="bi bi-hourglass-split me-1"></i>Evaluation pending by teacher.</div>`;
        }
    } else if (expired) {
        // Deadline passed
        closedAlert.classList.remove('d-none');
    } else {
        // Can submit
        uploadArea.classList.remove('d-none');
        document.getElementById('student-submit-assignment-id').value = assignment.id;
        document.getElementById('pdf-file-input').value = '';
    }

    const modal = new bootstrap.Modal(document.getElementById('studentViewModal'));
    modal.show();
}

function handleStudentSubmission(event) {
    event.preventDefault();

    const assignmentId = parseInt(document.getElementById('student-submit-assignment-id').value);
    const fileInput = document.getElementById('pdf-file-input');

    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert('Please select a PDF file to upload.', 'danger');
        return;
    }

    const file = fileInput.files[0];

    // 1. Validate PDF format
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showAlert('Only PDF files (.pdf) are permitted.', 'danger');
        return;
    }

    // 2. Validate File Size (Max 5 MB = 5 * 1024 * 1024 bytes)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        showAlert('File size exceeds 5 MB. Please compress your PDF.', 'danger');
        return;
    }

    // 3. Validate Deadline
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment && isExpired(assignment.deadline)) {
        showAlert('Deadline has passed! Submissions are closed.', 'danger');
        return;
    }

    // 4. Save Submission
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const newSubmission = {
        id: Date.now(),
        assignmentId: assignmentId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        fileName: file.name,
        submittedAt: new Date().toLocaleString(),
        marks: null,
        feedback: null
    };

    submissions.push(newSubmission);
    localStorage.setItem('submissions', JSON.stringify(submissions));

    showAlert('Assignment submitted successfully!', 'success');

    const modalEl = document.getElementById('studentViewModal');
    bootstrap.Modal.getInstance(modalEl)?.hide();

    renderStudentDashboard();
}

// Utility HTML escape
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ================= Event Listeners =================

document.addEventListener('DOMContentLoaded', () => {
    // Initial view rendering
    updateView();

    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        loginUser(email, password);
    });

    // Register Form Submit
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (password !== confirm) {
            showAlert('Passwords do not match.', 'danger');
            return;
        }
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters.', 'danger');
            return;
        }

        registerStudent(name, email, password);
    });

    // Teacher Save Assignment Form
    document.getElementById('assignment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('assignment-id').value;
        const title = document.getElementById('assignment-title').value;
        const subject = document.getElementById('assignment-subject').value;
        const deadline = document.getElementById('assignment-deadline').value;
        const maxMarks = document.getElementById('assignment-max-marks').value;
        const desc = document.getElementById('assignment-desc').value;

        saveAssignment(id, title, subject, deadline, maxMarks, desc);
    });

    // Student Submit Form
    document.getElementById('student-upload-form').addEventListener('submit', handleStudentSubmission);
});
