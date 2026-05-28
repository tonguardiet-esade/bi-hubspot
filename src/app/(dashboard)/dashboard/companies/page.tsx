'use client';

import { useEffect, useState, useMemo } from 'react';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, Download, Upload, FileDown, X, Filter } from 'lucide-react';
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

// ─── Admin check (reads JWT role from /api/auth/me) ──────────────────────────
function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.role === 'ADMIN') setIsAdmin(true); })
      .catch(() => {});
  }, []);
  return isAdmin;
}

// ─── CSV template columns ─────────────────────────────────────────────────────
const TEMPLATE_HEADERS = [
  'ID de registro',
  'Nombre de la empresa',
  'Propietario del registro de empresa',
  'Fecha de creación',
  'Segmento de Mercado',
  'Ciudad',
  'Sector',
];

function downloadTemplate() {
  const exampleRow = ['EMP-001', 'Empresa Ejemplo S.L.', 'Juan García', '2024-01-15', 'Enterprise', 'Barcelona', 'Software'];
  const csvContent = [TEMPLATE_HEADERS.join(','), exampleRow.join(',')].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'plantilla_empresas.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importPreview, setImportPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Filters
  const [filterCiudad, setFilterCiudad] = useState('');
  const [filterSector, setFilterSector] = useState('');

  const isAdmin = useIsAdmin();

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/legacy/dashboard_data.json')
      .then(res => { if (!res.ok) throw new Error('Not found'); return res.json(); })
      .then(json => { setData(json.companies_raw); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Unique filter options ───────────────────────────────────────────────────
  const ciudadOptions = useMemo(() => {
    const vals = [...new Set(data.map(d => d['Ciudad']).filter(Boolean))] as string[];
    return vals.sort();
  }, [data]);

  const sectorOptions = useMemo(() => {
    const vals = [...new Set(data.map(d => d['Sector']).filter(Boolean))] as string[];
    return vals.sort();
  }, [data]);

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filterCiudad && row['Ciudad'] !== filterCiudad) return false;
      if (filterSector && row['Sector'] !== filterSector) return false;
      return true;
    });
  }, [data, filterCiudad, filterSector]);

  const activeFilters = (filterCiudad ? 1 : 0) + (filterSector ? 1 : 0);

  // ── Import with field mapping ───────────────────────────────────────────────
  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const rows = lines.slice(1, 4).map(l =>
        l.split(',').map(v => v.replace(/^"|"$/g, '').trim())
      );
      setImportPreview({ headers, rows });
      // Auto-map if header names match exactly
      const autoMap: Record<string, string> = {};
      TEMPLATE_HEADERS.forEach(target => {
        const match = headers.find(h => h.toLowerCase() === target.toLowerCase());
        if (match) autoMap[target] = match;
      });
      setImportMapping(autoMap);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
    setIsImportModalOpen(true);
  };

  const handleConfirmImport = () => {
    if (!importPreview || !importFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const fileHeaders = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const newRecords: Company[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const record: any = {};
        TEMPLATE_HEADERS.forEach(target => {
          const srcHeader = importMapping[target];
          if (srcHeader) {
            const idx = fileHeaders.indexOf(srcHeader);
            record[target] = idx >= 0 ? values[idx] : '';
          } else {
            record[target] = '';
          }
        });
        if (!record['ID de registro']) {
          record['ID de registro'] = Math.random().toString(36).substring(7);
        }
        newRecords.push(record);
      }
      setData(prev => [...newRecords, ...prev]);
      alert(`${newRecords.length} registres importats correctament`);
      setIsImportModalOpen(false);
      setImportPreview(null);
      setImportFile(null);
    };
    reader.readAsText(importFile, 'UTF-8');
  };

  // ── Create company ──────────────────────────────────────────────────────────
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Empresa creada correctament (Simulació)');
    setIsModalOpen(false);
  };

  // ── Export CSV (admin only) ─────────────────────────────────────────────────
  const exportAll = () => {
    if (filteredData.length === 0) return;
    const headers = TEMPLATE_HEADERS;
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
        headers.map(header => {
          const val = (row as any)[header] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'empresas_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            <span className="p-3 rounded-2xl bg-accent/10 text-accent">🏢</span>
            Gestió d&apos;Empreses
          </h1>
          <p className="text-text-secondary mt-2 max-w-xl">
            Explora, segmenta i gestiona la base de dades completa de comptes corporatius amb eines d&apos;anàlisi dinàmic.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          {/* Template download */}
          <button onClick={downloadTemplate} className="btn btn-secondary" title="Descarrega plantilla CSV">
            <FileDown className="w-4 h-4" />
            Plantilla
          </button>
          {/* Import */}
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportFileSelect} />
          </label>
          {/* Export — admin only */}
          {isAdmin && (
            <button onClick={exportAll} className="btn btn-secondary" id="export-csv-btn">
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            + Nova Empresa
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Filtres</span>
          {activeFilters > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-black">
              {activeFilters} actiu{activeFilters > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Ciudad filter */}
          <div className="space-y-1.5 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Ciudad</label>
            <div className="relative">
              <select
                id="filter-ciudad"
                value={filterCiudad}
                onChange={e => setFilterCiudad(e.target.value)}
                className="w-full appearance-none pr-8 rounded-xl border border-card-border bg-glass text-text-primary text-sm px-3 py-2 focus:outline-none focus:border-accent"
              >
                <option value="">Totes les ciutats</option>
                {ciudadOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Sector filter */}
          <div className="space-y-1.5 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Sector</label>
            <div className="relative">
              <select
                id="filter-sector"
                value={filterSector}
                onChange={e => setFilterSector(e.target.value)}
                className="w-full appearance-none pr-8 rounded-xl border border-card-border bg-glass text-text-primary text-sm px-3 py-2 focus:outline-none focus:border-accent"
              >
                <option value="">Tots els sectors</option>
                {sectorOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {/* Clear */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterCiudad(''); setFilterSector(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-white border border-card-border hover:border-white/20 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Netejar filtres
            </button>
          )}
          {/* Count */}
          <div className="ml-auto text-right">
            <span className="text-2xl font-black text-white">{filteredData.length.toLocaleString()}</span>
            <span className="text-text-dim text-xs font-bold ml-1">/ {data.length.toLocaleString()} empreses</span>
          </div>
        </div>
      </div>

      {/* ── Create Company Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Donar d'Alta Nova Empresa">
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Nom de l&apos;Empresa</label>
            <input required type="text" className="w-full" placeholder="Ex: Tech Spain S.L." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Sector</label>
              <input type="text" className="w-full" placeholder="Ex: Software" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Ciutat</label>
              <input type="text" className="w-full" placeholder="Ex: Barcelona" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-dim">Segment</label>
            <select className="w-full">
              <option>Enterprise</option>
              <option>Mid-Market</option>
              <option>SMB</option>
              <option>Startup</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-grow">Cancel·lar</button>
            <button type="submit" className="btn btn-primary flex-grow">Crear Empresa</button>
          </div>
        </form>
      </Modal>

      {/* ── Import Mapping Modal ── */}
      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportPreview(null); }} title="Importar CSV — Mapeig de camps">
        {importPreview && (
          <div className="space-y-5">
            <p className="text-sm text-text-secondary">
              Assigna les columnes del teu fitxer als camps del sistema. Les coincidències exactes s&apos;han detectat automàticament.
            </p>

            {/* Mapping table */}
            <div className="space-y-3">
              {TEMPLATE_HEADERS.map(target => (
                <div key={target} className="flex items-center gap-3">
                  <div className="w-48 text-xs font-bold text-text-dim truncate">{target}</div>
                  <div className="text-text-dim">←</div>
                  <select
                    value={importMapping[target] || ''}
                    onChange={e => setImportMapping(prev => ({ ...prev, [target]: e.target.value }))}
                    className="flex-grow rounded-xl border border-card-border bg-glass text-text-primary text-sm px-3 py-2 focus:outline-none focus:border-accent"
                  >
                    <option value="">(Ignorar)</option>
                    {importPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-card-border overflow-hidden">
              <div className="px-4 py-2 bg-glass text-[10px] font-bold uppercase tracking-widest text-text-dim">Previsualització (3 files)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-card-border">
                      {importPreview.headers.map(h => (
                        <th key={h} className="px-3 py-2 text-left text-text-dim font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-card-border/50">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-text-secondary whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setIsImportModalOpen(false); setImportPreview(null); }} className="btn btn-secondary flex-grow">
                Cancel·lar
              </button>
              <button type="button" onClick={handleConfirmImport} className="btn btn-primary flex-grow">
                Confirmar importació
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Data Table ── */}
      {loading ? (
        <div className="h-96 glass rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-text-dim font-bold uppercase tracking-widest text-xs">Carregant Intel·ligència...</p>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} tableId="companies" />
      )}
    </div>
  );
}
