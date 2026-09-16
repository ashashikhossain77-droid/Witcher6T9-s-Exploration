import React, { useState } from 'react';
import { GoogleUserSession, RegisteredUser, TierDefinition } from '../types';
import {
  User,
  Shield,
  Check,
  X,
  LogOut,
  UserCheck,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Building2,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface UserAuthModalProps {
  currentUser?: GoogleUserSession;
  registeredUsers?: RegisteredUser[];
  tiers?: TierDefinition[];
  onSignIn: (user: Partial<GoogleUserSession>) => void;
  onSignOut: () => void;
  onRegisterUser?: (newUser: RegisteredUser) => void;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  currentUser,
  registeredUsers = [],
  tiers = [],
  onSignIn,
  onSignOut,
  onRegisterUser,
  onClose
}) => {
  // Mode: 'login' | 'signup' | 'profile' | 'google_picker'
  const [mode, setMode] = useState<'login' | 'signup' | 'profile' | 'google_picker'>(() => {
    return currentUser?.isSignedIn ? 'profile' : 'login';
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign Up / Create User Form States
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState(`IE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newDepartment, setNewDepartment] = useState('Industrial Engineering & Operations');
  const [newTierId, setNewTierId] = useState(tiers[0]?.id || 'tier_1');
  const [newAssignedLines, setNewAssignedLines] = useState<string[]>(['18', '19']);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Custom Google Account Input (for Google Picker)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('ashikur.rahman.0971@gmail.com');
  const [customGoogleName, setCustomGoogleName] = useState('Engr. Ashikur Rahman');

  // Pre-configured Google Accounts for instant 1-click test
  const quickGoogleAccounts = [
    {
      name: 'Engr. Ashikur Rahman',
      email: 'ashikur.rahman.0971@gmail.com',
      avatar: '',
      role: 'admin',
      tierId: 'tier_1',
      employeeId: 'IE-9001',
      department: 'Head of Industrial Engineering'
    },
    {
      name: 'Ashik Hossain',
      email: 'ashashikhossain77@gmail.com',
      avatar: '',
      role: 'admin',
      tierId: 'tier_1',
      employeeId: 'IE-8801',
      department: 'Industrial Engineering & Operations'
    }
  ];

  // Quick Demo Roles
  const demoRolePresets = [
    {
      name: 'Tanvir Hasan',
      email: 'tanvir.manager@apparelfactory.com',
      role: 'manager',
      tierId: 'tier_1',
      title: 'IE Operations Manager (T1)',
      avatar: '',
      employeeId: 'IE-7701'
    },
    {
      name: 'Farhana Chowdhury',
      email: 'farhana.ie@apparelfactory.com',
      role: 'assistant_manager',
      tierId: 'tier_2',
      title: 'Senior IE Executive (T2)',
      avatar: '',
      employeeId: 'IE-7740'
    },
    {
      name: 'Mahmudul Hoque',
      email: 'mahmudul.ie@apparelfactory.com',
      role: 'officer',
      tierId: 'tier_3',
      title: 'Floor IE Officer (T3)',
      avatar: '',
      employeeId: 'IE-6520'
    }
  ];

  // Handle Google Sign-In Execution
  const handleGoogleSignIn = (selectedAccount?: typeof quickGoogleAccounts[0]) => {
    const acc = selectedAccount || {
      name: customGoogleName || 'Engr. Ashikur Rahman',
      email: customGoogleEmail || 'ashikur.rahman.0971@gmail.com',
       avatar: '',
      role: 'admin',
      tierId: 'tier_1',
      employeeId: 'IE-9001',
      department: 'Industrial Engineering & Systems'
    };

    onSignIn({
      isSignedIn: true,
      name: acc.name,
      email: acc.email,
      avatarUrl: acc.avatar,
      role: acc.role,
      tierId: acc.tierId,
      department: acc.department,
      employeeId: acc.employeeId,
      authProvider: 'google',
      accessToken: `google_oauth_${Date.now()}_verified`,
      loginTime: new Date().toISOString()
    });
    onClose();
  };

  // Handle Corporate Email Login
  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your work email or employee ID');
      return;
    }

    // Check if user is registered in registeredUsers
    const matchedUser = registeredUsers.find(
      u => u.email.toLowerCase() === loginEmail.toLowerCase().trim() ||
           u.employeeId.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (matchedUser) {
      onSignIn({
        isSignedIn: true,
        name: matchedUser.name,
        email: matchedUser.email,
        avatarUrl: matchedUser.avatarUrl,
        role: matchedUser.role,
        tierId: matchedUser.tierId,
        department: matchedUser.department,
        employeeId: matchedUser.employeeId,
        authProvider: matchedUser.authProvider,
        loginTime: new Date().toISOString()
      });
      onClose();
      return;
    }

    // Default fallback corporate login
    const derivedName = loginEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    onSignIn({
      isSignedIn: true,
      name: derivedName || 'IE Corporate User',
      email: loginEmail,
       avatarUrl: '',
      role: 'admin',
      tierId: 'tier_1',
      department: 'Industrial Engineering',
      employeeId: `IE-${Math.floor(1000 + Math.random() * 9000)}`,
      authProvider: 'corporate_email',
      loginTime: new Date().toISOString()
    });
    onClose();
  };

  // Handle Create New User / Sign Up Submit
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!newName.trim()) {
      setSignupError('Please provide full name');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setSignupError('Please enter a valid work email address');
      return;
    }
    if (newPassword.length < 4) {
      setSignupError('Password should be at least 4 characters long');
      return;
    }
    if (newPassword !== newConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    const selectedTier = tiers.find(t => t.id === newTierId) || tiers[0];
    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      employeeId: newEmployeeId.trim(),
      department: newDepartment,
      tierId: newTierId,
      role: selectedTier?.systemRoleKey || 'officer',
      authProvider: 'corporate_email',
      avatarUrl: newAvatarUrl,
      assignedLines: newAssignedLines,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }

    setSignupSuccess(true);
    setTimeout(() => {
      onSignIn({
        isSignedIn: true,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        tierId: newUser.tierId,
        department: newUser.department,
        employeeId: newUser.employeeId,
        authProvider: 'corporate_email',
        loginTime: new Date().toISOString()
      });
      onClose();
    }, 800);
  };

  // Google Brand SVG Icon
  const GoogleIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              {mode === 'signup' ? (
                <UserPlus className="w-5 h-5 text-blue-600" />
              ) : mode === 'profile' ? (
                <UserCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <LogIn className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                {mode === 'signup'
                  ? 'Create New User Account'
                  : mode === 'profile'
                  ? 'Active User Profile & Session'
                  : mode === 'google_picker'
                  ? 'Sign In with Google'
                  : 'IE Authentication & Log In'}
              </h2>
              <div className="text-xs text-slate-500">
                {mode === 'signup'
                  ? 'Register industrial engineering credentials'
                  : mode === 'profile'
                  ? `${currentUser?.name} • ${currentUser?.authProvider?.toUpperCase() || 'ACTIVE'}`
                  : 'Access line tracking, KPI reports, and floor permissions'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container with Scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ================= MODE: LOGIN ================= */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* 1. Official Google Sign In Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(quickGoogleAccounts[0])}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 shadow-2xs transition flex items-center justify-center gap-3 text-sm group"
                >
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </button>

                {/* Secondary Google Switcher option */}
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('google_picker')}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Select another Google Workspace account or custom Gmail →
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Or corporate email
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* 2. Corporate Email Login Form */}
              <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work Email or Employee ID
                  </label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. ashikur.rahman@apparelfactory.com or IE-9001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">Default: any for demo</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Plant System</span>
                </button>
              </form>

              {/* Quick switch to Create Account */}
              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500">Need a new engineer profile? </span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Create User Account / Sign Up
                </button>
              </div>

              {/* 3. Fast Demo Role Switcher */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1-Click Demo Profiles (Evaluator Quick Access)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {demoRolePresets.map(preset => (
                    <button
                      key={preset.email}
                      type="button"
                      onClick={() => {
                        onSignIn({
                          isSignedIn: true,
                          name: preset.name,
                          email: preset.email,
                          avatarUrl: preset.avatar,
                          role: preset.role,
                          tierId: preset.tierId,
                          employeeId: preset.employeeId,
                          department: 'Industrial Engineering & Operations',
                          authProvider: 'demo',
                          loginTime: new Date().toISOString()
                        });
                        onClose();
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition flex items-center gap-2 shadow-2xs"
                    >
                      {preset.avatar ? (
                        <img
                          src={preset.avatar}
                          alt={preset.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#176f78] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {preset.name.charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-800 truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{preset.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE: GOOGLE ACCOUNT PICKER ================= */}
          {mode === 'google_picker' && (
            <div className="space-y-5">
              <div className="text-xs text-slate-600">
                Choose a connected Google account or sign in with another Google Workspace ID:
              </div>

              {/* Quick Google Accounts */}
              <div className="space-y-2.5">
                {quickGoogleAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleSignIn(acc)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition flex items-center justify-between text-left shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#176f78] text-white flex items-center justify-center text-xs font-bold border border-slate-200 group-hover:scale-105 transition shrink-0">
                          {acc.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                        </div>
                      )}
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{acc.email}</div>
                        <div className="text-[10px] text-slate-400">{acc.department}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                  </button>
                ))}
              </div>

              {/* Custom Google Email Input */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GoogleIcon />
                  <span>Enter Another Google Account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customGoogleName}
                    onChange={e => setCustomGoogleName(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="google.email@gmail.com"
                    value={customGoogleEmail}
                    onChange={e => setCustomGoogleEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <GoogleIcon />
                  <span>Authenticate as {customGoogleEmail || 'Google User'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Email Sign In
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE: SIGN UP (CREATE USER) ================= */}
          {mode === 'signup' && (
            <div className="space-y-5">
              {signupSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Account Created Successfully!</h3>
                  <p className="text-xs text-slate-500">
                    Signing you in with operational privileges for {newName}...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  {/* Google 1-Click Signup Shortcut */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <GoogleIcon />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">Fast Google Sign Up</div>
                        <div className="text-slate-500">1-click instant onboarding via Google ID</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn(quickGoogleAccounts[0])}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs transition shadow-2xs"
                    >
                      Sign Up with Google
                    </button>
                  </div>

                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      Or fill registration details
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  {signupError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {signupError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Engr. Ashikur Rahman"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="engineer@apparelfactory.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={newConfirmPassword}
                        onChange={e => setNewConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employee ID / Badge No.
                      </label>
                      <input
                        type="text"
                        value={newEmployeeId}
                        onChange={e => setNewEmployeeId(e.target.value)}
                        placeholder="e.g. IE-9001"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Department / Unit
                      </label>
                      <select
                        value={newDepartment}
                        onChange={e => setNewDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Industrial Engineering & Operations">Industrial Engineering &amp; Operations</option>
                        <option value="Sewing Floor A Production">Sewing Floor A Production</option>
                        <option value="Line Balancing & Work Study">Line Balancing &amp; Work Study</option>
                        <option value="Lean Manufacturing & Kaizen">Lean Manufacturing &amp; Kaizen</option>
                        <option value="Quality Assurance & Audit">Quality Assurance &amp; Audit</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Operational Authority &amp; System Tier
                      </label>
                      <select
                        value={newTierId}
                        onChange={e => setNewTierId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 font-semibold"
                      >
                        {tiers.map(t => (
                          <option key={t.id} value={t.id}>
                            Tier {t.level}: {t.name} ({t.shortCode}) - {t.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register User &amp; Sign In</span>
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500">Already registered? </span>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= MODE: PROFILE / SESSION MANAGER ================= */}
          {mode === 'profile' && currentUser?.isSignedIn && (
            <div className="space-y-5">
              {/* User Identity Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                     <div className="w-14 h-14 rounded-2xl bg-[#dceceb] text-[#176f78] border-2 border-white shadow-xs flex items-center justify-center text-base font-black">
                       {(currentUser.name || 'IE').split(' ').map(part => part[0]).slice(0, 2).join('')}
                     </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white text-[9px] font-bold">
                      ✓
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {currentUser.email || 'Corporate Session'}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {currentUser.authProvider?.toUpperCase() || 'SESSION'} AUTHENTICATED
                      </span>
                      {currentUser.employeeId && (
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: {currentUser.employeeId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                    setMode('login');
                  }}
                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition flex flex-col items-center gap-1 text-[10px] font-bold"
                  title="Sign out of this session"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Registered Profiles on This Device (Switch User) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-700">
                    Switch Active User Account:
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create User</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {registeredUsers.map(u => {
                    const isCurrent = u.email === currentUser.email;
                    return (
                      <div
                        key={u.id || u.email}
                        className={`p-3 rounded-xl border transition flex items-center justify-between ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#dceceb] text-[#176f78] flex items-center justify-center text-[10px] font-black">
                             {(u.name || 'IE').split(' ').map(part => part[0]).slice(0, 2).join('')}
                           </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSignIn({
                                isSignedIn: true,
                                name: u.name,
                                email: u.email,
                                avatarUrl: u.avatarUrl,
                                role: u.role,
                                tierId: u.tierId,
                                department: u.department,
                                employeeId: u.employeeId,
                                authProvider: u.authProvider,
                                loginTime: new Date().toISOString()
                              });
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Google Account Options */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GoogleIcon />
                  <span className="text-xs font-semibold text-slate-700">
                    Sign in with different Google ID
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('google_picker')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition shadow-2xs"
                >
                  Change Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
