import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
import StudentLayout from "./components/layout/StudentLayout";
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
import ManageAccounts from "./pages/admin/ManageAccounts";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyClasses from "./pages/teacher/MyClasses";
import Assignments from "./pages/teacher/Assignments";
import Grades from "./pages/teacher/Grades";
import Attendance from "./pages/teacher/Attendance";
import Announcements from "./pages/teacher/Announcements";
import TeacherStudents from "./pages/teacher/Students";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/Courses";
import StudentAttendance from "./pages/student/Attendance";
import StudentClassroom from "./pages/student/Classroom";
import StudentNotices from "./pages/student/Notices";
import StudentAccount from "./pages/student/Account";
import SchoolHome from "./pages/SchoolHome";
import ResetPassword from "./pages/ResetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }
    ],
  },
  {
  path: "/reset-password",
  element: <ResetPassword />,
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
    path: "/student",
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: "courses", element: <StudentCourses /> },
      { path: "attendance", element: <StudentAttendance /> },
      { path: "classroom", element: <StudentClassroom /> },
      { path: "notices", element: <StudentNotices /> },
      { path: "account", element: <StudentAccount /> }
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
      { path: "accounts", element: <ManageAccounts /> },
      { path: "enquiries", element: <Enquiries /> },
      { path: "notices", element: <Notices /> },
      { path: "gallery", element: <Gallery /> }
    ],
  }
  
]);
