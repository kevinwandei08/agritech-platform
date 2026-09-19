import React, { useState } from 'react';
import { Lock, Mail, User, Phone, X, Sprout, ArrowRight } from 'lucide-react';
import API from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'farmer'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await API.post(endpoint, payload);
      const { token, user } = response.data;

      // Persist auth data in localStorage
      localStorage.setItem('agritech_token', token);
      localStorage.setItem('agritech_user', JSON.stringify(user));

      onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-100">
            {isLogin ? 'Welcome Back' : 'Create Agritech Account'}
          </h3>
          <p className="text-xs text-slate-400">
            {isLogin
              ? 'Enter your credentials to access farm telemetry'
              : 'Sign up to manage crops, livestock, and local services'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-900/40 border border-rose-700 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Kevin Farmer"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+254711111111"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="farmer">Farmer</option>
                  <option value="vet">Veterinarian / Agrovet Provider</option>
                  <option value="admin">Extension Officer / Admin</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="kevin@farm.com"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Mode Switch */}
        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already registered?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="ml-1.5 text-emerald-400 hover:underline font-semibold"
            >
              {isLogin ? 'Register now' : 'Sign in instead'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}