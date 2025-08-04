import { useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompleteRegistration from "../../frontend/src/pages/CompleteRegistration";
import UniversityEmailCheck from "../../frontend/src/pages/UniversityEmailCheck";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import WeeklyProgress from "./components/WeeklyProgress";
import AppContextProvider, { AppContext } from "./context/AppContext";
import { DashboardProvider } from "./context/DashboardContext"; // Importez DashboardProvider
import { StudentProvider } from "./context/StudentContext";
import DefenseRequest from "./pages/defenseRequest";
import DefenseTracking from "./pages/DefenseTracking";
import FailPage from "./pages/FailPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Login2 from "./pages/Login2";
import LoginCompany from "./pages/LoginCompany";
import ManageReports from "./pages/ManageReports";
import MyProfile from "./pages/MyProfile";
import Offers from "./pages/Offers";
import PfeStatus from "./pages/PfeStatus";
import PfeSubmissionPage from "./pages/PfeSubmissionPage";
import ProfessorForm from "./pages/ProfessorForm";
import ReportSubmission from "./pages/ReportSubmission";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import SignupStudent from "./pages/SignupStudent";
import SuccessPage from "./pages/SuccessPage";
import UniversityRegistrationForm from "./pages/UniversityRegistrationForm";
import VerifyEmail from "./pages/VerifyEmail";

import "react-toastify/dist/ReactToastify.css";
import NotificationBell from "./components/notifications/NotificationBell";
import CompanyRegistrationForm from "./pages/CompanyRegistrationForm";
import CompleteRegistrationCompany from "./pages/CompleteRegistrationCompany";
import StudentDashboard from "./pages/dashboard";
import RecruiterSignup from "./pages/RecruiterSignup";
import StudentEventDetails from "./pages/StudentEventDetails";
import SupervisorSignup from "./pages/SupervisorSignup";
 
  import NotificationsPage from "./components/NotificationsPage";
import PublicOffersPage from "./pages/PublicOffersPage";
import PublicTestPage from "./pages/PublicTestPage";

import SignIn from "./pages/SignIn";

import StudentProfile from "./pages/StudentProfile";

 


const App = () => {
  const context = useContext(AppContext);
  const [isCompanyAuthenticated, setIsCompanyAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkCompanyAuth = () => {
      const cToken = localStorage.getItem("cToken");
      const companyIdForDev = localStorage.getItem("companyIdForDev");
      setIsCompanyAuthenticated(cToken === "true" && !!companyIdForDev);
      setAuthLoading(false);
    };

    checkCompanyAuth();

    window.addEventListener("storage", checkCompanyAuth);
    return () => {
      window.removeEventListener("storage", checkCompanyAuth);
    };
  }, []);

  if (!context || authLoading) {
    return <div>Loading authentication...</div>;
  }

  const { token } = context;
  console.log("App.jsx - token (student):", token);
  console.log("App.jsx - isCompanyAuthenticated:", isCompanyAuthenticated);

  // 1. If student is authenticated
  if (token) {
    return (
      <div className="bg-[#F8F9FD]">
        <ToastContainer />
        <Navbar />
        <div className="flex items-start">
          <Sidebar />
          {/* StudentProvider doit encapsuler DashboardProvider */}
          <StudentProvider>
            {/* DashboardProvider doit encapsuler les routes qui utilisent DashboardContext */}
            <DashboardProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/student-dashboard" />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route
                  path="/report-submission"
                  element={<ReportSubmission studentId={context?.user?._id} />}
                />
                <Route path="/NotificationBell" element={<NotificationBell />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route
                  path="/weekly-progress"
                  element={<WeeklyProgress studentId={context?.user?._id} />}
                />
                <Route path="/defense-request" element={<DefenseRequest />} />
                <Route path="/defense-tracking" element={<DefenseTracking />} />
                <Route path="/pfe-submission" element={<PfeSubmissionPage />} />
                <Route path="/status" element={<PfeStatus />} />
                <Route path="/manage-reports" element={<ManageReports />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/student-profile" element={<StudentProfile />} />

                {/* Redirect if student tries to access company routes */}
                <Route path="/company/*" element={<Navigate to="/student-dashboard" />} />
                <Route path="/student/events/:id" element={<StudentEventDetails />} />

              </Routes>
            </DashboardProvider>
          </StudentProvider>
        </div>
      </div>
    );
  }

  // 3. If no user is authenticated (public routes)
  else {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/university-registration-form" element={<UniversityRegistrationForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/login-professional" element={<Login2 />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/fail" element={<FailPage />} />
          <Route path="/complete-registration" element={<CompleteRegistration />} />
          <Route path="/university-email-check" element={<UniversityEmailCheck />} />
          <Route path="/professor-registration/:professorId" element={<ProfessorForm />} />


          <Route path="/student-dashboard" element={<Navigate to="/login" />} />
          <Route path="/offers" element={<Navigate to="/login" />} />
          <Route path="/applications" element={<Navigate to="/login-professional" />} />
          <Route path="/company/applications" element={<Navigate to="/login-professional" />} />
          <Route path="/recruiter-signup" element={<RecruiterSignup />} />
          <Route path="/supervisor-signup" element={<SupervisorSignup />} />
          <Route path="/company-registration-form" element={<CompanyRegistrationForm />} />
          <Route path="/complete-registration" element={<CompleteRegistration />} />
          <Route path="/university-email-check" element={<UniversityEmailCheck />} />
          <Route path="/complete-registration-company/:companyId" element={<CompleteRegistrationCompany />} />
          <Route path="/login-company" element={<LoginCompany />} />
          <Route path="/signup-student" element={<SignupStudent />} />
          <Route path="/PublicOffersPage" element={< PublicOffersPage/>} />
           
<Route path="/publictest/:uuid" element={<PublicTestPage />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </>
    );
  }
};

const AppWrapper = () => (
  <AppContextProvider>
    <App />
  </AppContextProvider>
);

export default AppWrapper;
