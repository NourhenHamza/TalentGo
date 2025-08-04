"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { CheckCircle, Clock, UserPlus, CheckSquare, XSquare, Tag } from "lucide-react"
import {
  CodeIcon,
  ServerIcon,
  TerminalIcon,
  BrainIcon,
  DatabaseIcon,
  HexagonIcon,
  WifiIcon,
  Search,
  BarChart,
  Zap,
  PieChart,
  Flame,
  Globe,
  Shield,
  Cloud,
  Link,
  Smartphone,
  GitBranch,
  Eye,
  MessageSquare,
  Sparkles,
  Cpu,
} from "lucide-react"

// Local implementation of the classNames utility function
export function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

// Custom card component with 3D effect (with reduced hover effect)
export const Card3D = ({ children, className, depth = 10 }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [depth, -depth])
  const rotateY = useTransform(x, [-100, 100], [-depth, depth])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = (mouseX / width - 0.5) * 2
    const yPct = (mouseY / height - 0.5) * 2
    x.set(xPct * 100)
    y.set(yPct * 100)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={classNames("relative transform-gpu", className)}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.01 }} // Reduced scale effect
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

// Shimmer effect component
export const Shimmer = ({ children, className }) => {
  return (
    <div className={classNames("relative overflow-hidden", className)}>
      {children}
      <motion.div
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
        style={{ width: "200%" }}
      />
    </div>
  )
}

// Get status badge
export const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-medium rounded-full flex items-center shadow-sm">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      )
    case "approved":
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full flex items-center shadow-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </span>
      )
    case "assigned":
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-full flex items-center shadow-sm">
          <UserPlus className="h-3 w-3 mr-1" />
          Assigned
        </span>
      )
    case "confirmed":
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-medium rounded-full flex items-center shadow-sm">
          <CheckSquare className="h-3 w-3 mr-1" />
          Confirmed
        </span>
      )
    case "rejected":
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-full flex items-center shadow-sm">
          <XSquare className="h-3 w-3 mr-1" />
          Rejected
        </span>
      )
    default:
      return null
  }
}

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "from-yellow-500 to-amber-500"
    case "approved":
      return "from-green-500 to-emerald-500"
    case "assigned":
      return "from-blue-500 to-indigo-500"
    case "confirmed":
      return "from-purple-500 to-violet-500"
    case "rejected":
      return "from-red-500 to-rose-500"
    default:
      return "from-gray-500 to-gray-600"
  }
}

// Tech icon mapping
export const getTechIcon = (tech) => {
  const techMap = {
    React: <CodeIcon className="h-3 w-3" />,
    "Node.js": <ServerIcon className="h-3 w-3" />,
    Python: <TerminalIcon className="h-3 w-3" />,
    TensorFlow: <BrainIcon className="h-3 w-3" />,
    MongoDB: <DatabaseIcon className="h-3 w-3" />,
    Ethereum: <HexagonIcon className="h-3 w-3" />,
    Solidity: <CodeIcon className="h-3 w-3" />,
    Arduino: <Cpu className="h-3 w-3" />,
    MQTT: <WifiIcon className="h-3 w-3" />,
    Elasticsearch: <Search className="h-3 w-3" />,
    "D3.js": <BarChart className="h-3 w-3" />,
    Hadoop: <DatabaseIcon className="h-3 w-3" />,
    Spark: <Zap className="h-3 w-3" />,
    Tableau: <PieChart className="h-3 w-3" />,
    Firebase: <Flame className="h-3 w-3" />,
  }

  return techMap[tech] || <CodeIcon className="h-3 w-3" />
}

// Speciality icon mapping
export const getSpecialityIcon = (speciality) => {
  const specialityMap = {
    AI: <BrainIcon className="h-3 w-3" />,
    "Machine Learning": <Sparkles className="h-3 w-3" />,
    "Web Development": <Globe className="h-3 w-3" />,
    Cybersecurity: <Shield className="h-3 w-3" />,
    "Data Science": <DatabaseIcon className="h-3 w-3" />,
    "Cloud Computing": <Cloud className="h-3 w-3" />,
    IoT: <Cpu className="h-3 w-3" />,
    Blockchain: <Link className="h-3 w-3" />,
    "Mobile Development": <Smartphone className="h-3 w-3" />,
    DevOps: <GitBranch className="h-3 w-3" />,
    "Big Data": <BarChart className="h-3 w-3" />,
    "Computer Vision": <Eye className="h-3 w-3" />,
    NLP: <MessageSquare className="h-3 w-3" />,
  }

  return specialityMap[speciality] || <Tag className="h-3 w-3" />
}