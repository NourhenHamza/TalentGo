import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currency = 'DT';

    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    const months = ["", "jan", "feb", "mar", "avr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
    }
    
    // Format date for display (e.g., "15 May 2023")
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getDate()} ${months[date.getMonth() + 1]} ${date.getFullYear()}`;
    }

    // Format date for input fields (YYYY-MM-DD)
    const formatInputDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const value = {
        calculateAge,
        slotDateFormat,
        formatDisplayDate,
        formatInputDate,
        currency
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider;