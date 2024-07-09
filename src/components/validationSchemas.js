import * as yup from "yup";

export const taskSchema = yup.object({
  name: yup.string().required("Task Name is required"),
  description: yup.string().required("Description is required"),
  dueDate: yup.date().required("Due Date is required").nullable(),
  priority: yup.string().required("Priority is required"),
  status: yup.string().required("Status is required"),
});

export const dashboardSchema = yup.object().shape({
  searchTerm: yup.string().trim(),
  statusFilter: yup.string(),
  priorityFilter: yup.string(),
  dueDateFilter: yup.date().nullable(),
});


