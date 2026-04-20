import { Link } from "react-router-dom";
import RoleGate from "./RoleGate";
import { toast } from "react-toastify";

toast.success("Task created!");
toast.error("Error occurred");

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg p-5">
      <h2 className="text-xl font-bold mb-6">Task Manager</h2>

      <Link to="/dashboard" className="block mb-3">Dashboard</Link>
      <Link to="/tasks" className="block mb-3">Tasks</Link>

      <RoleGate roles={["admin"]}>
        <Link to="/admin" className="block mb-3 text-red-600">
          Admin Panel
        </Link>
      </RoleGate>
    </div>
  );
};

export default Sidebar;
