'use client';

import { Settings, Shield, Bell, Database, Lock, Eye } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
          <span className="p-3 rounded-2xl bg-accent/10 text-accent">⚙️</span>
          Configuración del Sistema
        </h1>
        <p className="text-text-secondary mt-2 max-w-xl">Administra las preferencias globales, seguridad y conexiones de datos de la plataforma HubSpot BI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent" />
            Seguridad y Acceso
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-glass">
              <div>
                <div className="font-bold">Autenticación en dos pasos</div>
                <div className="text-xs text-text-dim">Añade una capa extra de seguridad.</div>
              </div>
              <div className="w-10 h-6 bg-glass rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-text-dim rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-glass">
              <div>
                <div className="font-bold">Registro por Invitación</div>
                <div className="text-xs text-text-dim">Solo usuarios invitados pueden unirse.</div>
              </div>
              <div className="w-10 h-6 bg-accent rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Database className="w-5 h-5 text-success" />
            Fuente de Datos
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-glass border border-card-border">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-sm">Base de Datos Principal</div>
                <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-black uppercase">Conectado</span>
              </div>
              <div className="text-xs text-text-dim mb-4">SQLite (Local Development)</div>
              <button className="btn btn-secondary w-full text-xs py-2">Probar Conexión</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
