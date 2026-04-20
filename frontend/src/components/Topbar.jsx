import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

toast.success("Task created!");
toast.error("Error occurred");

const Topbar = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
        {user.role.name}
      </span>
    </div>
  );
};

export default Topbar;
