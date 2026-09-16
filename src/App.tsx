import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { shadcn } from '@clerk/themes';
import {
  SafeAuthProvider as ClerkProvider,
  SafeSignIn as SignIn,
  SafeSignUp as SignUp,
  useSafeAuth as useAuth,
  useSafeUser,
  CLERK_PUB_KEY
} from './lib/auth-provider';
import {
  getLocalAccountStore,
  setLocalAccountStore,
  fetchServerWorkspace,
  syncServerWorkspace,
  resetServerWorkspace,
  hasLegacyData,
  isLegacyMigrated,
  migrateLegacyDataToAccount,
  dismissLegacyPrompt
} from './lib/account-storage';
import { AccountDataMigrationBanner } from './components/AccountDataMigrationBanner';
import {
  AppStore,
  PageId,
  UiTheme,
  UiDensity,
  DashboardLayoutSettings,
  DEFAULT_DASHBOARD_LAYOUT,
  AutoUpdateSettings,
  LineEntry,
  TaskStatus,
  FloorNotification,
  ProductionLine,
  CustomRoleDefinition,
  RolePerson,
  TierDefinition,
  GoogleUserSession,
  CloudSyncState,
  TodoItem,
  TimeScheduleEntry,
  RegisteredUser
} from './types';
import { DEFAULT_STORE } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { LeanToolkitView } from './components/LeanToolkitView';
import { ChecklistView } from './components/ChecklistView';
import { LineDataView } from './components/LineDataView';
import { MonthlyView } from './components/MonthlyView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { LineManagementModal } from './components/LineManagementModal';
import { IEMonthlyKPIView } from './components/IEMonthlyKPIView';
import { NotificationsModal } from './components/NotificationsModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { TierCustomizerModal } from './components/TierCustomizerModal';
import { CreateCustomRoleModal } from './components/CreateCustomRoleModal';
import { TodoScheduleView } from './components/TodoScheduleView';
import { DatabaseManagerView } from './components/DatabaseManagerView';
import { AuthLandingPage } from './components/AuthLandingPage';
import {
  requestNotificationPermission,
  sendWebPushNotification,
  playIEAudioChime
} from './utils/notificationService';

const STORAGE_KEY = 'ie_daily_activity_store_v2';

const clerkPubKey = CLERK_PUB_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#176f78',
    colorForeground: '#17343a',
    colorMutedForeground: '#527078',
    colorDanger: '#b42318',
    colorBackground: '#fbfaf6',
    colorInput: '#ffffff',
    colorInputForeground: '#17343a',
    colorNeutral: '#d9d2c2',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbfaf6] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#17343a] font-bold',
    headerSubtitle: 'text-[#527078]',
    socialButtonsBlockButtonText: 'text-[#17343a] font-semibold',
    formFieldLabel: 'text-[#17343a] font-semibold',
    footerActionLink: 'text-[#176f78] font-bold',
    footerActionText: 'text-[#527078]',
    dividerText: 'text-[#527078]',
    identityPreviewEditButton: 'text-[#176f78]',
    formFieldSuccessText: 'text-emerald-700',
    alertText: 'text-rose-700',
    logoBox: 'h-12',
    logoImage: 'max-h-12 w-auto',
    socialButtonsBlockButton: 'border-[#d9d2c2] bg-white hover:bg-[#e6f0ee]',
    formButtonPrimary: 'bg-[#176f78] hover:bg-[#11535b] text-white',
    formFieldInput: 'border-[#d9d2c2] bg-white text-[#17343a]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#d9d2c2]',
    alert: 'border-rose-200 bg-rose-50',
    otpCodeFieldInput: 'border-[#d9d2c2] bg-white text-[#17343a]',
    formFieldRow: 'text-[#17343a]',
    main: 'bg-transparent',
  },
};

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#fbfaf6] px-5">
      <div className="text-center">
        <img src={`${basePath}/logo.svg`} alt="IE Daily Control" className="mx-auto h-12 w-auto" />
        <p className="mt-4 text-sm font-semibold text-[#527078]">Loading secure workspace…</p>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f1eee6] px-4 py-8">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f1eee6] px-4 py-8">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (isSignedIn) return <Redirect to="/app" />;

  return (
    <AuthLandingPage
      onSignIn={() => setLocation('/sign-in')}
      onSignUp={() => setLocation('/sign-up')}
    />
  );
}

function AuthenticatedApp() {
  const { user } = useSafeUser();
  const accountId = user?.primaryEmailAddress?.emailAddress || user?.id || 'guest_lead';
  const accountEmail = user?.primaryEmailAddress?.emailAddress || user?.fullName || accountId;

  // Track if legacy migration banner should be presented
  const [showMigrationBanner, setShowMigrationBanner] = useState<boolean>(() => {
    return hasLegacyData() && !isLegacyMigrated(accountId);
  });

  // Load initial store from account-isolated storage or default
  const [store, setStore] = useState<AppStore>(() => {
    const local = getLocalAccountStore(accountId);
    if (local) return local;
    return DEFAULT_STORE;
  });

  // Current view navigation
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [checklistDate, setChecklistDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Today ISO
  const todayISO = new Date().toISOString().slice(0, 10);

  // UI Theme & Density
  const [uiTheme, setUiTheme] = useState<UiTheme>('light');
  const [uiDensity, setUiDensity] = useState<UiDensity>('normal');
  const [dashLayout, setDashLayout] = useState<DashboardLayoutSettings>(() => {
    return {
      ...DEFAULT_DASHBOARD_LAYOUT,
      ...(store.dashboardLayout || {})
    };
  });

  // Auto-Update State
  const [autoUpdate, setAutoUpdate] = useState<AutoUpdateSettings>(() => {
    return {
      enabled: true,
      intervalSeconds: 30,
      simulateFloorFeed: false,
      notifyOnUpdate: false,
      ...(store.autoUpdate || {})
    };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Cloud Sync State
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState>(
    store.cloudSync || {
      status: 'live',
      lastCloudSync: new Date().toISOString(),
      syncFrequencySeconds: 15,
      cloudEndpoint: 'wss://ie-telemetry.apparelcloud.internal/v2',
      autoUploadEntries: true,
      latencyMs: 28,
      pendingUploadCount: 0
    }
  );

  // Active Role and Person
  const [currentRoleKey, setCurrentRoleKey] = useState<string>(store.activeRole || 'admin');
  const [customRoles, setCustomRoles] = useState<CustomRoleDefinition[]>(store.customRoles || []);
  const [rolePeople, setRolePeople] = useState<RolePerson[]>(store.rolePeople || []);

  // Tier-based system
  const [tiers, setTiers] = useState<TierDefinition[]>(store.tiers || []);
  const [activeTierId, setActiveTierId] = useState<string>(store.activeTierId || 'tier_1');

  // Google User Session
  const [googleUser, setGoogleUser] = useState<GoogleUserSession>(
    store.googleUser || {
      isSignedIn: false,
      name: 'IE Officer',
      email: '',
      role: 'admin',
      authProvider: 'demo'
    }
  );

  // Notifications
  const [notifications, setNotifications] = useState<FloorNotification[]>(store.notifications || []);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  // Modals visibility
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const [showTierCustomizerModal, setShowTierCustomizerModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);

  // Account switching effect: load isolated account data and sync with server
  useEffect(() => {
    let isCancelled = false;

    // 1. Instantly switch to this account's local storage
    const local = getLocalAccountStore(accountId);
    if (local) {
      setStore(local);
      setCurrentRoleKey(local.activeRole || 'admin');
      if (local.customRoles) setCustomRoles(local.customRoles);
      if (local.rolePeople) setRolePeople(local.rolePeople);
      if (local.tiers) setTiers(local.tiers);
      if (local.activeTierId) setActiveTierId(local.activeTierId);
      setShowMigrationBanner(false);
    } else {
      if (hasLegacyData() && !isLegacyMigrated(accountId)) {
        setShowMigrationBanner(true);
      } else {
        setShowMigrationBanner(false);
      }
      setStore(DEFAULT_STORE);
      setCurrentRoleKey('admin');
      setTiers(DEFAULT_STORE.tiers || []);
      setActiveTierId('tier_1');
    }

    // 2. Fetch server workspace for cross-device persistence
    fetchServerWorkspace(accountId).then(serverData => {
      if (!isCancelled && serverData) {
        setStore(serverData);
        setLocalAccountStore(accountId, serverData);
        if (serverData.activeRole) setCurrentRoleKey(serverData.activeRole);
        if (serverData.customRoles) setCustomRoles(serverData.customRoles);
        if (serverData.rolePeople) setRolePeople(serverData.rolePeople);
        if (serverData.tiers) setTiers(serverData.tiers);
        if (serverData.activeTierId) setActiveTierId(serverData.activeTierId);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [accountId]);

  // Save to account-isolated localStorage and sync to server
  useEffect(() => {
    const completeStore: AppStore = {
      ...store,
      activeRole: currentRoleKey,
      customRoles,
      rolePeople,
      tiers,
      activeTierId,
      googleUser,
      cloudSync: cloudSyncState,
      dashboardLayout: dashLayout,
      autoUpdate,
      notifications
    };

    setLocalAccountStore(accountId, completeStore);

    // Debounced sync to server for cross-device persistence
    const timer = setTimeout(() => {
      syncServerWorkspace(accountId, completeStore);
    }, 800);

    return () => clearTimeout(timer);
  }, [
    store,
    accountId,
    currentRoleKey,
    customRoles,
    rolePeople,
    tiers,
    activeTierId,
    googleUser,
    cloudSyncState,
    dashLayout,
    autoUpdate,
    notifications
  ]);

  // Apply theme class to body/html
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-forest', 'theme-sunset', 'theme-industrial');
    if (uiTheme !== 'light') {
      document.documentElement.classList.add(`theme-${uiTheme}`);
    }
  }, [uiTheme]);

  // Active Operational Tier is the Active System Role & Permission
  const activeTier = tiers.find(t => t.id === activeTierId) || tiers[0];

  const currentRoleDef =
    customRoles.find(r => r.key === currentRoleKey) ||
    {
      admin: { canEdit: true, canExport: true, canDelete: true, canManageLines: true },
      manager: { canEdit: true, canExport: true, canDelete: false, canManageLines: true },
      ie_officer: { canEdit: true, canExport: true, canDelete: false, canManageLines: false },
      supervisor: { canEdit: true, canExport: false, canDelete: false, canManageLines: false },
      trainee: { canEdit: false, canExport: true, canDelete: false, canManageLines: false },
      junior_ie: { canEdit: false, canExport: true, canDelete: false, canManageLines: false },
      auditor: { canEdit: false, canExport: true, canDelete: false, canManageLines: false }
    }[currentRoleKey] || { canEdit: true, canExport: true, canDelete: false };

  // System permissions derived directly from the Active Operational Tier
  const canEdit = activeTier?.canEdit ?? (activeTier ? (activeTier.level <= 3 && activeTier.canEditLineData !== false) : Boolean(currentRoleDef.canEdit));
  const canDelete = activeTier?.canDelete ?? (activeTier ? activeTier.level === 1 : Boolean(currentRoleDef.canDelete));
  const canManageLines = activeTier?.canManageLines ?? (activeTier ? activeTier.level <= 2 : true);
  const canApproveChecklist = activeTier ? Boolean(activeTier.canApproveChecklist) : true;

  const handleSelectTier = (tierId: string) => {
    setActiveTierId(tierId);
    const selectedTier = tiers.find(t => t.id === tierId);
    if (selectedTier) {
      const roleKey = selectedTier.systemRoleKey || (
        selectedTier.level === 1 ? 'admin' :
        selectedTier.level === 2 ? 'manager' :
        selectedTier.level === 3 ? 'ie_officer' : 'junior_ie'
      );
      setCurrentRoleKey(roleKey);
      setGoogleUser(u => ({ ...u, tierId, role: roleKey }));
    }
  };

  // Auto-Update Engine
  const autoUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoUpdate.enabled) {
      if (autoUpdateTimerRef.current) clearInterval(autoUpdateTimerRef.current);
      return;
    }

    const intervalMs = Math.max((autoUpdate.intervalSeconds || 15) * 1000, 3000);

    autoUpdateTimerRef.current = setInterval(() => {
      setIsSyncing(true);
      setLastSyncTime(new Date());

      // Simulate floor flow if enabled: occasionally increment line output or notify
      if (autoUpdate.simulateFloorFeed) {
        setStore(prev => {
          const todayEntries = prev.lineEntries.filter(e => e.date === todayISO);
          if (todayEntries.length === 0) return prev;

          // Pick a random entry to add 1-3 finished garments
          const randIdx = Math.floor(Math.random() * todayEntries.length);
          const targetEntry = todayEntries[randIdx];
          const increment = Math.floor(Math.random() * 3) + 1;
          const nextAchieved = (targetEntry.achievedProd || 0) + increment;
          const nextOutput = (targetEntry.dailyOutput || 0) + increment;
          const nextEff =
            targetEntry.targetProd > 0
              ? Math.round((nextAchieved / targetEntry.targetProd) * 100)
              : targetEntry.efficiency;

          const updatedEntries = prev.lineEntries.map(e =>
            e.id === targetEntry.id
              ? {
                  ...e,
                  achievedProd: nextAchieved,
                  dailyOutput: nextOutput,
                  efficiency: nextEff
                }
              : e
          );

          return {
            ...prev,
            lineEntries: updatedEntries
          };
        });
      }

      // Update cloud sync latency
      setCloudSyncState(prev => ({
        ...prev,
        status: 'live',
        lastCloudSync: new Date().toISOString(),
        latencyMs: Math.floor(Math.random() * 20) + 18
      }));

      setTimeout(() => setIsSyncing(false), 600);
    }, intervalMs);

    return () => {
      if (autoUpdateTimerRef.current) clearInterval(autoUpdateTimerRef.current);
    };
  }, [autoUpdate.enabled, autoUpdate.intervalSeconds, autoUpdate.simulateFloorFeed, todayISO]);

  // Handlers for Checklist
  const handleSaveChecklist = (date: string, tasks: TaskStatus[]) => {
    setStore(prev => {
      const updated = { ...prev.checklists, [date]: tasks };
      return { ...prev, checklists: updated };
    });
  };

  // Handlers for Line Entries
  const handleSaveLineEntry = (entry: LineEntry) => {
    setStore(prev => {
      const exists = prev.lineEntries.find(e => e.id === entry.id);
      const updated = exists
        ? prev.lineEntries.map(e => (e.id === entry.id ? entry : e))
        : [entry, ...prev.lineEntries];

      // Add a notification
      const newNotif: FloorNotification = {
        id: `notif_${Date.now()}`,
        title: `Line ${entry.lineNo} Production Captured`,
        message: `${entry.buyer} (${entry.style}) recorded with ${entry.efficiency}% efficiency.`,
        type: entry.efficiency >= 80 ? 'success' : 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setNotifications(n => [newNotif, ...n]);

      // Play audio chime
      playIEAudioChime(entry.efficiency >= 80 ? 'success' : 'chime');

      // Send browser push notification if permitted
      sendWebPushNotification(`IE Track: Line ${entry.lineNo}`, {
        body: `${entry.buyer} • ${entry.efficiency}% Efficiency Logged`
      });

      return { ...prev, lineEntries: updated };
    });
  };

  const handleDeleteLineEntry = (id: number) => {
    setStore(prev => ({
      ...prev,
      lineEntries: prev.lineEntries.filter(e => e.id !== id)
    }));
  };

  // Handlers for Master Lines
  const handleSaveLines = (lines: ProductionLine[]) => {
    setStore(prev => ({ ...prev, lines }));
  };

  // Handlers for Todos & Time Schedules
  const handleUpdateTodos = (todos: TodoItem[]) => {
    setStore(prev => ({ ...prev, todos }));
  };

  const handleUpdateTimeSchedules = (timeSchedules: TimeScheduleEntry[]) => {
    setStore(prev => ({ ...prev, timeSchedules }));
  };

  // Manual Force Sync
  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsSyncing(false);
      playIEAudioChime('chime');
    }, 600);
  };

  // Toggle Auto-Update
  const handleToggleAutoUpdate = () => {
    setAutoUpdate(prev => {
      const next = { ...prev, enabled: !prev.enabled };
      setStore(s => ({ ...s, autoUpdate: next }));
      return next;
    });
  };

  // Profile update
  const handleUpdateProfile = (profile: AppStore['profile']) => {
    setStore(prev => ({ ...prev, profile }));
  };

  // Register new user account
  const handleRegisterUser = (newUser: RegisteredUser) => {
    setStore(prev => {
      const existing = prev.registeredUsers || [];
      const updated = [newUser, ...existing.filter(u => u.email !== newUser.email)];
      return {
        ...prev,
        registeredUsers: updated
      };
    });
  };

  // Account migration handlers
  const handleMigrateLegacy = () => {
    const migrated = migrateLegacyDataToAccount(accountId);
    if (migrated) {
      setStore(migrated);
      if (migrated.activeRole) setCurrentRoleKey(migrated.activeRole);
      if (migrated.customRoles) setCustomRoles(migrated.customRoles);
      if (migrated.rolePeople) setRolePeople(migrated.rolePeople);
      if (migrated.tiers) setTiers(migrated.tiers);
      if (migrated.activeTierId) setActiveTierId(migrated.activeTierId);
      setShowMigrationBanner(false);
    }
  };

  const handleStartCleanDemo = () => {
    dismissLegacyPrompt(accountId);
    setStore(DEFAULT_STORE);
    setCurrentRoleKey('admin');
    setTiers(DEFAULT_STORE.tiers || []);
    setActiveTierId('tier_1');
    setLocalAccountStore(accountId, DEFAULT_STORE);
    syncServerWorkspace(accountId, DEFAULT_STORE);
    setShowMigrationBanner(false);
  };

  const handleDismissMigration = () => {
    dismissLegacyPrompt(accountId);
    setShowMigrationBanner(false);
  };

  // Reset to default demo data (isolated to active account)
  const handleResetToDemoData = () => {
    setStore(DEFAULT_STORE);
    setCurrentRoleKey('admin');
    setTiers(DEFAULT_STORE.tiers || []);
    setActiveTierId('tier_1');
    setLocalAccountStore(accountId, DEFAULT_STORE);
    resetServerWorkspace(accountId);
    alert(`Account workspace for ${accountEmail} has been reset to default plant demo data.`);
  };

  // Import full JSON
  const handleImportStoreJSON = (imported: AppStore) => {
    setStore(imported);
    if (imported.activeRole) setCurrentRoleKey(imported.activeRole);
    if (imported.tiers) setTiers(imported.tiers);
  };

  // Request push notification permission
  const handleRequestPushPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  };

  // Mark all notifications read
  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  // Role label lookup
  const currentRoleLabel =
    customRoles.find(r => r.key === currentRoleKey)?.title ||
    {
      admin: 'Operations Manager',
      ie_officer: 'IE Officer',
      supervisor: 'Floor Supervisor',
      trainee: 'IE Trainee',
      auditor: 'QA Auditor'
    }[currentRoleKey] || currentRoleKey;

  return (
    <div className="app-shell noise-overlay min-h-[100dvh] text-slate-900 pb-24 md:pb-16 selection:bg-teal-700 selection:text-white">
      {/* Primary Header */}
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        roleLabel={currentRoleLabel}
        currentRoleKey={currentRoleKey}
        uiTheme={uiTheme}
        onChangeTheme={setUiTheme}
        autoUpdate={autoUpdate}
        onToggleAutoUpdate={handleToggleAutoUpdate}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        onSelectRole={(key, name) => {
          setCurrentRoleKey(key);
          if (name) {
            setStore(s => ({ ...s, profile: { ...s.profile, name } }));
          }
        }}
        customRoles={customRoles}
        rolePeople={rolePeople}
        onOpenCreateCustomRole={() => setShowCreateRoleModal(true)}
        tiers={tiers}
        activeTierId={activeTierId}
        onSelectTier={handleSelectTier}
        onOpenTierCustomizer={() => setShowTierCustomizerModal(true)}
        googleUser={googleUser}
        onOpenGoogleAuth={() => setShowGoogleAuthModal(true)}
        onGoogleSignOut={() =>
          setGoogleUser({
            isSignedIn: false,
            name: 'IE Officer',
            email: '',
            role: 'ie_officer',
            authProvider: 'demo'
          })
        }
        cloudSyncState={cloudSyncState}
        onOpenCloudSync={() => setShowCloudSyncModal(true)}
      />

      {/* Account Isolation & Legacy Data Migration Notice */}
      {showMigrationBanner && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <AccountDataMigrationBanner
            accountId={accountId}
            accountEmail={accountEmail}
            onMigrate={handleMigrateLegacy}
            onStartFresh={handleStartCleanDemo}
            onDismiss={handleDismissMigration}
          />
        </div>
      )}

      {/* Main Page Routing */}
      <main>
        {currentPage === 'dashboard' && (
          <DashboardView
            store={store}
            today={todayISO}
            uiDensity={uiDensity}
            dashLayout={dashLayout}
            onNavigate={setCurrentPage}
            hideReportSections
            canEdit={canEdit}
            autoUpdate={autoUpdate}
            onToggleAutoUpdate={handleToggleAutoUpdate}
            onManualSync={handleManualSync}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
          />
        )}

        {currentPage === 'lean-toolkit' && (
          <LeanToolkitView
            accountId={accountId}
            availableLines={store.lines.map(l => l.lineNo)}
          />
        )}

        {currentPage === 'checklist' && (
          <ChecklistView
            store={store}
            today={todayISO}
            initialDate={checklistDate}
            canEdit={canEdit}
            onSaveChecklist={handleSaveChecklist}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'todo-schedule' && (
          <TodoScheduleView
            store={store}
            today={todayISO}
            onNavigate={setCurrentPage}
            currentRoleKey={currentRoleKey}
            onSelectRole={(key, name) => {
              setCurrentRoleKey(key);
              if (name) {
                setStore(s => ({ ...s, profile: { ...s.profile, name } }));
              }
            }}
            customRoles={customRoles}
            rolePeople={rolePeople}
            onOpenCreateCustomRole={() => setShowCreateRoleModal(true)}
            tiers={tiers}
            activeTierId={activeTierId}
            onSelectTier={handleSelectTier}
            onOpenTierCustomizer={() => setShowTierCustomizerModal(true)}
            onUpdateTodos={handleUpdateTodos}
            onUpdateTimeSchedules={handleUpdateTimeSchedules}
            canEdit={canEdit}
          />
        )}

        {currentPage === 'linedata' && (
          <LineDataView
            store={store}
            today={todayISO}
            canEdit={canEdit}
            onSaveLineEntry={handleSaveLineEntry}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'monthly' && (
          <MonthlyView
            store={store}
            today={todayISO}
            onNavigate={setCurrentPage}
            onSelectDateForChecklist={date => {
              setChecklistDate(date);
              setCurrentPage('checklist');
            }}
          />
        )}

        {currentPage === 'reports' && (
          <ReportsView
            store={store}
            today={todayISO}
            onNavigate={setCurrentPage}
            canDelete={canDelete}
            onDeleteLineEntry={handleDeleteLineEntry}
          />
        )}

        {currentPage === 'kpi-reports' && (
          <IEMonthlyKPIView
            store={store}
            today={todayISO}
            onNavigate={setCurrentPage}
            canEdit={canEdit}
          />
        )}

        {currentPage === 'line-management' && (
          <LineManagementModal
            lines={store.lines}
            onSaveLines={handleSaveLines}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'database' && (
          <DatabaseManagerView
            store={store}
            onNavigate={setCurrentPage}
            onUpdateStore={setStore}
            onDeleteLineEntry={handleDeleteLineEntry}
            onResetToDemo={handleResetToDemoData}
            canDelete={canDelete}
            accountId={accountId}
            accountEmail={accountEmail}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsView
            store={store}
            onUpdateProfile={handleUpdateProfile}
            uiTheme={uiTheme}
            onChangeTheme={setUiTheme}
            uiDensity={uiDensity}
            onChangeDensity={setUiDensity}
            dashLayout={dashLayout}
            onChangeDashLayout={setDashLayout}
            autoUpdate={autoUpdate}
            onChangeAutoUpdate={setAutoUpdate}
            onOpenGoogleAuth={() => setShowGoogleAuthModal(true)}
            onNavigate={setCurrentPage}
            onResetToDemoData={handleResetToDemoData}
            onImportStoreJSON={handleImportStoreJSON}
            accountId={accountId}
            accountEmail={accountEmail}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          onMarkAllRead={handleMarkAllNotifsRead}
          onClearAll={handleClearAllNotifs}
          onClose={() => setShowNotificationsModal(false)}
          onRequestPermission={handleRequestPushPermission}
          permissionStatus={notifPermission}
        />
      )}

      {/* Google & SSO Auth Modal */}
      {showGoogleAuthModal && (
        <GoogleAuthModal
          currentUser={googleUser}
          registeredUsers={store.registeredUsers}
          tiers={tiers}
          onSignIn={user => {
            setGoogleUser(u => ({ ...u, ...user, isSignedIn: true }));
            if (user.tierId) {
              handleSelectTier(user.tierId);
            }
          }}
          onSignOut={() =>
            setGoogleUser({
              isSignedIn: false,
              name: 'Guest Engineer',
              email: '',
              role: 'ie_officer',
              authProvider: 'demo'
            })
          }
          onRegisterUser={handleRegisterUser}
          onClose={() => setShowGoogleAuthModal(false)}
        />
      )}

      {/* Cloud Sync Modal */}
      {showCloudSyncModal && (
        <CloudSyncModal
          syncState={cloudSyncState}
          onUpdateSyncState={upd => setCloudSyncState(prev => ({ ...prev, ...upd }))}
          onForceSync={handleManualSync}
          onClose={() => setShowCloudSyncModal(false)}
        />
      )}

      {/* Tier Customizer Modal */}
      {showTierCustomizerModal && (
        <TierCustomizerModal
          tiers={tiers}
          onSaveTiers={setTiers}
          onClose={() => setShowTierCustomizerModal(false)}
        />
      )}

      {/* Create Custom Role Modal */}
      {showCreateRoleModal && (
        <CreateCustomRoleModal
          onSaveRole={role => setCustomRoles(prev => [...prev, role])}
          onClose={() => setShowCreateRoleModal(false)}
        />
      )}
    </div>
  );
}

function AuthenticatedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (!isSignedIn) return <Redirect to="/" />;

  return <AuthenticatedApp />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  const stripBase = (path: string) =>
    basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Welcome back',
            subtitle: 'Sign in to access your IE operations workspace'
          }
        },
        signUp: {
          start: {
            title: 'Create your IE workspace account',
            subtitle: 'Secure your daily production control workflow'
          }
        }
      }}
      routerPush={to => setLocation(stripBase(to))}
      routerReplace={to => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        {/* The optional wildcard is required for Clerk OAuth callback paths. */}
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/app" component={AuthenticatedRoute} />
        <Route path="/" component={HomeRedirect} />
        <Route component={() => <Redirect to="/" />} />
      </Switch>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
