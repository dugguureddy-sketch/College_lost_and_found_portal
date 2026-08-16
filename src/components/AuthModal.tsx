import React, { useState } from 'react';
import { User as UserIcon, GraduationCap, X, Check, Shield, Users, KeyRound, Mail, Lock, Sparkles, AlertCircle, UserPlus } from 'lucide-react';
import { User, BranchType, YearType } from '../types';
import { getUsers } from '../utils/storage';
import { supabaseSignIn, supabaseSignUp, supabaseResetPassword } from '../lib/supabase';

interface AuthModalProps {
  currentUser: User;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onRegisterUser: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onSelectUser,
  onRegisterUser,
}) => {
  const registeredUsers = getUsers();
  const [mode, setMode] = useState<'switch' | 'supabase_auth' | 'register'>(
    registeredUsers.length > 0 ? 'switch' : 'supabase_auth'
  );

  // Supabase Auth Form State
  const [authType, setAuthType] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCollegeId, setAuthCollegeId] = useState('');
  const [authRole, setAuthRole] = useState<'student' | 'admin' | 'security'>('student');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Local Register Form state
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<BranchType>('CSE');
  const [year, setYear] = useState<YearType>('2nd Year');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [role, setRole] = useState<'student' | 'admin'>('student');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim() || !name.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      regNumber: regNumber.trim().toUpperCase(),
      name: name.trim(),
      branch,
      year,
      phone: phone.trim(),
      role,
      createdAt: new Date().toISOString(),
    };

    onRegisterUser(newUser);
  };

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);

    try {
      if (authType === 'forgot') {
        const res = await supabaseResetPassword(authEmail);
        if (res.error) {
          setAuthMessage({ type: 'error', text: res.error });
        } else {
          setAuthMessage({ type: 'success', text: 'Password reset link sent to your college email!' });
        }
      } else if (authType === 'signup') {
        if (!authEmail || !authPassword || !authName || !authCollegeId) {
          setAuthMessage({ type: 'error', text: 'Please fill in all required fields.' });
          setAuthLoading(false);
          return;
        }

        const res = await supabaseSignUp(authEmail, authPassword, {
          name: authName,
          collegeId: authCollegeId.toUpperCase(),
          role: authRole,
        });

        if (res.error) {
          setAuthMessage({ type: 'error', text: res.error });
        } else {
          setAuthMessage({
            type: 'success',
            text: 'Account created with Supabase Auth! You can now sign in.',
          });
          const newUser: User = {
            id: res.user?.id || `user-${Date.now()}`,
            regNumber: authCollegeId.toUpperCase(),
            name: authName,
            email: authEmail,
            branch: 'CSE',
            year: '2nd Year',
            phone: '+91 98765 43210',
            role: authRole as any,
            createdAt: new Date().toISOString(),
          };
          onRegisterUser(newUser);
        }
      } else {
        // Sign In
        const res = await supabaseSignIn(authEmail, authPassword);
        if (res.error) {
          setAuthMessage({ type: 'error', text: res.error });
        } else {
          setAuthMessage({ type: 'success', text: 'Signed in successfully via Supabase!' });
          const userMeta = res.user?.user_metadata || {};
          const signedUser: User = {
            id: res.user?.id || `user-${Date.now()}`,
            regNumber: userMeta.college_id || 'CAMPUS-USER',
            name: userMeta.name || authEmail.split('@')[0],
            email: authEmail,
            branch: userMeta.department || 'CSE',
            year: '2nd Year',
            phone: '+91 98765 43210',
            role: userMeta.role || 'student',
            createdAt: new Date().toISOString(),
          };
          onSelectUser(signedUser);
        }
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err?.message || 'Authentication operation failed.' });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-lg w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Sticky Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Campus Identity & Auth Portal</h2>
              <p className="text-[11px] text-slate-500 font-medium">Supabase Auth, roles & test accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Mode Toggle */}
          <div className="grid grid-cols-3 gap-1.5 bg-orange-50/80 p-1 rounded-2xl border border-orange-200 text-xs font-black">
            <button
              onClick={() => setMode('switch')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                mode === 'switch' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Demo Accounts
            </button>
            <button
              onClick={() => setMode('supabase_auth')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                mode === 'supabase_auth' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Supabase Auth
            </button>
            <button
              onClick={() => setMode('register')}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                mode === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ➕ Quick Student
            </button>
          </div>

          {mode === 'switch' && (
            <div className="space-y-2.5">
              {registeredUsers.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 font-bold mb-1">
                    Select an active campus account:
                  </p>
                  {registeredUsers.map((user) => {
                    const isSelected = currentUser.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500 text-slate-800 shadow-sm'
                            : 'bg-white hover:bg-orange-50/50 border-orange-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-slate-800 flex items-center space-x-1.5">
                              <span>{user.name}</span>
                              {user.role === 'admin' && (
                                <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px] font-medium mt-0.5">
                              {user.regNumber} • {user.branch} ({user.year})
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-black shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-6 px-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">No Accounts Created Yet</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Sign in with Supabase Auth or register a quick student profile to begin.
                    </p>
                  </div>
                  <button
                    onClick={() => setMode('supabase_auth')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    <span>Create with Supabase</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'supabase_auth' && (
            <div className="space-y-3.5">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => { setAuthType('signin'); setAuthMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg ${authType === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthType('signup'); setAuthMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg ${authType === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setAuthType('forgot'); setAuthMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg ${authType === 'forgot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Reset
                </button>
              </div>

              {authMessage && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  authMessage.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSupabaseSubmit} className="space-y-3">
                {authType === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                        College / Roll Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={authCollegeId}
                        onChange={(e) => setAuthCollegeId(e.target.value)}
                        placeholder="e.g. 23CSE045"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                        Account Role
                      </label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        <option value="student">Student (Standard User)</option>
                        <option value="faculty">Faculty Member</option>
                        <option value="security">Campus Security Officer</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                    College Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                {authType !== 'forgot' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-400"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-black rounded-xl shadow-md shadow-orange-200 text-xs uppercase tracking-wider"
                >
                  {authLoading
                    ? 'CONNECTING TO SUPABASE...'
                    : authType === 'signin'
                    ? 'SIGN IN WITH SUPABASE'
                    : authType === 'signup'
                    ? 'CREATE SUPABASE ACCOUNT'
                    : 'SEND RESET LINK'}
                </button>
              </form>
            </div>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                  Registration / Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="e.g. 22CSE1042"
                  className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amrit Rout"
                  className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as BranchType)}
                    className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-bold"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="EEE">EEE</option>
                    <option value="Civil">Civil</option>
                    <option value="IT">IT</option>
                    <option value="Biotech">Biotech</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as YearType)}
                    className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-bold"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Faculty / Staff">Faculty / Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-orange-50/70 border border-orange-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase text-[10px] tracking-wide mb-1">Account Role</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                    />
                    <span>Student User</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-orange-600">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                    />
                    <span>Campus Admin</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl shadow-md shadow-orange-200 text-xs uppercase tracking-wider"
              >
                JOIN CAMPUS LOST & FOUND
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-orange-100 flex items-center justify-between shrink-0 bg-slate-50/90 rounded-b-3xl">
          <span className="text-[10px] text-slate-400 font-medium">
            Active: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.role})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
