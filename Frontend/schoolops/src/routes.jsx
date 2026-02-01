import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
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
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyClasses from "./pages/teacher/MyClasses";
import Assignments from "./pages/teacher/Assignments";
import Grades from "./pages/teacher/Grades";
import Attendance from "./pages/teacher/Attendance";
import Announcements from "./pages/teacher/Announcements";
import TeacherStudents from "./pages/teacher/Students";
import SchoolHome from "./pages/SchoolHome";

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
    path: "/school-home",
    element: <SchoolHome />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/teacher",
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboard /> },
      { path: "classes", element: <MyClasses /> },
      { path: "assignments", element: <Assignments /> },
      { path: "grades", element: <Grades /> },
      { path: "attendance", element: <Attendance /> },
      { path: "announcements", element: <Announcements /> },
      { path: "students", element: <TeacherStudents /> }
    ],
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
