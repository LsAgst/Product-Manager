import { type ChangeEvent } from "react";
import type { Category } from "../types/api";

interface FiltersBarProps {
  search: string;
  selectedCategoryId: string;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function FiltersBar({
  search,
  selectedCategoryId,
  categories,
  onSearchChange,
  onCategoryChange,
  onApply,
  onClear,
  disabled = false,
  compact = false
}: FiltersBarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(event.target.value);
  };

  return (
    <section
      className={
        compact
          ? "mb-3 rounded-[12px] border border-slate-200 bg-slate-50 p-3"
          : "mb-4 rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
      }
    >
      {compact ? null : (
        <div>
          <h2 className="mb-3.5 text-[1.1rem] font-semibold">Filtros</h2>
        </div>
      )}

      <div className={compact ? "grid gap-3 lg:grid-cols-[1.4fr_1fr_auto] lg:items-end" : "grid gap-3 sm:grid-cols-2"}>
        <label className="mb-2.5 block text-[0.92rem] font-semibold">
          Busca
          <input
            className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Nome ou descricao"
            disabled={disabled}
          />
        </label>
        <label className="mb-2.5 block text-[0.92rem] font-semibold">
          Categoria
          <select
            className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            disabled={disabled}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {compact ? (
          <div className="mb-2.5 flex flex-wrap gap-2.5 lg:justify-end">
            <button
              type="button"
              className="pm-btn-green cursor-pointer rounded-[10px] border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={onApply}
              disabled={disabled}
            >
              Aplicar
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-[10px] border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={onClear}
              disabled={disabled}
            >
              Limpar
            </button>
          </div>
        ) : null}
      </div>

      {compact ? null : (
        <div className="mt-2 flex gap-2.5">
          <button
            type="button"
            className="pm-btn-green cursor-pointer rounded-[10px] border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
            onClick={onApply}
            disabled={disabled}
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-[10px] border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-55"
            onClick={onClear}
            disabled={disabled}
          >
            Limpar
          </button>
        </div>
      )}
    </section>
  );
}
