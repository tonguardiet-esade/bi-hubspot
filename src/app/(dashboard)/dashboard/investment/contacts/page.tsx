'use client';

import { useEffect, useState, useMemo } from 'react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { User, Mail, Phone, Calendar, ArrowUpRight, Download, Upload } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface Contact {
  "ID de registro": string;
  "Nombre"?: string;
  "Apellidos"?: string;
  "Correo"?: string;
  "Número de teléfono"?: string;
  "Propietario del contacto"?: string;
  "Fecha de creación"?: string;
  "Segmento de Mercado"?: string;
}

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Contacto creado correctamente (Simulación)');
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
    fetch('/legacy/investment_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        setData(json.contacts_raw || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<Contact>[]>(() => [
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
    },
    {
      accessorFn: (row) => `${row.Nombre || ''} ${row.Apellidos || ''}`,
      id: 'Nombre Completo',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success font-bold text-xs">
            {(row.getValue('Nombre Completo') as string)?.[0] || 'U'}
          </div>
          <span className="font-bold text-white">{row.getValue('Nombre Completo')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'Correo',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-text-secondary">
          <Mail className="w-3.5 h-3.5" />
          {row.getValue('Correo')}
        </div>
      ),
    },
    {
      accessorKey: 'Número de teléfono',
      header: 'Teléfono',
      cell: ({ row }) => {
        const phone = row.getValue('Número de teléfono') as string;
        return (
          <div className="flex items-center gap-2 text-text-secondary">
            {phone ? (
              <>
                <Phone className="w-3.5 h-3.5" />
                {phone}
              </>
            ) : (
              <span className="text-text-dim/40">—</span>
            )}
          </div>
        );
      },
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
      accessorKey: 'Propietario del contacto',
      header: 'Propietario',
    },
    {
      accessorKey: 'Fecha de creación',
      header: 'Creado',
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
    link.setAttribute('download', 'todos_los_contactos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            <span className="p-3 rounded-2xl bg-success/10 text-success">👤</span>
            Contactos de Inversión
          </h1>
          <p className="text-text-secondary mt-2 max-w-xl">Base de datos de perfiles clave para oportunidades de inversión y capital de riesgo.</p>
        </div>
        <div className="flex gap-3">
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={exportAll} className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Exportar Listado
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            + Nuevo Contacto
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Dar de Alta Nuevo Contacto"
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Nombre</label>
              <input required type="text" className="w-full" placeholder="Ej: Marc" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Apellidos</label>
              <input required type="text" className="w-full" placeholder="Ej: Rossi" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Correo Electrónico</label>
            <input required type="email" className="w-full" placeholder="ejemplo@hubspot.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Segmento</label>
            <select className="w-full">
              <option>Enterprise</option>
              <option>Mid-Market</option>
              <option>SMB</option>
              <option>Freelance</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-grow">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-grow">Crear Contacto</button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="h-96 glass rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-success/20 border-t-success rounded-full animate-spin" />
            <p className="text-text-dim font-bold uppercase tracking-widest text-xs">Sincronizando Directorio...</p>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={data} tableId="contacts" />
      )}
    </div>
  );
}
