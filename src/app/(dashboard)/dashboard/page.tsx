'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Activity, 
  ArrowUpRight,
  ChevronRight,
  Globe,
  PieChart,
  Database
} from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/legacy/dashboard_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Data not found');
        return res.json();
      })
      .then(json => setStats(json))
      .catch(err => {
        console.error(err);
        setStats(false); // Signal error state
      });
  }, []);

  if (stats === null) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  );

  if (stats === false) return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="glass-card p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
          <Database className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Datos no encontrados</h2>
          <p className="text-text-secondary mt-2">No se ha podido cargar el archivo `dashboard_data.json`. Por favor, verifica que el archivo existe en `public/legacy/`.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Resumen Ejecutivo</h1>
          <p className="text-text-secondary mt-1">Inteligencia de negocio y métricas clave en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-xs font-bold text-text-dim uppercase tracking-widest">
          <Activity className="w-4 h-4 text-success" />
          Sistema Operativo
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Empresas', value: stats.total_companies.toLocaleString(), icon: Building2, color: 'text-accent', trend: '+12%' },
          { label: 'Contactos', value: stats.total_contacts.toLocaleString(), icon: Users, color: 'text-success', trend: '+8%' },
          { label: 'Ratio C/E', value: (stats.total_contacts / stats.total_companies).toFixed(1), icon: TrendingUp, color: 'text-warning', trend: 'Estable' },
          { label: 'Salud Datos', value: '99.2%', icon: Activity, color: 'text-purple-400', trend: '+0.4%' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-glass ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg">{kpi.trend}</span>
            </div>
            <div className="text-text-dim text-xs font-bold uppercase tracking-widest mb-1">{kpi.label}</div>
            <div className="text-3xl font-black text-white tracking-tighter">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Segments */}
        <div className="glass-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent" />
              Segmentos de Mercado
            </h3>
            <button className="text-xs font-bold text-accent flex items-center gap-1 hover:underline">
              Ver detalle <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-6">
            {stats.companies_by_segment.map((segment: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-text-secondary">{segment.name}</span>
                  <span className="font-bold">{segment.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-glass rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-blue-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-warning" />
              Top Ciudades
            </h3>
          </div>
          <div className="space-y-4">
            {stats.top_cities.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-glass transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning text-xs font-bold">
                    #{i + 1}
                  </div>
                  <span className="font-bold text-sm">{item.city}</span>
                </div>
                <span className="text-text-dim font-bold text-xs">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
