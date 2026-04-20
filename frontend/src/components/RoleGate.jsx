import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

toast.success("Task created!");
toast.error("Error occurred");

const RoleGate = ({ roles, children }) => {
  const { user } = useAuth();

  if (!roles.includes(user.role.name)) return null;

  return children;
};

export default RoleGate;
