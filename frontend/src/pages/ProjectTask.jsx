import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ProjectTasks = () => {
    const { projectId } = useParams();
    const { user } = useAuth();

    const [tasks, setTasks] = useState([]);

    // For creating task
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const fetchTasks = async () => {
            const res = await axios.get(
                `http://localhost:5000/api/tasks/project/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            setTasks(res.data);
        };

        fetchTasks();
    }, [projectId]);

    const handleCreateTask = async (e) => {
        e.preventDefault();

        const res = await axios.post(
            "http://localhost:5000/api/tasks",
            {
                title,
                description,
                project: projectId,
            },
            {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }
        );

        setTasks([...tasks, res.data]);
        setTitle("");
        setDescription("");
    };

    const updateStatus = async (taskId, status) => {
        const res = await axios.put(
            `http://localhost:5000/api/tasks/${taskId}/status`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }
        );

        setTasks(tasks.map(t => (t._id === taskId ? res.data : t)));
    };

    const deleteTask = async (id) => {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        setTasks(tasks.filter(t => t._id !== id));
    };

    return (
        <div>
            <h2>Project Tasks</h2>

            {(user.role === "admin" || user.role === "manager") && (
                <form onSubmit={handleCreateTask}>
                    <input
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <button>Create Task</button>
                </form>
            )}

            {tasks.map(task => (
                <div key={task._id}>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <p>Status: {task.status}</p>

                    {/* F4.4 — STATUS UPDATE */}
                    {task.assignedTo?._id === user._id && (
                        <select
                            value={task.status}
                            onChange={(e) =>
                                updateStatus(task._id, e.target.value)
                            }
                        >
                            <option>todo</option>
                            <option>in-progress</option>
                            <option>done</option>
                        </select>
                    )}

                    {/* F4.5 — DELETE */}
                    {user.role === "admin" && (
                        <button onClick={() => deleteTask(task._id)}>
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProjectTasks;
