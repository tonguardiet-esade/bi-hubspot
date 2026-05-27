'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Settings2, Check, ChevronDown, ListFilter, GripVertical, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function DraggableHeader({ header, table }: { header: any, table: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: header.column.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const headerText = typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : '';
  const isFilterable = headerText === 'Segmento' || headerText === 'Propietario';

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        "px-6 py-4 text-[10px] font-bold text-text-dim uppercase tracking-wider border-b border-card-border group relative",
        header.column.id === 'select' && "pl-8",
        isDragging && "z-50 bg-glass-hover"
      )}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-glass rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-1">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
          {isFilterable && header.column.id !== 'select' && (
            <HeaderFilterDropdown column={header.column} table={table} />
          )}
        </div>
      </div>
    </th>
  );
}

function HeaderFilterDropdown({ column, table }: { column: any, table: any }) {
  const uniqueValues = React.useMemo(() => {
    const values = new Set<string>();
    table.getPreFilteredRowModel().flatRows.forEach((row: any) => {
      const val = row.getValue(column.id);
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        values.add(String(val).trim());
      }
    });
    return Array.from(values).sort();
  }, [column.id, table.getPreFilteredRowModel().flatRows]);

  const filterValue = (column.getFilterValue() as string) ?? '';
  const isActive = filterValue !== '';

  return (
    <div className="relative inline-flex items-center justify-center ml-1">
      <select
        value={filterValue}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className={cn(
          "rounded cursor-pointer appearance-none bg-transparent border-0 outline-none p-0 m-0 transition-colors flex items-center justify-center text-center",
          isActive ? "text-accent" : "text-text-dim hover:text-text-secondary hover:bg-white/10"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isActive ? '%2300a3ff' : '%2364748b'}' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
          backgroundPosition: 'center',
          backgroundSize: '10px 10px',
          backgroundRepeat: 'no-repeat',
          width: '20px',
          height: '20px',
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
        title="Filtrar columna"
      >
        <option value="" className="bg-sidebar-bg text-text-dim">Todos</option>
        {uniqueValues.map((val) => (
          <option key={val} value={val} className="bg-sidebar-bg text-text-primary">
            {val}
          </option>
        ))}
      </select>
    </div>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableId: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableId,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(c => c.id as string));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columns) => {
        const oldIndex = columns.indexOf(active.id as string);
        const newIndex = columns.indexOf(over.id as string);
        return arrayMove(columns, oldIndex, newIndex);
      });
    }
  }

  React.useEffect(() => {
    const savePrefs = async () => {
      if (Object.keys(columnVisibility).length === 0 && columnOrder.length === columns.length) return;
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          visibleColumns: Object.keys(columnVisibility).filter(k => columnVisibility[k] === true),
          columnOrder,
        }),
      });
    };
    savePrefs();
  }, [columnVisibility, columnOrder, tableId]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
      columnFilters,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const [showColumns, setShowColumns] = useState(false);
  const selectedRowsCount = Object.keys(rowSelection).length;

  const exportToCSV = (rows: TData[], filename: string) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0] as object);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const val = (row as any)[header] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRowsData = table.getSelectedRowModel().rows.map(r => r.original);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap bg-glass p-4 rounded-2xl border border-card-border">
        <div className="flex items-center gap-4 flex-grow">
          <div className="input-wrapper max-w-md group">
            <Search className="input-icon w-4 h-4 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Buscar en todos los campos..." 
              className="input-with-icon pr-4 py-2.5 bg-sidebar-bg/50 border border-card-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all outline-none text-sm"
            />
          </div>
          <div className="h-8 w-px bg-card-border mx-2 hidden md:block" />
          <div className="text-xs font-medium text-text-dim px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
            {selectedRowsCount} seleccionados
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedRowsCount > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => exportToCSV(selectedRowsData, `export_seleccionados_${tableId}`)}
                className="btn btn-secondary py-1.5 text-xs"
              >
                Exportar Selección
              </button>
              <button className="btn btn-secondary py-1.5 text-xs text-error hover:bg-error/10">Eliminar</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowColumns(!showColumns)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Columnas
            <ChevronDown className={cn("w-4 h-4 transition-transform", showColumns && "rotate-180")} />
          </button>
          
          {showColumns && (
            <div className="absolute right-0 top-full mt-2 w-64 glass rounded-xl p-2 shadow-2xl border border-card-border z-50 animate-fade-in">
              <div className="text-[10px] font-bold text-text-dim uppercase p-2 tracking-widest border-bottom border-card-border mb-1">
                Visibilidad de Columnas
              </div>
              <div className="max-h-64 overflow-y-auto">
                {table.getAllLeafColumns().map((column) => {
                  return (
                    <div
                      key={column.id}
                      className="flex items-center gap-2 p-2 hover:bg-glass-hover rounded-lg cursor-pointer"
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        column.getIsVisible() ? "bg-accent border-accent" : "border-card-border"
                      )}>
                        {column.getIsVisible() && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-medium text-text-secondary capitalize">{column.id.replace(/_/g, ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-card-border">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-glass">
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableHeader key={header.id} header={header} table={table} />
                      ))}
                    </SortableContext>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-glass-hover transition-colors border-b border-card-border/50",
                      row.getIsSelected() && "bg-accent/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <td key={cell.id} className={cn("px-6 py-6 text-sm text-text-primary", idx === 0 && "pl-8")}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>
        
        <div className="px-6 py-4 flex items-center justify-between border-t border-card-border bg-glass/50">
          <div className="text-[10px] text-text-dim font-bold uppercase tracking-widest flex items-center gap-4">
            <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <span className="text-card-border">|</span>
            <span>Total: {data.length} registros</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 glass rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-glass-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 glass rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-glass-hover transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
