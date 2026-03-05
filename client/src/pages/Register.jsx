import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import axios from 'axios';


const API_URL=import.meta.env.VITE_API_URL
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate' // Default role from your flowchart logic
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
            <UserPlus className="text-white h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 border border-slate-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Role Selection Logic */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'candidate'})}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all cursor-pointer ${
                  formData.role === 'candidate' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200' 
                }`}
              >
                <User className={`h-6 w-6 ${formData.role === 'candidate' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`mt-2 text-xs font-bold ${formData.role === 'candidate' ? 'text-blue-600' : 'text-slate-500'} `}>CANDIDATE</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'recruiter'})}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all cursor-pointer ${
                  formData.role === 'recruiter' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <Briefcase className={`h-6 w-6 ${formData.role === 'recruiter' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`mt-2 text-xs font-bold ${formData.role === 'recruiter' ? 'text-blue-600' : 'text-slate-500'}`}>RECRUITER</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white cursor-pointer bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;