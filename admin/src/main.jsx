import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AdminContextProvider from './context/AdminContext.jsx'
import AppContextProvider from './context/AppContext.jsx'
import CompanyContextProvider from './context/CompanyContext.jsx'; // Add this import
import ExternalSupervisorContextProvider from './context/ExternalSupervisorContext'
import GlobalAdminContextProvider from './context/GlobalAdminContext.jsx'
import ProfessorContextProvider from './context/ProfessorContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <ExternalSupervisorContextProvider> 
    <GlobalAdminContextProvider> 
      <AdminContextProvider>
        <ProfessorContextProvider>
          <CompanyContextProvider> {/* Add this provider */}
            <AppContextProvider>
              <App />
            </AppContextProvider>  
          </CompanyContextProvider>
        </ProfessorContextProvider>
      </AdminContextProvider>  
    </GlobalAdminContextProvider>
    </ExternalSupervisorContextProvider>
  </BrowserRouter>
)