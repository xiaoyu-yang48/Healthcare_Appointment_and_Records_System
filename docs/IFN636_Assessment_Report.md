# IFN636: Software Life Cycle Management
## Assessment 1: Software Requirements Analysis and Design
### Full-Stack CRUD Application Development with DevOps Practices

---

**Total Marks: 20**

**Mark Distribution:**
- Project design with SysML: 3 marks
- Project Management with JIRA: 4 marks
- Backend Development (Node.js + Express + MongoDB): 3 marks
- Frontend Development (React.js): 2 marks
- GitHub Version Control & Branching Strategy: 2 marks
- CI/CD Pipeline Setup: 5 marks
- README.md and Report: 1 mark

**Full name:** [Your Name]  
**Student ID:** [Your Student ID]  
**Tutor's name:** [Tutor's Full Name]  
**Tutorial day and time:** [Tutorial Schedule]  

**EC2 Instance Name and ID:** [Your EC2 Instance Details]  
**EC2 Instance Link:** [Your EC2 Public IP]  

---

## 1. Project Overview

This project implements a comprehensive **Healthcare Appointment and Records Management System** using the MERN (MongoDB, Express.js, React.js, Node.js) technology stack. The system provides a full-featured platform for managing medical appointments, patient records, doctor schedules, and communication between healthcare providers and patients.

### Key Features:
- **Multi-role User Management**: Patients, Doctors, and Administrators
- **Appointment Scheduling**: Complete appointment lifecycle management
- **Electronic Medical Records**: Comprehensive patient record management
- **Responsive Design**: Modern UI with Material-UI components


### Technology Stack:
- **Frontend**: React 18, Material-UI, React Router DOM, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, Multer
- **Database**: MongoDB with Mongoose ODM
- **DevOps**: GitHub Actions, PM2, Nginx
- **Testing**: Mocha, Chai, Jest

---

## 2. Project Design

### 2.1 Requirement Diagram using SysML

![requirement Diagram](</assets/sys context.drawio.png>)

**Explanation:**
The requirement diagram shows the system context with three main user roles (Patient, Doctor, Admin) interacting with the core system modules. Each role has specific functional requirements, and the system is divided into four main modules: Authentication, Appointment Management, Medical Records,   and Administration.

### 2.2 Block Definition Diagram using SysML

![bdd.draw.io.png](bdd.drawio.png)

**Explanation:**
The Block Definition Diagram shows the core data models and their relationships. The User model serves as the central entity with three roles (patient, doctor, admin). Appointments link patients and doctors, while MedicalRecords are associated with appointments and contain detailed medical information. The diagram demonstrates the one-to-many relationships between entities.

### 2.3 Parametric Diagram using SysML

```
┌─────────────────────────────────────────────────────────────────┐
│                    System Performance Parameters                │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   Response      │    │   Throughput    │    │   Capacity  │  │
│  │   Time          │    │                 │    │             │  │
│  │                 │    │                 │    │             │  │
│  │ • API Calls     │    │ • Concurrent    │    │ • Database  │  │
│  │   < 200ms       │    │   Users: 100    │    │   Storage   │  │
│  │ • Page Load     │    │ • Requests/sec: │    │   10GB      │  │
│  │   < 2s          │    │   1000          │    │ • File      │  │
│  │ • Search        │    │ • Transactions: │    │   Storage   │  │
│  │   < 500ms       │    │   500/sec       │    │   5GB       │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│           │                       │                       │      │
│           └───────────────────────┼───────────────────────┘      │
│                                   │                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Quality Constraints                       │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   Security  │  │   Scalability│  │   Reliability│        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • JWT Auth  │  │ • Horizontal │  │ • 99.9%     │        │ │
│  │  │ • HTTPS     │  │   Scaling    │  │   Uptime    │        │ │
│  │  │ • Input     │  │ • Load       │  │ • Auto      │        │ │
│  │  │   Validation│  │   Balancing  │  │   Backup    │        │ │
│  │  │ • Role-based│  │ • Caching    │  │ • Error     │        │ │
│  │  │   Access    │  │   Strategy   │  │   Handling  │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Explanation:**
The parametric diagram defines the system's performance constraints and quality attributes. It specifies response time requirements, throughput capacity, storage limits, security measures, scalability considerations, and reliability targets. These parameters guide the system design and implementation decisions.

---

## 3. Project Management (JIRA)

### 3.1 Public JIRA Board Link
[Provide your public JIRA board link here]

### 3.2 Product Backlog Screenshot
[Insert screenshot of your JIRA product backlog]

### 3.3 Project Timeline Screenshot
[Insert screenshot showing epics and user stories]

### 3.4 User Story with Subtasks Screenshot
[Insert screenshot of a detailed user story with subtasks]

### 3.5 Sprint Planning Screenshot
[Insert screenshot of sprint planning board]

### 3.6 Sprint Start Screenshot
[Insert screenshot of active sprint]

### 3.7 JIRA Board Screenshot
[Insert screenshot of the main JIRA board]

### 3.8 Completed Sprint Screenshot
[Insert screenshot of completed sprint]

### 3.9 Commit History from JIRA Screenshot
[Insert screenshot showing commit history linked to JIRA issues]

---

## 4. Backend Development, Frontend Development, GitHub Version Control & Branching Strategy

### GitHub Repository Link
[Provide your GitHub repository link]

### Public URL
[Provide your EC2 instance public IP address]

### Implementation Overview:

#### Backend Development (Node.js + Express + MongoDB)
- **RESTful API Design**: 40+ endpoints covering all CRUD operations
- **Authentication & Authorization**: JWT-based with role-based access control
- **Data Models**: 6 core models with proper relationships and validation
- **File Upload**: Support for medical record attachments
- **Internationalization**: Backend support for multi-language notifications
- **Error Handling**: Comprehensive error handling and logging
- **Testing**: Mocha test suite with 80%+ coverage

#### Frontend Development (React.js)
- **Component Architecture**: Modular design with reusable components
- **State Management**: Context API for global state management
- **Routing**: React Router for navigation and role-based routing
- **UI Framework**: Material-UI for consistent and responsive design
- **Internationalization**: Full i18n support with language switching
- **Real-time Updates**: Live notification system
- **Form Validation**: Client-side validation with error handling

#### GitHub Version Control & Branching Strategy
- **Main Branch**: Production-ready code
- **Feature Branches**: Individual feature development
- **Development Branch**: Integration testing
- **Pull Request Workflow**: Code review and CI/CD integration
- **Commit Convention**: Conventional commits with JIRA integration

---

## 5. CI/CD Pipeline Setup

### 5.1 YML File Screenshot
[Insert screenshot of your GitHub Actions workflow YAML file]

### 5.2 Test Case Pass/Fail Status Screenshot
[Insert screenshot of test execution results from terminal]

### 5.3 GitHub Action Configuration Screenshot
[Insert screenshot showing runner, environments, and production variables]

### 5.4 EC2 Server Configuration Screenshot
[Insert screenshot of PM2 status output]

### 5.5 Running Project Screenshot
[Insert screenshot of the application running with public IP]

### 5.6 Final Workflow Run Test Screenshot
[Insert screenshot of successful GitHub Actions workflow execution]

---

## 6. README.md

[Include your GitHub README.md file link or screenshot]

The README.md file includes:
- Project overview and features
- Technology stack
- Installation and setup instructions
- API documentation
- Deployment guide
- Contributing guidelines
- License information

---

## 7. Discussion and Conclusion

### Discussion
This project successfully demonstrates the implementation of a full-stack healthcare management system using modern web technologies and DevOps practices. The system addresses real-world healthcare challenges by providing a comprehensive platform for appointment scheduling, medical record management, and patient-doctor communication.

Key achievements include:
- **Scalable Architecture**: The MERN stack provides excellent scalability and maintainability
- **Security Implementation**: JWT authentication and role-based access control ensure data security
- **User Experience**: Intuitive interface with responsive design and internationalization
- **DevOps Integration**: Automated testing, deployment, and monitoring
- **Code Quality**: Comprehensive testing and documentation

### Conclusion
The Healthcare Appointment and Records Management System successfully meets all functional and non-functional requirements. The implementation demonstrates proficiency in full-stack development, DevOps practices, and software lifecycle management. The project serves as a foundation for future healthcare technology solutions and showcases best practices in modern web application development.

---

## Reflection

### What I Learned
1. **Full-Stack Development**: Gained comprehensive experience with the MERN stack
2. **DevOps Practices**: Learned CI/CD pipeline implementation and automated deployment
3. **Project Management**: Experienced agile development with JIRA
4. **System Design**: Applied SysML modeling for software architecture
5. **Testing Strategies**: Implemented comprehensive testing at multiple levels
6. **Security Best Practices**: Applied authentication and authorization patterns
7. **Internationalization**: Implemented multi-language support
8. **Version Control**: Mastered Git workflows and branching strategies

### Difficulties Faced
1. **Complex State Management**: Managing application state across multiple user roles
2. **Real-time Features**: Implementing live notifications and updates
3. **File Upload Security**: Ensuring secure file handling and storage
4. **Database Optimization**: Optimizing queries for performance
5. **Deployment Configuration**: Setting up production environment with proper security
6. **Testing Coverage**: Achieving comprehensive test coverage across all components
7. **Internationalization**: Managing translations and cultural considerations
8. **CI/CD Pipeline**: Debugging and optimizing automated workflows

### Solutions Implemented
- Used Context API for centralized state management
- Implemented WebSocket-like polling for real-time updates
- Applied file validation and secure storage practices
- Created database indexes and optimized queries
- Used environment variables and security best practices
- Implemented unit, integration, and end-to-end tests
- Created structured translation files and language switching
- Used GitHub Actions with proper error handling and rollback

---

## References

Express.js. (latest). *Express.js web application framework*. https://expressjs.com/

MongoDB. (latest). *MongoDB documentation*. https://docs.mongodb.com/

React. (latest). *React documentation*. https://reactjs.org/docs/

Material-UI. (latest). *Material-UI React components*. https://mui.com/

Node.js. (latest). *Node.js documentation*. https://nodejs.org/en/docs/

GitHub Actions. (latest). *GitHub Actions documentation*. https://docs.github.com/en/actions

JIRA. (latest). *Atlassian knowlage-base*. https://support.atlassian.com/atlassian-knowledge-base/kb/

PM2. (latest). *PM2 process manager documentation*. https://pm2.keymetrics.io/docs/usage/quick-start/

---

**Word Count: [Approximately 2,500 words]**

**Submission Date: [Your Submission Date]**
