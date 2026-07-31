import React, { useState } from 'react';
import { User as UserIcon, GraduationCap, X, Check, Shield, Users } from 'lucide-react';
import { User, BranchType, YearType } from '../types';
import { SAMPLE_USERS } from '../data/initialData';

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
  const [mode, setMode] = useState<'switch' | 'register'>('switch');

  // Form state
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-orange-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Campus Student Portal Account</h2>
            <p className="text-xs text-slate-500 font-medium">Join platform or switch demo profile</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-orange-50/80 p-1 rounded-2xl border border-orange-200 mb-6 text-xs font-black">
          <button
            onClick={() => setMode('switch')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'switch' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 Select Demo Profile
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ➕ Join As New Student
          </button>
        </div>

        {mode === 'switch' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-bold mb-2">
              Select a pre-configured campus account for testing:
            </p>

            {SAMPLE_USERS.map((user) => {
              const isSelected = currentUser.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-orange-50 border-orange-500 text-slate-800 shadow-sm'
                      : 'bg-white hover:bg-orange-50/50 border-orange-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xs">
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
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-black">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
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
              className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl shadow-md shadow-orange-200 text-xs uppercase tracking-wider"
            >
              JOIN CAMPUS LOST & FOUND
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
