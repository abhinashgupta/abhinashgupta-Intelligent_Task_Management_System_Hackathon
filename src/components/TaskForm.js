import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  Grid,
} from "@mui/material";

import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { styled } from "@mui/system";
import { taskSchema } from "./validationSchemas";
import api from "../api";

const priorities = ["Low", "Medium", "High"];
const statuses = ["Pending", "In Progress", "Completed"];

const StyledButton = styled(Button)({
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  transition: "box-shadow 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  },
});

function TaskForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    },
    validationSchema: taskSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (id) {
          await api.put(`/tasks/${id}`, values);
          enqueueSnackbar("Task updated successfully", { variant: "success" });
        } else {
          await api.post("/tasks", values);
          enqueueSnackbar("Task created successfully", { variant: "success" });
        }
        setLoading(false);
        navigate("/");
      } catch (error) {
        setError("Error saving task");
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/tasks/${id}`);
        formik.setValues({
          ...formik.values,
          ...response.data,
        });
        setLoading(false);
      } catch (error) {
        setError("Error fetching task details");
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    } else {
      // Reset form values if id is empty (for creating new task)
      formik.resetForm();
    }
  }, [id]); // Only re-run the effect if id changes

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        {id ? "Edit Task" : "Create Task"}
      </h2>
      {loading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Task Name"
                variant="outlined"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="dueDate"
                name="dueDate"
                label="Due Date"
                type="date"
                variant="outlined"
                value={formik.values.dueDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                helperText={formik.touched.dueDate && formik.errors.dueDate}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
               
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="priority"
                name="priority"
                label="Priority"
                select
                variant="outlined"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.priority && Boolean(formik.errors.priority)
                }
                helperText={formik.touched.priority && formik.errors.priority}
                margin="normal"
              >
                {priorities.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="status"
                name="status"
                label="Status"
                select
                variant="outlined"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
                margin="normal"
              >
                {statuses.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <StyledButton
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                style={{ marginTop: "10px" }}
              >
                {id ? "Update Task" : "Create Task"}
              </StyledButton>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
              </Grid>
            )}
          </Grid>
        </form>
      )}
    </div>
  );
}

export default TaskForm;
