import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const ProfessorContext = createContext();

export const useProfessorContext = () => useContext(ProfessorContext);

const ProfessorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  // Log initial dToken state
  useEffect(() => {
    console.log("ProfessorContext: Initial dToken state: ", dToken);
  }, [dToken]);

  const getDashData = async () => {
    console.log("ProfessorContext: Attempting to fetch dashboard data...");
    console.log("ProfessorContext: backendUrl for dashboard: ", backendUrl);
    console.log("ProfessorContext: dToken for dashboard request: ", dToken);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/Professor/dashboard`,
        {
          headers: { dToken },
        }
      );
      console.log("ProfessorContext: Dashboard data response received: ", data);
      if (data.success) {
        setDashData(data.dashData);
        console.log("ProfessorContext: Dashboard data set: ", data.dashData);
      } else {
        console.error("ProfessorContext: Failed to fetch dashboard data: ", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("ProfessorContext: Error fetching dashboard data: ", error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    console.log("ProfessorContext: Attempting to fetch profile data...");
    console.log("ProfessorContext: backendUrl for profile: ", backendUrl);
    console.log("ProfessorContext: dToken for profile request: ", dToken);
    try {
      const { data } = await axios.get(`${backendUrl}/api/Professor/profile`, {
        headers: { dToken },
      });
      console.log("ProfessorContext: Profile data response received: ", data);
      if (data.success) {
        setProfileData(data.profileData);
        console.log("ProfessorContext: Profile data set: ", data.profileData);
      } else {
        console.error("ProfessorContext: Failed to fetch profile data: ", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("ProfessorContext: Error fetching profile data: ", error);
      toast.error(error.message);
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,

    setDashData,
    dashData,
    getDashData,
    profileData,
    getProfileData,
    setProfileData,
  };

  return (
    <ProfessorContext.Provider value={value}>
      {props.children}
    </ProfessorContext.Provider>
  );
};

export default ProfessorContextProvider;

