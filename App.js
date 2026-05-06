"import \"@/App.css\";
import { BrowserRouter, Routes, Route, Navigate } from \"react-router-dom\";
import { Toaster } from \"sonner\";
import Layout from \"@/components/Layout\";
import CaptchaDemoPage from \"@/pages/CaptchaDemoPage\";
import AdminLoginPage from \"@/pages/AdminLoginPage\";
import AdminDashboardPage from \"@/pages/AdminDashboardPage\";

function ProtectedAdmin({ children }) {
  const token = localStorage.getItem(\"admin_token\");
  if (!token) return <Navigate to=\"/admin/login\" replace />;
  return children;
}

function App() {
  return (
    <div className=\"App\">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path=\"/\" element={<CaptchaDemoPage />} />
            <Route path=\"/admin/login\" element={<AdminLoginPage />} />
            <Route
              path=\"/admin\"
              element={
                <ProtectedAdmin>
                  <AdminDashboardPage />
                </ProtectedAdmin>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position=\"top-right\" />
    </div>
  );
}

export default App;
"