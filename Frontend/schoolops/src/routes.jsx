import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Teachers from "./pages/admin/Teachers";
import Courses from "./pages/admin/Courses";
import Students from "./pages/admin/Students";
import Users from "./pages/admin/Users";
import Enquiries from "./pages/admin/Enquiries";
import Notices from "./pages/admin/Notices";
import Gallery from "./pages/admin/Gallery";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }
    ],
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "teachers", element: <Teachers /> },
      { path: "courses", element: <Courses /> },
      { path: "students", element: <Students /> },
      { path: "users", element: <Users /> },
      { path: "enquiries", element: <Enquiries /> },
      { path: "notices", element: <Notices /> },
      { path: "gallery", element: <Gallery /> }
    ],
  }
]);
