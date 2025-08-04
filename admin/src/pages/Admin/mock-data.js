// Mock data for professors (supervisors)
export const professors = [
  {
    id: "prof1",
    name: "Dr. Sarah Johnson",
    specialities: ["AI", "Machine Learning"],
    department: "Computer Science",
    assignedProjects: 3,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "prof2",
    name: "Dr. Michael Chen",
    specialities: ["Web Development", "Cloud Computing"],
    department: "Information Systems",
    assignedProjects: 2,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "prof3",
    name: "Dr. Ahmed Hassan",
    specialities: ["Cybersecurity", "Blockchain"],
    department: "Computer Science",
    assignedProjects: 4,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "prof4",
    name: "Dr. Emily Rodriguez",
    specialities: ["Data Science", "Big Data"],
    department: "Data Analytics",
    assignedProjects: 1,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "prof5",
    name: "Dr. James Wilson",
    specialities: ["IoT", "Mobile Development"],
    department: "Electrical Engineering",
    assignedProjects: 2,
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

// Mock data for students
export const students = [
  {
    id: "stud1",
    name: "Mohammed Alami",
    program: "Computer Science",
    year: "Final Year",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "stud2",
    name: "Fatima Zahra",
    program: "Information Systems",
    year: "Final Year",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "stud3",
    name: "Omar Benali",
    program: "Computer Engineering",
    year: "Final Year",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "stud4",
    name: "Leila Mansouri",
    program: "Data Science",
    year: "Final Year",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "stud5",
    name: "Karim Tazi",
    program: "Software Engineering",
    year: "Final Year",
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

// Mock data for projects
export const mockProjects = [
  {
    id: "proj1",
    title: "AI-Based Recommendation System",
    description:
      "Developing a machine learning recommendation system that analyzes user behavior to provide personalized product suggestions for e-commerce platforms.",
    technologies: ["Python", "TensorFlow", "React"],
    company: "TechSolutions Inc.",
    proposedBy: "stud1",
    supervisor: null,
    status: "pending",
    speciality: ["AI", "Machine Learning"],
    createdAt: "2023-04-10T09:45:00",
  },
  {
    id: "proj2",
    title: "Blockchain for Supply Chain Management",
    description:
      "Creating a blockchain-based solution to enhance transparency and traceability in supply chain operations.",
    technologies: ["Solidity", "Ethereum", "Node.js"],
    company: "LogiChain",
    proposedBy: "stud2",
    supervisor: "prof3",
    status: "approved",
    speciality: ["Blockchain"],
    createdAt: "2023-04-05T14:30:00",
  },
  {
    id: "proj3",
    title: "Smart City IoT Platform",
    description:
      "Building an IoT platform for smart city applications including traffic management, waste management, and energy optimization.",
    technologies: ["Arduino", "MQTT", "React", "Node.js"],
    company: "CityTech Solutions",
    proposedBy: "stud3",
    supervisor: "prof5",
    status: "assigned",
    speciality: ["IoT", "Cloud Computing"],
    createdAt: "2023-04-02T16:20:00",
  },
  {
    id: "proj4",
    title: "Cybersecurity Threat Detection System",
    description:
      "Developing an advanced threat detection system using machine learning to identify and mitigate cybersecurity threats in real-time.",
    technologies: ["Python", "TensorFlow", "Elasticsearch"],
    company: "SecureNet",
    proposedBy: "stud4",
    supervisor: null,
    status: "pending",
    speciality: ["Cybersecurity", "Machine Learning"],
    createdAt: "2023-03-28T11:15:00",
  },
  {
    id: "proj5",
    title: "E-Learning Platform with Analytics",
    description:
      "Creating a comprehensive e-learning platform with advanced analytics to track student progress and personalize learning experiences.",
    technologies: ["React", "Node.js", "MongoDB", "D3.js"],
    company: "EduTech",
    proposedBy: "stud5",
    supervisor: "prof2",
    status: "rejected",
    speciality: ["Web Development", "Data Science"],
    createdAt: "2023-03-25T10:00:00",
  },
  {
    id: "proj6",
    title: "Big Data Analytics for Healthcare",
    description:
      "Implementing big data analytics solutions to improve healthcare outcomes, patient care, and operational efficiency.",
    technologies: ["Hadoop", "Spark", "Python", "Tableau"],
    company: "HealthAnalytics",
    proposedBy: "stud1",
    supervisor: "prof4",
    status: "confirmed",
    speciality: ["Big Data", "Data Science"],
    createdAt: "2023-03-20T09:30:00",
  },
  {
    id: "proj7",
    title: "Mobile App for Mental Health",
    description:
      "Developing a mobile application to support mental health through mood tracking, guided meditation, and connecting users with professionals.",
    technologies: ["React Native", "Firebase", "Node.js"],
    company: "MindWell",
    proposedBy: "stud2",
    supervisor: null,
    status: "pending",
    speciality: ["Mobile Development"],
    createdAt: "2023-03-15T14:00:00",
  },
]

// Helper functions
export const getStudentName = (studentId) => {
  const student = students.find((s) => s.id === studentId)
  return student ? student.name : "Unknown Student"
}

export const getStudent = (studentId) => {
  return (
    students.find((s) => s.id === studentId) || {
      name: "Unknown Student",
      program: "Unknown",
      year: "Unknown",
      avatar: "/placeholder.svg?height=80&width=80",
    }
  )
}

export const getProfessorName = (professorId) => {
  const professor = professors.find((p) => p.id === professorId)
  return professor ? professor.name : "Not Assigned"
}

export const getProfessor = (professorId) => {
  return professors.find((p) => p.id === professorId) || null
}

// Format date
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Format date with time
export const formatDateTime = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
  return new Date(dateString).toLocaleString(undefined, options)
}

