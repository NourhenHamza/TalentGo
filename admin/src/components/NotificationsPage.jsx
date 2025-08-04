"use client";

import { useContext } from 'react';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { CompanyContext } from '../context/CompanyContext';
import { ExternalSupervisorContext } from '../context/ExternalSupervisorContext';
import { GlobalAdminContext } from '../context/GlobalAdminContext';
import { ProfessorContext } from '../context/ProfessorContext';
import NotificationList from './notifications/NotificationList';

const NotificationsPage = () => {
  const { aToken, uToken } = useContext(AdminContext);
  const { cToken } = useContext(CompanyContext);
  const { dToken } = useContext(ProfessorContext);
  const { bToken } = useContext(GlobalAdminContext);
  const { eToken, rToken } = useContext(ExternalSupervisorContext);

  const hasToken = aToken || uToken || bToken || cToken || dToken || eToken || rToken;

  if (!hasToken) {
    return (
      <div className="page-container">
        <div className="circles-container">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="circle"
              style={{
                width: `${50 + i * 20}px`,
                height: `${50 + i * 20}px`,
                top: `${10 + i * 15}%`,
                left: i % 2 === 0 ? `${5 + i * 10}%` : `${80 - i * 10}%`,
                animation: `float-${i + 1} ${8 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="content-container">
          <div className="auth-card">
            <div className="card-header">
              <h2 className="header-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Unauthorized Access
              </h2>
            </div>
            <div className="card-body">
              <p className="card-text">Please log in to view your notifications.</p>
              <button 
                className="login-button"
                onClick={() => toast.info("Redirecting to login page")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Login
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .page-container {
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
          }

          .circles-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }

          .circle {
            position: absolute;
            opacity: 0.2;
            border-radius: 50%;
            background: #3b82f6;
          }

          .content-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
            padding: 1rem;
            box-sizing: border-box;
            z-index: 1;
          }

          .auth-card {
            max-width: 28rem; /* Equivalent to Tailwind's max-w-md */
            width: 100%;
            background: white;
            border: 1px solid #dbeafe;
            border-radius: 1.5rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            animation: fadeIn 0.8s ease-out;
          }

          .card-header {
            background: linear-gradient(to right, #1d4ed8, #3b82f6);
            padding: 1rem 1.5rem;
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
          }

          .header-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            font-size: 1.5rem;
            font-weight: 600;
            color: white;
          }

          .header-icon {
            width: 1.5rem;
            height: 1.5rem;
          }

          .card-body {
            padding: 1.5rem;
            text-align: center;
          }

          .card-text {
            color: #4b5563;
            margin-bottom: 1.5rem;
          }

          .login-button {
            background: linear-gradient(to right, #2563eb, #3b82f6);
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 0.5rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }

          .login-button:hover {
            background: linear-gradient(to right, #1e40af, #2563eb);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }

          .button-icon {
            width: 1.25rem;
            height: 1.25rem;
          }

          @keyframes float-1 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-5deg); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(3deg); }
          }
          @keyframes float-4 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(-3deg); }
          }
          @keyframes float-5 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes float-6 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-5deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="circles-container">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="circle"
            style={{
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? `${5 + i * 10}%` : `${80 - i * 10}%`,
              animation: `float-${i + 1} ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="content-container">
        <div className="notification-card">
          <div className="text-center mb-8">
            <h1 className="title">
              My <span className="title-highlight">Notifications</span>
            </h1>
            <div className="title-underline"></div>
            <p className="subtitle">Manage all your notifications in one place</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="header-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" className="header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="header-title">Notification List</h2>
            </div>

            <div className="card-body">
              <NotificationList
                className="w-full"
                showFilters={true}
                showSearch={true}
                showBulkActions={true}
                pageSize={10}
                availableFilters={['status', 'type', 'date']}
                filterPosition="top"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
        }

        .circles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .circle {
          position: absolute;
          opacity: 0.2;
          border-radius: 50%;
          background: #3b82f6;
        }

        .content-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
          padding: 1rem;
          box-sizing: border-box;
          z-index: 1;
        }

        .notification-card {
          max-width: 72rem; /* Equivalent to Tailwind's max-w-6xl */
          width: 100%;
          animation: fadeIn 0.8s ease-out;
        }

        .title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1e3a8a;
          margin-bottom: 0.75rem;
        }

        .title-highlight {
          color: #3b82f6;
        }

        .title-underline {
          width: 0;
          height: 0.375rem;
          background: #3b82f6;
          margin: 1.25rem auto;
          border-radius: 9999px;
          animation: widthExpand 1s ease-out 0.5s forwards;
        }

        .subtitle {
          color: #4b5563;
          max-width: 32rem;
          margin: 0 auto;
        }

        .card {
          background: white;
          border: 1px solid #dbeafe;
          border-radius: 1.5rem;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          background: linear-gradient(to right, #1d4ed8, #3b82f6);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }

        .header-icon-container {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }

        .header-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes widthExpand {
          from { width: 0; }
          to { width: 8rem; }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;