'use client';

import { useEffect, useState, useMemo } from 'react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, Search, Filter, Download, ArrowUpRight, Upload } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface Company {
  "ID de registro": string;
  "Nombre de la empresa"?: string;
  "Propietario del registro de empresa"?: string;
  "Fecha de creación"?: string;
  "Segmento de Mercado"?: string;
  "Ciudad"?: string;
  "Sector"?: string;
}

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Empresa creada correctamente (Simulación)');
    setIsModalOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;
      
      const headers = lines[0].split(',');
      const newRecords: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const cleanLine = lines[i].trim().replace(/^"|"$/g, '');
        const values = cleanLine.split('","').map(val => val.replace(/""/g, '"'));
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        if (!record["ID de registro"]) {
          record["ID de registro"] = Math.random().toString(36).substring(7);
        }
        newRecords.push(record);
      }
      
      setData(prev => [...newRecords, ...prev]);
      alert(`${newRecords.length} registros importados correctamente (Simulación)`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetch('/legacy/dashboard_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        setData(json.companies_raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<Company>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'Nombre de la empresa',
      header: 'Empresa',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-white">{row.getValue('Nombre de la empresa') || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'Segmento de Mercado',
      header: 'Segmento',
      cell: ({ row }) => (
        <span className="px-2.5 py-1 rounded-full bg-glass text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          {row.getValue('Segmento de Mercado')}
        </span>
      ),
    },
    {
      accessorKey: 'Propietario del registro de empresa',
      header: 'Propietario',
    },
    {
      accessorKey: 'Ciudad',
      header: 'Ciudad',
    },
    {
      accessorKey: 'Sector',
      header: 'Sector',
    },
  ], []);

  const exportAll = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const val = (row as any)[header] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'todas_las_empresas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            <span className="p-3 rounded-2xl bg-accent/10 text-accent">🏢</span>
            Gestión de Empresas
          </h1>
          <p className="text-text-secondary mt-2 max-w-xl">Explora, segmenta y gestiona la base de datos completa de cuentas corporativas con herramientas de análisis dinámico.</p>
        </div>
        <div className="flex gap-3">
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={exportAll} className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            + Nueva Empresa
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Dar de Alta Nueva Empresa"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Nombre de la Empresa</label>
            <input required type="text" className="w-full" placeholder="Ej: Tech Spain S.L." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Sector</label>
              <input type="text" className="w-full" placeholder="Ej: Software" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Ciudad</label>
              <input type="text" className="w-full" placeholder="Ej: Barcelona" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Segmento</label>
            <select className="w-full">
              <option>Enterprise</option>
              <option>Mid-Market</option>
              <option>SMB</option>
              <option>Startup</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-grow">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-grow">Crear Empresa</button>
          </div>
        </form>
      </Modal>

      {/* Dynamic DataTable */}
      {loading ? (
        <div className="h-96 glass rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-text-dim font-bold uppercase tracking-widest text-xs">Cargando Inteligencia...</p>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={data} tableId="companies" />
      )}
    </div>
  );
}
