import Role from "../models/Role.js";

export const seedRoles = async () => {
  const roles = [
    {
      name: "admin",
      permissions: ["view_users", "delete_user", "create_task", "delete_task"]
    },
    {
      name: "manager",
      permissions: ["create_task", "delete_task"]
    },
    {
      name: "user",
      permissions: ["create_task"]
    }
  ];

  for (let role of roles) {
    const exists = await Role.findOne({ name: role.name });
    if (!exists) {
      await Role.create(role);
    }
  }
};
