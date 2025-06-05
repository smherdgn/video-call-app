
import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import { LOGO_SVG_STRING } from '../constants';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { user } = await loginUser(email, password);
      onLoginSuccess(user.email);
    } catch (err) {
      setError((err as Error).message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Using rounded-2xl for main screen cards is a common and acceptable enhancement over rounded-xl for prominence */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl p-6 space-y-6"> {/* Adjusted to Card Pattern, p-6, space-y-6 */}
        <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }}></div>
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-indigo-700">Giriş Yap</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl relative flex items-center gap-2" role="alert"> {/* Error alert style as per BookMeza implicit suggestion */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:bg-white/90 hover:border-slate-300 transition-all duration-200"
              placeholder="ornek@mail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:bg-white/90 hover:border-slate-300 transition-all duration-200"
              placeholder="Şifreniz"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-slate-500">
          Bu bir demo uygulamasıdır. Test amaçlı herhangi bir email/şifre ile giriş yapabilirsiniz.
        </p>
      </div>
      <footer className="mt-10 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} Video Call App by BookMeza Design.
      </footer>
    </div>
  );
};

export default LoginScreen;