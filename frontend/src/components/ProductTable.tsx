import type { ReactNode } from "react";
import type { Product } from "../types/api";
import { formatCurrency, formatDateTime } from "../utils/format";

interface ProductTableProps {
  items: Product[];
  loading?: boolean;
  toolbar?: ReactNode;
  onEdit?: (product: Product) => void;
  onDelete: (productId: string) => Promise<void>;
}

export function ProductTable({ items, loading = false, toolbar, onEdit, onDelete }: ProductTableProps) {
  return (
    <section className="pm-products-table mb-4 rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div>
        <h2 className="mb-3.5 text-[1.1rem] font-semibold">Produtos</h2>
      </div>

      {toolbar}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                Nome
              </th>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                SKU
              </th>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                Categoria
              </th>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                Preco
              </th>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                Estoque
              </th>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                Atualizado em
              </th>
              <th className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top text-[0.85rem] uppercase tracking-[0.04em] text-slate-600">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2.5 py-5 text-center text-slate-500">
                  {loading ? "Carregando produtos..." : "Nenhum produto encontrado para os filtros atuais."}
                </td>
              </tr>
            ) : (
              items.map((product) => (
                <tr key={product.id}>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top">
                    <div className="font-bold">{product.name}</div>
                    <div className="mt-1 text-[0.88rem] text-slate-500">{product.description || "Sem descricao"}</div>
                  </td>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top font-mono text-[0.86rem] text-slate-600">{product.sku}</td>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top">
                    <span className="pm-category-tag">{product.categoryName}</span>
                  </td>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top font-bold text-teal-700">{formatCurrency(product.price)}</td>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top">{product.stock}</td>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top">{formatDateTime(product.updatedAt)}</td>
                  <td className="border-b border-slate-200 px-2.5 py-2.5 text-left align-top">
                    <div className="flex items-center gap-2">
                      {onEdit ? (
                        <button
                          type="button"
                          className="pm-btn-secondary cursor-pointer rounded-[10px] border-0 px-2.5 py-[7px] text-[0.84rem] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-55"
                          onClick={() => onEdit(product)}
                          disabled={loading}
                        >
                          Editar
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="pm-btn-danger cursor-pointer rounded-[10px] border-0 px-2.5 py-[7px] text-[0.84rem] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-55"
                        onClick={() => onDelete(product.id)}
                        disabled={loading}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
