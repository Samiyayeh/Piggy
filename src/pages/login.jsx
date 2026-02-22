import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
      } else {
        alert('Check your email for the confirmation link!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Illustration/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-2 text-white/90">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Piggy</span>
          </div>

          <div className="max-w-xl text-white">
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Manage your <br/>finances <span className="text-indigo-200">effortlessly</span>.
            </h1>
            <p className="text-lg text-indigo-100/90 leading-relaxed font-medium">
              Join thousands of users who are taking control of their money with Piggy's intuitive tracking tools.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-indigo-200 text-sm font-medium">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-300 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="User avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p>Trusted by 10,000+ users</p>
          </div>
        </div>
      </div>

      {/* Right side - Form container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-8 text-indigo-600">
              <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xl font-bold tracking-tight">Piggy</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isSignUp 
                ? 'Enter your details below to create your account and get started.' 
                : 'Enter your email and password to access your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-10 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                {!isSignUp && (
                  <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-10 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm flex items-center justify-center gap-1">
            <span className="text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isSignUp ? 'Sign in instead' : 'Create an account'}
            </button>
          </div>
          
          {/* Social login divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                     fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}