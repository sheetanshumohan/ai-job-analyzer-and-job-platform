import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  PlusCircle, List, Users, LogOut, Briefcase, MapPin, 
  Send, AlignLeft, Globe, ChevronRight, ArrowLeft, Star, FileText, Clock, Code, CheckCircle
} from 'lucide-react';
import axios from 'axios';


const API_URL=import.meta.env.VITE_API_URL
const RecruiterDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('myjobs');
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: '', type: 'success' });
  // Form State
  console.log(applicants)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirementsInput: '' // Temporary string state for the input field
  });

  const token = localStorage.getItem('token');

  const triggerDialog = (message, type = 'success') => {
    setDialog({ show: true, message, type });
    setTimeout(() => setDialog({ show: false, message: '', type: 'success' }), 5000);
  };

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyJobs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchApplicantsForJob = async (jobId) => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(res.data.sort((a, b) => b.matchScore - a.matchScore));
    } catch (err) { triggerDialog("Error loading applicants", "error"); }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
        const res=await axios.patch(`${API_URL}/api/applications/${appId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
        );
        if (newStatus === 'Shortlisted') {
            triggerDialog("Candidate Shortlisted! Notification email has been sent to their Gmail.", "success");
        } else {
            triggerDialog("Candidate status updated to Rejected.", "success");
        }
        fetchApplicantsForJob(selectedJob._id);
    } catch (err) {
        triggerDialog("Status update failed", "error");
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    const requirementsArray = formData.requirementsInput
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== "");

    const finalData = {
      title: formData.title,
      company: formData.company,
      location: formData.location,
      description: formData.description,
      requirements: requirementsArray // Sending the array expected by your schema
    };

    try {
      await axios.post(`${API_URL}/api/jobs/add-jobs`, finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      triggerDialog("Job posted successfully!");
      setFormData({ title: '', company: '', location: '', description: '', requirementsInput: '' });
      fetchMyJobs();
      setActiveTab('myjobs');
    } catch (err) {
      triggerDialog("Failed to post job", "error");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
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
      {/* NAVBAR (Same as previous) */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">AI JOBHUB</h1>
            <div className="hidden md:flex space-x-2">
              <button onClick={() => setActiveTab('myjobs')} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'myjobs' || activeTab.includes('job') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>My Postings</button>
              <button onClick={() => setActiveTab('post')} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'post' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>+ Post Job</button>
            </div>
          </div>
          <button onClick={logout} className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* TAB: POST A JOB FORM */}
        {activeTab === 'post' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-900">Post New Role</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">Find your next hire with AI intelligence</p>
              </div>

              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 ml-4 uppercase">Role Title</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-200 outline-none" placeholder="Frontend Engineer" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 ml-4 uppercase">Company</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-200 outline-none" placeholder="Your Company Name" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 ml-4 uppercase">Location</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-200 outline-none" placeholder="Remote / City" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                </div>

                {/* UPDATED REQUIREMENTS SECTION */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">Required Skills (Comma separated)</label>
                  <div className="relative">
                    <Code className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-200 outline-none" 
                      placeholder="React, Node.js, Python, MongoDB"
                      value={formData.requirementsInput} onChange={(e) => setFormData({...formData, requirementsInput: e.target.value})} required 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold ml-4">* The AI uses these specific tags to rank candidates higher.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 ml-4 uppercase tracking-widest">General Description</label>
                  <textarea className="w-full p-4 bg-slate-50 border-none rounded-[1.5rem] font-medium h-32 focus:ring-2 ring-indigo-200 outline-none resize-none" placeholder="Give more context about the day-to-day role..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>

                <button type="submit" disabled={isPosting} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex justify-center items-center">
                  {isPosting ? "PUBLISHING..." : <>PUBLISH ROLE <Send size={20} className="ml-3"/></>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: MY POSTINGS */}
        {activeTab === 'myjobs' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900">Active Postings</h2>
            <div className="grid gap-4">
              {myJobs.map(job => (
                <div key={job._id} onClick={() => {setSelectedJob(job); setActiveTab('job-details');}} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer flex justify-between items-center group">
                  <div className="flex items-center space-x-6">
                    <div className="h-16 w-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Briefcase size={24} /></div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-slate-400 font-bold text-sm mt-1">{job.location}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: JOB DETAILS */}
        {activeTab === 'job-details' && selectedJob && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setActiveTab('myjobs')} className="flex items-center text-indigo-600 font-bold mb-8 hover:gap-2 transition-all"><ArrowLeft size={18} className="mr-2"/> Back to Postings</button>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedJob.title}</h2>
                  <p className="text-indigo-600 font-black text-lg uppercase tracking-widest mt-2">{selectedJob.company}</p>
                </div>
                <button onClick={() => {fetchApplicantsForJob(selectedJob._id); setActiveTab('view-applicants');}} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center"><Users className="mr-2" size={20}/> VIEW APPLICANTS</button>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-4">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements?.map((skill, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-2">Description</h4>
                  <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium">{selectedJob.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VIEW APPLICANTS */}
        {activeTab === 'view-applicants' && (
          <div className="space-y-8">
            <button onClick={() => setActiveTab('job-details')} className="text-indigo-600 font-bold flex items-center hover:underline"><ArrowLeft size={18} className="mr-2"/> Back to Job Info</button>
            <div className="grid gap-4">
              {applicants.map((app, index) => (
                <div key={app._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center space-x-6">
                    <div className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">#{index + 1}</div>
                    <div>
                      <h4 className="font-black text-xl text-slate-900">{app.candidateId?.name}</h4>
                      <a href={app.candidateId?.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-xs font-black flex items-center hover:underline mt-1 uppercase tracking-widest"><FileText size={14} className="mr-1"/> View Resume</a>
                    </div>
                  </div>
                  <div className="text-right relative group">
                    <div className="flex items-center text-indigo-600 font-black text-3xl"><Star size={20} className="mr-2 fill-indigo-600"/> {app.matchScore}%</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">AI Match Score</span>
                    {app.aiFeedback && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-black text-indigo-400 mb-1 uppercase tracking-tighter">AI Analysis:</div>
                        <p className="leading-relaxed text-slate-200">"{app?.aiFeedback}"</p>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full right-6 w-3 h-3 bg-slate-900 rotate-45 -translate-y-1.5"></div>
                        </div>
                    )}
                  </div>
                    <div className="flex space-x-2">
                    {/* SHORTLIST BUTTON */}
                    <button 
                        onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                        disabled={app.status !== 'Applied'} // Disable if a decision is already made
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                        app.status === 'Shortlisted' 
                            ? 'bg-green-600 text-white cursor-default' // Current Choice
                            : app.status === 'Rejected'
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50' // Locked out
                            : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' // Pending state
                        }`}
                    >
                        {app.status === 'Shortlisted' ? 'SHORTLISTED' : 'SHORTLIST'}
                    </button>

                    {/* REJECT BUTTON */}
                    <button 
                        onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                        disabled={app.status !== 'Applied'} // Disable if a decision is already made
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                        app.status === 'Rejected' 
                            ? 'bg-red-600 text-white cursor-default' // Current Choice
                            : app.status === 'Shortlisted'
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50' // Locked out
                            : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' // Pending state
                        }`}
                    >
                        {app.status === 'Rejected' ? 'REJECTED' : 'REJECT'}
                    </button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboard;