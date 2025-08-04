import { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdminContext } from './context/AdminContext';
import { CompanyContext } from './context/CompanyContext';
import { ExternalSupervisorContext } from './context/ExternalSupervisorContext';
import { GlobalAdminContext } from './context/GlobalAdminContext';
import { ProfessorContext } from './context/ProfessorContext';

// NOUVEAU: Import du contexte pour le tableau de bord administrateur global
import GlobalAdminDashboardContextProvider from './context/GlobalAdminDashboardContext';
 
import Navbar from './components/Navbar';
import NotificationsPage from './components/NotificationsPage';
import Sidebar from './components/Sidebar';
import CompanyPublicApplicationsPage from './pages/Company/CompanyPublicApplicationsPage';

import CompanyOffersManagementPage from './pages/Company/CompanyOffersManagementPage';
// Global Admin Pages
import AdminDashboard from './pages/GlobalAdmin/AdminDashboard';
import AdminLogin from './pages/GlobalAdmin/AdminLogin';
import ManageCompanies from './pages/GlobalAdmin/ManageCompanies';
import OurStudents from './pages/GlobalAdmin/OurStudents';

// Admin Pages
import AddProfessor from './pages/Admin/AddProfessor';
import CreateSession from './pages/Admin/CreateSession';
import Dashboard from './pages/Admin/Dashboard';
import DefenseRequestsList from './pages/Admin/DefenseRequestsList';
import UniversityEventsManagement from './pages/Admin/EventManagement';
import PlannedDefenses from './pages/Admin/PlannedDefenses';
import ProfessorsList from './pages/Admin/ProfessorsList';
import ProjectManagement from './pages/Admin/project-management';
import UniversityStudentList from './pages/Admin/UniversityStudentList';
import ValidateSubjects from './pages/Admin/ValidateSubjects';

// Professor Pages
import AssignedDefenses from './pages/Professor/AssignedDefenses';
import AssignmentsList from './pages/Professor/AssignmentsList';
import ProfessorAvailability from './pages/Professor/ProfessorAvailability';
import ProfessorDashboard from './pages/Professor/ProfessorDashboard';
import ProfessorPreferences from './pages/Professor/ProfessorPreferences';
import ProfessorProfile from './pages/Professor/ProfessorProfile';
import ProfessorReports from './pages/Professor/ProfessorReports';
import ReportManagment from './pages/Professor/ReportManagment';
import StudentProgressDashboard from './pages/Professor/StudentProgressDashboard';

// Company Pages
import CompanyApplicationsPage from './pages/Company/CompanyApplicationsPage';
import CompanyDashboard from './pages/Company/CompanyDashboard';
import CompanyEventDetails from './pages/Company/CompanyEventDetails';
import CompanyStudentList from './pages/Company/CompanyStudentList';
import ManageRecruiters from './pages/Company/ManageRecruiters';
import ManageSupervisors from './pages/Company/ManageSupervisors';
import OfferManagementForm from './pages/Company/OfferManagementForm';
import CompanyLogin from './pages/CompanyLogin';
import ConfirmedStudentsPage from './pages/Company/ConfirmedStudentsPage';

// External Supervisor Pages
import ExternalSupervisorDashboard from './pages/ExternalSupervisor/ExternalSupervisorDashboard';
import ExternalSupervisorLogin from './pages/ExternalSupervisorLogin';

// Common Pages
import Login from './pages/Login';
import PartnershipAcceptPage from './pages/PartnershipPage';
import Partnerships from './pages/Partnerships';
import ProfessorLogin from './pages/ProfessorLogin';


const App = () => {
  const { aToken } = useContext(AdminContext);
  const { bToken } = useContext(GlobalAdminContext);
  const { dToken } = useContext(ProfessorContext);
  const { cToken } = useContext(CompanyContext);
   const { eToken } = useContext(ExternalSupervisorContext);
    const { rToken } = useContext(ExternalSupervisorContext);

  if (aToken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <Routes>
            {/* Admin Routes */}
            <Route path='/' element={<Navigate to="/admin-dashboard" />} />
              
             <Route path="/university-student-list" element={<UniversityStudentList />} />
            <Route path="/notifications" element={<NotificationsPage />} />
             <Route path="/partnerships" element={<Partnerships />} />
            <Route path='/create-session' element={<CreateSession />} />
            <Route path='/defense-requests' element={<DefenseRequestsList />} />
            <Route path='/planned-defenses' element={<PlannedDefenses />} />
             <Route path="/partnerships/:id" element={<PartnershipAcceptPage />} />


            <Route path='/projects' element={<ProjectManagement />} />

            <Route path='/add-Professor' element={<AddProfessor />} />
            <Route path='/Professors-list' element={<ProfessorsList />} />
            <Route path='/validate-subjects' element={<ValidateSubjects />} />
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/events' element={<UniversityEventsManagement />} />

          </Routes>
        </div>
      </div>
    );
  }

  if (bToken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          {/* NOUVEAU: Encapsuler les routes Global Admin avec le contexte du tableau de bord */}
          <GlobalAdminDashboardContextProvider>
            <Routes>
              {/* Global Admin Routes - TOUTES CONSERVÉES */}
              <Route path='/' element={<Navigate to="/globaladmin-dashboard" />} />
               
              <Route path='/globaladmin-dashboard' element={<AdminDashboard />} />
               <Route path='/manage-universities' element={<ManageUniversities />} />
                <Route path='/manage-companies' element={<ManageCompanies />} />
               <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/students-list" element={<OurStudents />} />
               
              

            </Routes>
          </GlobalAdminDashboardContextProvider>
        </div>
      </div>
    );
  }

  if (dToken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <Routes>
            {/* Professor Routes */}

            <Route path='/' element={<Navigate to="/professor-dashboard" />} />
            <Route path='/assigned-defenses' element={<AssignedDefenses />} />
            <Route path='/professor-availability' element={<ProfessorAvailability />} />
            <Route path="/professor/reports" element={<ProfessorReports />} />
             <Route path='/report-managment' element={<ReportManagment />} />

          <Route path="/notifications" element={<NotificationsPage />} />
          
            <Route path='/Professor-dashboard' element={<ProfessorDashboard />} />
          
            <Route path='/Professor-profile' element={<ProfessorProfile />} />
            <Route path='/professor-preferences' element={<ProfessorPreferences />} />
            <Route path='/assignments-list' element={<AssignmentsList />} />
            <Route path='/show-progress' element={<StudentProgressDashboard />} />

          </Routes>
        </div>
      </div>
    );
  }
    if (cToken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <Routes>
            {/* Company Routes */}
            <Route path='/' element={<Navigate to="/company-dashboard" />} />
             <Route path='/company-login' element={<CompanyLogin />} />
               <Route path="/applications" element={<CompanyApplicationsPage />} />
          <Route path="/add-offer" element={<OfferManagementForm />} />
          <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/notifications" element={<NotificationsPage />} />
       <Route path="/CompanyPublicApplicationsPage" element={<CompanyPublicApplicationsPage />} />
       
       <Route path="/CompanyOffersManagementPage" element={<CompanyOffersManagementPage/>} />
      <Route path="/company-student-list" element={<CompanyStudentList />} />
       <Route path="/partnerships/:id" element={<PartnershipAcceptPage />} />       
      <Route path="/applications" element={<CompanyApplicationsPage />} />
            <Route path='/company-dashboard' element={<CompanyDashboard />} />
            <Route path='/manage-supervisors' element={<ManageSupervisors />} />
             <Route path='/manage-recruiters' element={<ManageRecruiters />} />
            <Route path="/add-offer" element={<OfferManagementForm />} />
            <Route path="/company/events/:id" element={<CompanyEventDetails />} />
            <Route path="/confirmed-students" element={<ConfirmedStudentsPage />} />
          </Routes>
        </div>
      </div>
    );
  }
   if (eToken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <Routes>
            <Route path='/' element={<Navigate to="/encadreurexterne-dashboard" />} />
            
            <Route path='/encadreurexterne-dashboard' element={<ExternalSupervisorDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />

          </Routes>
        </div>
      </div>
    );
  }
 if (rToken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <div className='flex items-start'>
          <Sidebar />
          <Routes>
            {/*  RECUITER  Routes */}
            <Route path='/' element={<Navigate to="/encadreurexterne-dashboard" />} />
              
             
            <Route path="/notifications" element={<NotificationsPage />} />
 
            <Route path='/encadreurexterne-dashboard' element={<ExternalSupervisorDashboard />} />
            

          </Routes>
        </div>
      </div>
    );
  }


  return (
    <>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/external-supervisor-login" element={<ExternalSupervisorLogin />} />
       
        <Route path="/login" element={<Login />} />
        <Route path="/company-login" element={<CompanyLogin />} />
        <Route path="/professor-login" element={<ProfessorLogin />} /> 
           
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;