import { useContext, useEffect } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";

const ProfessorsList = () => {
  // Ajoutez 'isAuthenticated' à la déstructuration du contexte
  const { Professors, aToken, getAllProfessors, changeAvailability, isAuthenticated } =
    useContext(AdminContext);

  useEffect(() => {
    // Utilisez isAuthenticated() pour vérifier si un utilisateur (admin ou université) est connecté
    if (isAuthenticated()) {
      getAllProfessors();
    } else {
      alert("You must login before!"); // Message plus générique
    }
  }, [isAuthenticated, getAllProfessors]); // Mettez à jour les dépendances du useEffect

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium ">All Professors</h1>
      <div className=" w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {Professors.map((item, index) => (
          <div
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={index}
          >
            <img
              className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
              src="/assets/professor.jpg"
              alt=""
            />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">
                {item.name}
              </p>
              <p>{item.speciality}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input
                  onChange={() => changeAvailability(item._id)}
                  className="text-zinc-600 text-sm"
                  type="checkbox"
                  checked={item.available}
                />
                <p>Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorsList;
