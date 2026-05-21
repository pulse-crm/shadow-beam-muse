import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toast/toaster";

import Dashboard from "@/pages/Dashboard";
import CustomerSearch from "@/pages/CustomerSearch";
import CustomerDetail from "@/pages/CustomerDetail";
import Tickets from "@/pages/Tickets";
import Pipeline from "@/pages/Pipeline";
import Billing from "@/pages/Billing";
import Messages from "@/pages/Messages";
import Calendar from "@/pages/Calendar";
import ProductCatalogue from "@/pages/ProductCatalogue";
import KnowledgeBase from "@/pages/KnowledgeBase";
import EmailTemplates from "@/pages/EmailTemplates";
import Surveys from "@/pages/Surveys";
import DemoData from "@/pages/DemoData";
import Changelog from "@/pages/Changelog";
import Documentation from "@/pages/Documentation";
import Architecture from "@/pages/Architecture";
import Platform from "@/pages/Platform";
import PlatformIAM from "@/pages/PlatformIAM";
import PlatformAudit from "@/pages/PlatformAudit";
import PlatformObservability from "@/pages/PlatformObservability";
import FeedbackLog from "@/pages/FeedbackLog";
import UserManagement from "@/pages/UserManagement";
import EscalationWorkflows from "@/pages/EscalationWorkflows";
import SlaPolicies from "@/pages/SlaPolicies";
import Announcements from "@/pages/Announcements";
import Approvals from "@/pages/Approvals";
import Performance from "@/pages/Performance";
import AuditLog from "@/pages/AuditLog";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<CustomerSearch />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/products" element={<ProductCatalogue />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/email-templates" element={<EmailTemplates />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/demo-data" element={<DemoData />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/platform/iam" element={<PlatformIAM />} />
          <Route path="/platform/audit" element={<PlatformAudit />} />
          <Route path="/platform/observability" element={<PlatformObservability />} />
          <Route path="/feedback-log" element={<FeedbackLog />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/escalation-workflows" element={<EscalationWorkflows />} />
          <Route path="/sla-policies" element={<SlaPolicies />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/customers" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
