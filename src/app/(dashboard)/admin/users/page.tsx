'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, UserX, 
  Ban, CheckCircle2, Mail, Clock,
  Search, Filter, Loader2, MoreVertical
} from 'lucide-react';
import { clsx } from 'clsx';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteResult, setInviteResult] = useState<{success: boolean, token?: string} | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'USER' }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteResult({ success: true, token: data.token });
        setInviteEmail('');
      } else {
        setInviteResult({ success: false });
      }
    } catch (err) {
      setInviteResult({ success: false });
    } finally {
      setInviting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-accent" />
            Gestión de Usuarios
          </h1>
          <p className="text-text-secondary mt-1">Administra accesos, roles y seguridad del sistema.</p>
        </div>
        <button 
          onClick={() => {
            setShowInviteModal(true);
            setInviteResult(null);
          }}
          className="btn btn-primary"
        >
          <UserPlus className="w-5 h-5" />
          Invitar Usuario
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="text-text-dim text-xs font-bold uppercase tracking-widest mb-2">Total Usuarios</div>
          <div className="text-3xl font-bold">{users.length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-text-dim text-xs font-bold uppercase tracking-widest mb-2">Activos</div>
          <div className="text-3xl font-bold text-success">{users.filter(u => u.status === 'ACTIVE').length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-text-dim text-xs font-bold uppercase tracking-widest mb-2">Pendientes</div>
          <div className="text-3xl font-bold text-warning">{users.filter(u => u.status === 'PENDING').length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-text-dim text-xs font-bold uppercase tracking-widest mb-2">Admins</div>
          <div className="text-3xl font-bold text-accent">{users.filter(u => u.role === 'ADMIN').length}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 glass p-4 rounded-xl">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input 
            type="text" 
            className="w-full pl-11 bg-transparent border-none focus:ring-0" 
            placeholder="Buscar por email o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary py-2 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* User Table */}
      <div className="glass rounded-2xl overflow-hidden border border-card-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-glass">
              <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-wider">Último Acceso</th>
              <th className="px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
                </td>
              </tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-glass-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                    user.role === 'ADMIN' ? "bg-accent/10 text-accent" : "bg-text-dim/10 text-text-dim"
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "flex items-center gap-2 text-sm",
                    user.status === 'ACTIVE' ? "text-success" : user.status === 'PENDING' ? "text-warning" : "text-error"
                  )}>
                    <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", user.status === 'ACTIVE' ? "bg-success" : user.status === 'PENDING' ? "bg-warning" : "bg-error")} />
                    {user.status === 'ACTIVE' ? 'Activo' : user.status === 'PENDING' ? 'Pendiente' : 'Bloqueado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-glass rounded-lg text-text-dim hover:text-text-primary transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-8 relative">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-accent" />
              Invitar Usuario
            </h2>
            
            {!inviteResult ? (
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Email del invitado</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input 
                      type="email" 
                      required 
                      className="w-full pl-11" 
                      placeholder="ejemplo@hubspot.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary flex-grow">Cancelar</button>
                  <button type="submit" disabled={inviting} className="btn btn-primary flex-grow">
                    {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generar Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                {inviteResult.success ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                    <div>
                      <p className="font-bold text-lg">Invitación Generada</p>
                      <p className="text-text-secondary text-sm mt-1">Copia este link para el usuario:</p>
                    </div>
                    <div className="glass p-3 rounded-lg text-xs break-all font-mono select-all">
                      {window.location.origin}/register?token={inviteResult.token}
                    </div>
                  </>
                ) : (
                  <>
                    <UserX className="w-16 h-16 text-error mx-auto" />
                    <p className="font-bold">Error al generar invitación</p>
                  </>
                )}
                <button onClick={() => setShowInviteModal(false)} className="btn btn-primary w-full">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
