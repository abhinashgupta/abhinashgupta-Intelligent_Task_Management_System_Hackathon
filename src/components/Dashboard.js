import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import {
  Button,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import io from "socket.io-client";
import { styled } from "@mui/system";
import api from "../api";
import { dashboardSchema } from "./validationSchemas";

const socket = io("http://localhost:4000");

const StyledCard = styled(Card)({
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
  },
});

const StyledButton = styled(Button)({
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
});

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      searchTerm: "",
      statusFilter: "",
      priorityFilter: "",
      dueDateFilter: "",
    },
    validationSchema: dashboardSchema,
    onSubmit: async (values) => {
      try {
        await fetchFilteredTasks(values);
      } catch (error) {
        enqueueSnackbar("Error fetching tasks", { variant: "error" });
      }
    },
  });

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await api.get("/tasks");
        setTasks(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching tasks");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const fetchFilteredTasks = async (filters) => {
    setLoading(true);
    try {
      const response = await api.get("/tasks", {
        params: filters,
      });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      setError("Error fetching filtered tasks");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}`);
        socket.emit("deleteTask", id);
        enqueueSnackbar("Task deleted successfully", { variant: "success" });
        // Refetch tasks after deletion
        fetchFilteredTasks(formik.values);
      } catch (error) {
        enqueueSnackbar("Error deleting task", { variant: "error" });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (id) => {
    const taskToEdit = tasks.find((task) => task._id === id);
    if (taskToEdit) {
      navigate(`/tasks/edit/${id}`, { state: { initialValues: taskToEdit } });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <StyledButton
            component={Link}
            to="/tasks/new"
            variant="contained"
            color="primary"
            fullWidth
          >
            Create New Task
          </StyledButton>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            id="searchTerm"
            name="searchTerm"
            label="Search Tasks"
            variant="outlined"
            fullWidth
            value={formik.values.searchTerm}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.searchTerm && Boolean(formik.errors.searchTerm)
            }
            helperText={formik.touched.searchTerm && formik.errors.searchTerm}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            id="dueDateFilter"
            name="dueDateFilter"
            label="Due Date"
            type="date"
            variant="outlined"
            fullWidth
            value={formik.values.dueDateFilter}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="priorityFilterLabel">Priority</InputLabel>
            <Select
              labelId="priorityFilterLabel"
              id="priorityFilter"
              name="priorityFilter"
              value={formik.values.priorityFilter}
              onChange={formik.handleChange}
              label="Priority"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="statusFilterLabel">Status</InputLabel>
            <Select
              labelId="statusFilterLabel"
              id="statusFilter"
              name="statusFilter"
              value={formik.values.statusFilter}
              onChange={formik.handleChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <StyledButton
        onClick={formik.handleSubmit}
        variant="contained"
        color="primary"
        style={{ marginTop: "20px" }}
      >
        Search
      </StyledButton>
      {loading ? (
        <CircularProgress style={{ marginTop: "20px" }} />
      ) : error ? (
        <div style={{ color: "red", marginTop: "20px" }}>{error}</div>
      ) : (
        <Grid container spacing={2} style={{ marginTop: "20px" }}>
          {formik.values.searchTerm.length > 0
            ? tasks
                .filter(
                  (task) =>
                    task.name
                      .toLowerCase()
                      .includes(formik.values.searchTerm.toLowerCase()) ||
                    task.description
                      .toLowerCase()
                      .includes(formik.values.searchTerm.toLowerCase()) ||
                    (task.tags &&
                      task.tags.some((tag) =>
                        tag
                          .toLowerCase()
                          .includes(formik.values.searchTerm.toLowerCase())
                      ))
                )
                .map((task) => (
                  <Grid item xs={12} md={6} lg={4} key={task._id}>
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6">{task.name}</Typography>
                        <Typography variant="body2">
                          {task.description}
                        </Typography>
                        <Typography variant="body2">
                          Due Date: {formatDate(task.dueDate)}
                        </Typography>
                        <Typography variant="body2">
                          Priority: {task.priority}
                        </Typography>
                        <Typography variant="body2">
                          Status: {task.status}
                        </Typography>
                        <Grid container justifyContent="flex-end">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(task._id)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDelete(task._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))
            : tasks
                .filter(
                  (task) =>
                    (!formik.values.dueDateFilter ||
                      formatDate(task.dueDate) ===
                        formik.values.dueDateFilter) &&
                    (!formik.values.statusFilter ||
                      task.status === formik.values.statusFilter) &&
                    (!formik.values.priorityFilter ||
                      task.priority === formik.values.priorityFilter)
                )
                .map((task) => (
                  <Grid item xs={12} md={6} lg={4} key={task._id}>
                    <StyledCard>
                      <CardContent>
                        <Typography variant="h6">{task.name}</Typography>
                        <Typography variant="body2">
                          {task.description}
                        </Typography>
                        <Typography variant="body2">
                          Due Date: {formatDate(task.dueDate)}
                        </Typography>
                        <Typography variant="body2">
                          Priority: {task.priority}
                        </Typography>
                        <Typography variant="body2">
                          Status: {task.status}
                        </Typography>
                        <Grid container justifyContent="flex-end">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(task._id)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDelete(task._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
        </Grid>
      )}
    </div>
  );
}

export default Dashboard;
