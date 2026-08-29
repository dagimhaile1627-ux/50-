import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ShieldCheck,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  UserX,
  CheckCircle,
  X,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { API } from '../../services/api';

export const AdminDashboardModal: React.FC = () => {
  const { showAdminDashboard, setShowAdminDashboard } = useApp();
  const [activeTab, setActiveTab] = useState<'metrics' | 'reports' | 'audit_logs' | 'verifications'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getAdminOverview();
      setMetrics(data.metrics);
      setReports(data.reports || []);
      setAuditLogs(data.auditLogs || []);
      setVerificationQueue(data.verificationQueue || []);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Failed to load admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAdminDashboard) {
      loadData();
    }
  }, [showAdminDashboard]);

  if (!showAdminDashboard) return null;

  const handleActionReport = async (reportId: string, action: string) => {
    await API.actionAdminReport(reportId, action, `Actioned by senior compliance moderator`);
    loadData();
  };

  const handleReviewVerification = async (sessionId: string, decision: 'APPROVE' | 'REJECT') => {
    await API.reviewAdminVerification(sessionId, decision, `Manual staff review decision`);
    loadData();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-4xl w-full my-auto max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-white">
        {/* Top Header */}
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                Trust & Safety Guardian Console
                <span className="text-xs bg-neutral-800 text-white border border-neutral-700 px-2 py-0.5 rounded-full font-sans font-bold">
                  ADMIN / COMPLIANCE
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Persistent Database Monitoring, Scam Interception, & Verification Reviews
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdminDashboard(false)}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 tap-active"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-neutral-900/60 px-4 py-2 border-b border-neutral-800 flex items-center gap-2 shrink-0 overflow-x-auto">
          {[
            { id: 'metrics', label: 'Platform Health & Metrics' },
            { id: 'reports', label: `Safety Reports (${reports.filter((r) => r.status === 'PENDING').length})` },
            { id: 'verifications', label: `ID Verifications (${verificationQueue.length})` },
            { id: 'audit_logs', label: 'Moderation Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap tap-active ${
                activeTab === tab.id ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-white" />
              <span>Fetching persistent database statistics...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-2xl text-rose-400 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Metrics Tab */}
              {activeTab === 'metrics' && metrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                        <Users className="w-4 h-4 text-white" /> Total Users
                      </div>
                      <div className="text-2xl font-bold font-serif text-white">{metrics.totalUsers}</div>
                      <div className="text-[10px] text-emerald-400 mt-1 font-bold">100% Persistent on Disk</div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                        <ShieldCheck className="w-4 h-4 text-white" /> Verified Age 50+
                      </div>
                      <div className="text-2xl font-bold font-serif text-white">{metrics.verifiedUsers}</div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-bold">Document & Liveness Passed</div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                        <Activity className="w-4 h-4 text-white" /> Total Messages
                      </div>
                      <div className="text-2xl font-bold font-serif text-white">{metrics.totalMessages}</div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-bold">Real-time WebSocket & DB</div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Intercepted Scams
                      </div>
                      <div className="text-2xl font-bold font-serif text-amber-400">{metrics.scamFlagsIntercepted}</div>
                      <div className="text-[10px] text-amber-400 mt-1 font-bold">AI Guardian Protected</div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" /> Database & Encryption Integrity
                    </h3>
                    <p className="text-xs text-neutral-300">
                      All accounts, passwords (bcrypt 10 rounds), tokens (JWT), messages, matches, reports, and payments are stored in production-ready persistent state. Real-time connections are managed through our WebSocket hub.
                    </p>
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400 text-sm">
                      No active reports pending moderation.
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div key={report.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-rose-950 text-rose-300 border border-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {report.category}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-200">{report.description}</p>
                        {report.evidenceSnippets && report.evidenceSnippets.length > 0 && (
                          <div className="bg-black/50 p-2.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 font-mono">
                            Evidence: {report.evidenceSnippets.join(' | ')}
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                          <button
                            onClick={() => handleActionReport(report.id, 'DISMISS')}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded-xl font-bold"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleActionReport(report.id, 'WARN')}
                            className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs rounded-xl font-bold"
                          >
                            Issue Warning
                          </button>
                          <button
                            onClick={() => handleActionReport(report.id, 'BAN_USER')}
                            className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs rounded-xl font-bold flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" /> Suspend & Ban
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ID Verifications Queue */}
              {activeTab === 'verifications' && (
                <div className="space-y-4">
                  {verificationQueue.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400 text-sm">
                      Verification queue is empty. All submitted identities are processed.
                    </div>
                  ) : (
                    verificationQueue.map((item) => (
                      <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center text-xs text-neutral-400">
                          <span>User ID: {item.userId}</span>
                          <span>Doc Type: {item.documentType}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReviewVerification(item.id, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs rounded-xl font-bold"
                          >
                            Approve 50+ Badge
                          </button>
                          <button
                            onClick={() => handleReviewVerification(item.id, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs rounded-xl font-bold"
                          >
                            Reject Document
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Audit Logs */}
              {activeTab === 'audit_logs' && (
                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400 text-sm">
                      No audit events logged yet.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white mr-2">[{log.action}]</span>
                          <span className="text-neutral-300">{log.notes || 'Automated compliance rule'}</span>
                        </div>
                        <span className="text-neutral-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
