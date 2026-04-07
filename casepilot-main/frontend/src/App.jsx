import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CaseDetail from "./pages/CaseDetail";
import CaseList from "./pages/CaseList";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Hearings from "./pages/Hearings";
import Research from "./pages/Research";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import ToolConnections from "./pages/ToolConnections";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases" element={<CaseList />} />
        <Route path="/cases/:caseNumber" element={<CaseDetail />} />
        <Route path="/hearings" element={<Hearings />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/research" element={<Research />} />
        <Route path="/files" element={<Files />} />
        <Route path="/connections" element={<ToolConnections />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
