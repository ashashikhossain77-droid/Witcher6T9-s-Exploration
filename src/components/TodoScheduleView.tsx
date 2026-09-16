import React, { useState } from 'react';
import {
  AppStore,
  TodoItem,
  TimeScheduleEntry,
  PageId,
  TierDefinition,
  CustomRoleDefinition,
  RolePerson
} from '../types';
import { ActiveRoleSwitcher } from './ActiveRoleSwitcher';
import {
  ArrowLeft,
  ListTodo,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Layers,
  Filter,
  Trash2,
  Check,
  User,
  Shield,
  Sliders,
  Sparkles
} from 'lucide-react';

interface TodoScheduleViewProps {
  store: AppStore;
  today: string;
  onNavigate: (page: PageId) => void;
  // Role & Tier props
  currentRoleKey: string;
  onSelectRole: (roleKey: string, personName?: string) => void;
  customRoles: CustomRoleDefinition[];
  rolePeople: RolePerson[];
  onOpenCreateCustomRole: () => void;
  tiers: TierDefinition[];
  activeTierId: string;
  onSelectTier: (tierId: string) => void;
  onOpenTierCustomizer: () => void;
  // Store Update Handlers
  onUpdateTodos: (todos: TodoItem[]) => void;
  onUpdateTimeSchedules: (schedules: TimeScheduleEntry[]) => void;
  canEdit: boolean;
}

export const TodoScheduleView: React.FC<TodoScheduleViewProps> = ({
  store,
  today,
  onNavigate,
  currentRoleKey,
  onSelectRole,
  customRoles,
  rolePeople,
  onOpenCreateCustomRole,
  tiers,
  activeTierId,
  onSelectTier,
  onOpenTierCustomizer,
  onUpdateTodos,
  onUpdateTimeSchedules,
  canEdit
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'schedule'>('todos');
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed' | 'my_role'>('all');
  const [scheduleDay, setScheduleDay] = useState<string>('Monday');

  // Todo modal / inline form state
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDesc, setNewTodoDesc] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoItem['priority']>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState<TodoItem['category']>('balancing');
  const [newTodoRole, setNewTodoRole] = useState(currentRoleKey);
  const [newTodoPerson, setNewTodoPerson] = useState('');
  const [newTodoLine, setNewTodoLine] = useState('18');
  const [newTodoTime, setNewTodoTime] = useState('14:00');

  // Schedule inline form
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedSlot, setNewSchedSlot] = useState('09:00 - 10:00');
  const [newSchedActivity, setNewSchedActivity] = useState('');
  const [newSchedLine, setNewSchedLine] = useState('18');
  const [newSchedNotes, setNewSchedNotes] = useState('');

  const todos = store.todos || [];
  const schedules = store.timeSchedules || [];

  // Active Tier
  const activeTier = tiers.find(t => t.id === activeTierId) || tiers[0];

  // Filtered todos
  const filteredTodos = todos.filter(t => {
    if (todoFilter === 'pending') return t.status !== 'completed';
    if (todoFilter === 'completed') return t.status === 'completed';
    if (todoFilter === 'my_role') return t.assignedToRole === currentRoleKey;
    return true;
  });

  const handleToggleTodo = (id: string) => {
    const updated = todos.map(t => {
      if (t.id === id) {
        const isDone = t.status === 'completed';
        return {
          ...t,
          status: (isDone ? 'pending' : 'completed') as TodoItem['status'],
          completedAt: isDone ? undefined : new Date().toISOString()
        };
      }
      return t;
    });
    onUpdateTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    if (!confirm('Delete this To-Do item?')) return;
    onUpdateTodos(todos.filter(t => t.id !== id));
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newItem: TodoItem = {
      id: `todo_${Date.now()}`,
      title: newTodoTitle.trim(),
      description: newTodoDesc.trim(),
      priority: newTodoPriority,
      category: newTodoCategory,
      assignedToRole: newTodoRole,
      assignedToPerson: newTodoPerson.trim() || 'Floor Engineer',
      tierLevel: activeTier?.level || 2,
      dueDate: today,
      dueTime: newTodoTime,
      lineNo: newTodoLine,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onUpdateTodos([newItem, ...todos]);
    setNewTodoTitle('');
    setNewTodoDesc('');
    setShowAddTodo(false);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedActivity.trim()) return;

    const [start, end] = newSchedSlot.split('-').map(s => s.trim());
    const newItem: TimeScheduleEntry = {
      id: `sched_${Date.now()}`,
      dayOfWeek: scheduleDay,
      timeSlot: newSchedSlot,
      startTime: start || '09:00',
      endTime: end || '10:00',
      activity: newSchedActivity.trim(),
      roleKey: currentRoleKey,
      assignedPerson: store.profile.name || 'IE Team',
      lineNo: newSchedLine,
      mandatory: true,
      tierLevel: activeTier?.level || 2,
      status: 'pending',
      notes: newSchedNotes.trim()
    };

    onUpdateTimeSchedules([...schedules, newItem]);
    setNewSchedActivity('');
    setNewSchedNotes('');
    setShowAddSchedule(false);
  };

  const handleToggleSchedule = (id: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        const isDone = s.status === 'completed';
        return {
          ...s,
          status: (isDone ? 'pending' : 'completed') as TimeScheduleEntry['status']
        };
      }
      return s;
    });
    onUpdateTimeSchedules(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    if (!confirm('Remove this schedule entry?')) return;
    onUpdateTimeSchedules(schedules.filter(s => s.id !== id));
  };

  // Day schedules
  const daySchedules = schedules.filter(
    s => s.dayOfWeek.toLowerCase() === scheduleDay.toLowerCase()
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Role Delegation, To-Do &amp; Time Schedules
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Delegate action items across engineering roles, prioritize floor bottlenecks, and coordinate daily timetables.
        </p>
      </div>

      {/* Active System Role & Operational Tier Switcher */}
      <div className="mb-8">
        <ActiveRoleSwitcher
          tiers={tiers}
          activeTierId={activeTierId}
          onSelectTier={onSelectTier}
          onOpenTierCustomizer={onOpenTierCustomizer}
          currentRole={currentRoleKey}
          onSelectRole={onSelectRole}
          customRoles={customRoles}
          rolePeople={rolePeople}
          onOpenCreateCustomRole={onOpenCreateCustomRole}
        />
      </div>

      {/* View Toggle Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'todos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            IE Floor To-Do Action Items ({todos.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Shift Time Schedule ({schedules.length})
          </button>
        </div>

        {activeTab === 'todos' && (
          <button
            onClick={() => setShowAddTodo(!showAddTodo)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 border border-blue-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add To-Do
          </button>
        )}

        {activeTab === 'schedule' && (
          <button
            onClick={() => setShowAddSchedule(!showAddSchedule)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 border border-blue-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Slot
          </button>
        )}
      </div>

      {/* ================= TO-DO VIEW ================= */}
      {activeTab === 'todos' && (
        <div>
          {/* Add To-Do Drawer / Card */}
          {showAddTodo && (
            <form
              onSubmit={handleCreateTodo}
              className="bg-white rounded-3xl border border-blue-200 p-5 mb-6 shadow-md animate-in fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  New To-Do Action Item
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddTodo(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Conduct video motion analysis on Line 18 sleeve join"
                    value={newTodoTitle}
                    onChange={e => setNewTodoTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Production Line</label>
                  <input
                    type="text"
                    placeholder="e.g. 18"
                    value={newTodoLine}
                    onChange={e => setNewTodoLine(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTodoPriority}
                    onChange={e => setNewTodoPriority(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Escalation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newTodoCategory}
                    onChange={e => setNewTodoCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                  >
                    <option value="balancing">Line Balancing</option>
                    <option value="bottleneck">Bottleneck Flow</option>
                    <option value="smv_study">SMV / Time Study</option>
                    <option value="5s">Floor 5S &amp; Ergonomics</option>
                    <option value="meeting">Meeting / Audit</option>
                    <option value="report">KPI Report</option>
                    <option value="general">General Action</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={newTodoTime}
                    onChange={e => setNewTodoTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Action Description &amp; Scope</label>
                  <input
                    type="text"
                    placeholder="Detailed steps, poka-yoke attachments, or expected cycle time target"
                    value={newTodoDesc}
                    onChange={e => setNewTodoDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTodo(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
                >
                  Create To-Do
                </button>
              </div>
            </form>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setTodoFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                todoFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setTodoFilter('pending')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                todoFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Pending ({todos.filter(t => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setTodoFilter('completed')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                todoFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Completed ({todos.filter(t => t.status === 'completed').length})
            </button>
            <button
              onClick={() => setTodoFilter('my_role')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                todoFilter === 'my_role'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              My Role Tasks
            </button>
          </div>

          {/* To-Do List */}
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              No tasks found for this filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map(item => {
                const isDone = item.status === 'completed';
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all flex items-start justify-between gap-3 ${
                      isDone
                        ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                        : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTodo(item.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition mt-0.5 shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              item.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-700'
                                : item.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.priority}
                          </span>
                          {item.lineNo && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              L{item.lineNo}
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {item.description}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span>
                            Assigned: <strong className="text-slate-700">{item.assignedToPerson || item.assignedToRole}</strong>
                          </span>
                          <span>•</span>
                          <span>Due: <strong>{item.dueTime || 'End of Shift'}</strong></span>
                          <span>•</span>
                          <span className="capitalize">{item.category}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(item.id)}
                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SCHEDULE VIEW ================= */}
      {activeTab === 'schedule' && (
        <div>
          {/* Day of Week Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
              <button
                key={d}
                onClick={() => setScheduleDay(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  scheduleDay === d
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Add Schedule Form */}
          {showAddSchedule && (
            <form
              onSubmit={handleCreateSchedule}
              className="bg-white rounded-3xl border border-blue-200 p-5 mb-6 shadow-md"
            >
              <h3 className="font-bold text-slate-900 text-sm mb-3">Add {scheduleDay} Schedule Slot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newSchedSlot}
                    onChange={e => setNewSchedSlot(e.target.value)}
                    placeholder="08:00 - 09:00"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Line Number</label>
                  <input
                    type="text"
                    value={newSchedLine}
                    onChange={e => setNewSchedLine(e.target.value)}
                    placeholder="18"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity</label>
                  <input
                    type="text"
                    value={newSchedActivity}
                    onChange={e => setNewSchedActivity(e.target.value)}
                    placeholder="e.g. Line Morning Balancing Audit"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchedule(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          )}

          {/* Schedule List */}
          {daySchedules.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              No schedule items registered for {scheduleDay}. Click "Add Slot" to configure.
            </div>
          ) : (
            <div className="space-y-3">
              {daySchedules.map(entry => {
                const isDone = entry.status === 'completed';
                return (
                  <div
                    key={entry.id}
                    className={`rounded-2xl border p-4 transition-all flex items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSchedule(entry.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-[120px]">
                        <div className="font-mono text-xs font-bold text-blue-700">{entry.timeSlot}</div>
                        <div className="text-[10px] text-slate-400">{entry.assignedPerson}</div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-slate-900">{entry.activity}</div>
                        {entry.notes && <div className="text-xs text-slate-500 mt-0.5">{entry.notes}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {entry.lineNo && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          Line {entry.lineNo}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteSchedule(entry.id)}
                        className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
