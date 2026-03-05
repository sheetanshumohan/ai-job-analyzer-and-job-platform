import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FileText, Upload, Zap, Search, CheckCircle, AlertCircle, Home, Briefcase, XCircle, FileUp } from 'lucide-react';
import axios from 'axios';
import { LogOut } from 'lucide-react';


const API_URL=import.meta.env.VITE_API_URL
const CandidateDashboard = () => {
  const { user, setUser , logout} = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('home');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  console.log(user?.resumeUrl)
  // Missing states from your snippet added here:
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [analyzingJobId, setAnalyzingJobId] = useState(null);
  const [dialog, setDialog] = useState({ show: false, message: '', type: 'success' });

  const token = localStorage.getItem('token');
  const hasResume = !!user?.resumeUrl;

  // 1. Helper function for the 5-second dialog
  const triggerDialog = (message, type = 'success') => {
    setDialog({ show: true, message, type });
    setTimeout(() => setDialog({ show: false, message: '', type: 'success' }), 5000);
  };

  // 2. Fetch Data based on active tab
  useEffect(() => {
    if (activeTab === 'home') fetchJobs();
    if (activeTab === 'applied' || activeTab === 'withdraw') fetchAppliedJobs();
  }, [activeTab]);

  useEffect(() => {
  // Always fetch these on refresh to ensure buttons are disabled correctly
    const initializeDashboard = async () => {
      await fetchAppliedJobs(); // Get the "Truth" from DB first
      await fetchJobs();        // Then get the job list
    };

    if (token) {
      initializeDashboard();
    }
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/get-all-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/applications/my-apps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedJobs(res.data);
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  // 3. Logic for AI Application
  const handleApply = async (jobId) => {
    if (!hasResume) return triggerDialog("Please upload your resume first!", "error");
    setAnalyzingJobId(jobId);
    try {
      const res = await axios.post(`${API_URL}/api/ai/apply`, { jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      triggerDialog(`Applied! AI Match Score: ${res.data.score}%`);
      fetchAppliedJobs();
    } catch (err) {
      triggerDialog(err.response?.data?.message || "Application failed", "error");
    } finally {
      setAnalyzingJobId(null);
    }
  };

  // 4. Logic for Resume Upload
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!file) return triggerDialog("Please select a file", "error");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const res = await axios.post(`${API_URL}/api/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, resumeUrl: res.data.url };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      triggerDialog(hasResume ? "Resume updated successfully!" : "Resume uploaded successfully!");
      setFile(null); 
    } catch (err) {
      console.log(err)
      triggerDialog("Upload failed.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    try {
      await axios.delete(`${API_URL}/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      triggerDialog("Application withdrawn", "success");
      fetchAppliedJobs();
    } catch (err) {
      triggerDialog("Withdrawal failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 5-SECOND NOTIFICATION DIALOG */}
      {dialog.show && (
        <div className="fixed top-20 right-5 z-50 animate-bounce">
          <div className={`flex items-center p-4 rounded-2xl shadow-2xl border bg-white ${
            dialog.type === 'success' ? 'border-green-100' : 'border-red-100'
          } max-w-md`}>
            {dialog.type === 'success' ? <CheckCircle className="text-green-500 mr-3" /> : <AlertCircle className="text-red-500 mr-3" />}
            <p className="text-sm font-bold text-slate-800">{dialog.message}</p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-black text-blue-600">AI JOBHUB</h1>
            <div className="hidden md:flex items-center space-x-1">
              <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Home</button>
              <button onClick={() => setActiveTab('applied')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'applied' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Applied Jobs</button>
              <button onClick={() => setActiveTab('withdraw')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'withdraw' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Withdraw</button>
              <button onClick={() => setActiveTab('resume')} className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'resume' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                <FileUp className="mr-2 h-4 w-4" /> {hasResume ? "Update Resume" : "Upload Resume"}
              </button>
            </div>
          </div>
          <div className='flex justify-between items-center '>
            <div className="text-sm font-black text-slate-400 uppercase mr-4">{user?.name}</div>  
            <button 
            onClick={logout}
            className="p-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
            title="Logout"
            >
            <LogOut className="h-5 w-5" />
            </button>
        </div>
          </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* TAB: HOME */}
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="grid gap-6">
            {jobs.map(job => {
              // Logic: Check if this specific job ID is in the user's applied list
              const hasApplied = appliedJobs.some(app => 
                (app.jobId?._id || app.jobId) === job._id
              );

              return (
                <div key={job._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-black text-2xl text-slate-900">{job.title}</h3>
                    <p className="text-slate-500 font-bold text-lg">{job.company}</p>
                  </div>

                  <button 
                    onClick={() => !hasApplied && handleApply(job._id)}
                    disabled={hasApplied || analyzingJobId === job._id}
                    className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${
                      hasApplied 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                        : 'bg-slate-900 text-white hover:bg-blue-600 hover:-translate-y-1 active:scale-95 shadow-blue-100'
                    }`}
                  >
                    {analyzingJobId === job._id ? (
                      <>ANALYZING... <div className="ml-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /></>
                    ) : hasApplied ? (
                      <>APPLIED <CheckCircle className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>QUICK APPLY <Zap className="ml-2 h-4 text-yellow-400" /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: APPLIED */}
        {activeTab === 'applied' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Your Applications</h2>
            <div className="grid gap-4">
              {appliedJobs.map(app => (
                <div key={app._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{app.jobId?.title}</h3>
                      <p className="text-slate-500">{app.jobId?.company}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-black">{app.matchScore}% Match</span>
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                    app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {app.status || 'Pending'}
                  </div>
                  </div>
                  <p className="text-sm text-slate-600 italic">"{app.aiFeedback}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Withdraw Applications</h2>
            <div className="grid gap-4">
              {appliedJobs.map(app => (
                <div key={app._id} className="bg-white p-6 rounded-3xl border border-red-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">{app.jobId?.title} at {app.jobId?.company}</h3>
                  <button onClick={() => handleWithdraw(app._id)} className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all">Withdraw</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: RESUME */}
        {activeTab === 'resume' && (
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">{hasResume ? "Keep Your Profile Fresh" : "Complete Your Profile"}</h2>
              <p className="text-slate-500 font-medium">{hasResume ? "Re-uploading helps AI accuracy." : "Upload your resume to start matching."}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-100">
              {hasResume && (
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900 flex items-center"><FileText className="mr-2 h-4 w-4"/> Resume Active</span>
                  <a href={user.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-xs font-black text-blue-600 underline hover:text-blue-800 transition-colors"
                    onClick={(e) => {
                        if (!user.resumeUrl) {
                        e.preventDefault();
                        triggerDialog("No resume URL found. Please re-upload.", "error");
                        }
                    }}>VIEW
                    </a>
                </div>
              )}
              <form onSubmit={handleResumeUpload} className="space-y-6">
                <input type="file" id="resume-full" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                <label htmlFor="resume-full" className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-slate-100 rounded-[1.5rem] cursor-pointer hover:border-blue-200 transition-all">
                  <Upload className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-bold text-slate-600">{file ? file.name : "Choose PDF file"}</span>
                </label>
                <button disabled={isUploading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50">
                  {isUploading ? "AI Processing..." : (hasResume ? "Update My Resume" : "Upload Your Resume")}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;