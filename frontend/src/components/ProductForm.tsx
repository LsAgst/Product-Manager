import { useMemo, useState, type FormEvent } from "react";
import type { Category, Product, ProductUpsertRequest } from "../types/api";

interface ProductFormProps {
  categories: Category[];
  editingProduct: Product | null;
  loading?: boolean;
  onSubmit: (payload: ProductUpsertRequest) => Promise<void>;
  onCancelEdit: () => void;
}

interface ProductFormState {
  name: string;
  sku: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
}

const EMPTY_STATE: ProductFormState = {
  name: "",
  sku: "",
  description: "",
  price: "",
  stock: "",
  categoryId: ""
};

export function ProductForm({
  categories,
  editingProduct,
  loading = false,
  onSubmit,
  onCancelEdit
}: ProductFormProps) {
  const [state, setState] = useState<ProductFormState>(() => {
    if (!editingProduct) {
      return EMPTY_STATE;
    }

    return {
      name: editingProduct.name,
      sku: editingProduct.sku,
      description: editingProduct.description,
      price: String(editingProduct.price),
      stock: String(editingProduct.stock),
      categoryId: editingProduct.categoryId
    };
  });
  const [error, setError] = useState<string>("");

  const title = useMemo(() => (editingProduct ? "Editar produto" : "Criar produto"), [editingProduct]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const payload: ProductUpsertRequest = {
      name: state.name.trim(),
      description: state.description.trim(),
      price: Number(state.price),
      stock: Number(state.stock),
      categoryId: state.categoryId
    };

    const normalizedSku = state.sku.trim();
    if (normalizedSku) {
      payload.sku = normalizedSku;
    }

    if (!payload.name) {
      setError("Nome e obrigatorio.");
      return;
    }

    if (!payload.categoryId) {
      setError("Categoria e obrigatoria.");
      return;
    }

    if (Number.isNaN(payload.price) || payload.price < 0) {
      setError("Preco deve ser um numero nao negativo.");
      return;
    }

    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      setError("Estoque deve ser um numero inteiro nao negativo.");
      return;
    }

    await onSubmit(payload);

    if (!editingProduct) {
      setState(EMPTY_STATE);
    }
  };

  return (
    <section className="mb-4 rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div>
        <h2 className="mb-3.5 text-[1.1rem] font-semibold">{title}</h2>
      </div>
      <form className="grid gap-2" onSubmit={handleSubmit}>
        <label className="mb-2.5 block text-[0.92rem] font-semibold">
          Nome
          <input
            className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
            type="text"
            value={state.name}
            maxLength={150}
            onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
            disabled={loading}
            required
          />
        </label>

        <label className="mb-2.5 block text-[0.92rem] font-semibold">
          SKU (opcional)
          <input
            className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
            type="text"
            value={state.sku}
            maxLength={64}
            onChange={(event) => setState((current) => ({ ...current, sku: event.target.value }))}
            disabled={loading}
            placeholder="Opcional"
          />
        </label>

        <label className="mb-2.5 block text-[0.92rem] font-semibold">
          Descricao
          <textarea
            className="mt-1.5 w-full resize-y rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
            value={state.description}
            maxLength={1000}
            onChange={(event) => setState((current) => ({ ...current, description: event.target.value }))}
            disabled={loading}
            rows={3}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="mb-2.5 block text-[0.92rem] font-semibold">
            Preco
            <input
              className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
              type="number"
              min="0"
              step="0.01"
              value={state.price}
              onChange={(event) => setState((current) => ({ ...current, price: event.target.value }))}
              disabled={loading}
              required
            />
          </label>

          <label className="mb-2.5 block text-[0.92rem] font-semibold">
            Estoque
            <input
              className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
              type="number"
              min="0"
              step="1"
              value={state.stock}
              onChange={(event) => setState((current) => ({ ...current, stock: event.target.value }))}
              disabled={loading}
              required
            />
          </label>
        </div>

        <label className="mb-2.5 block text-[0.92rem] font-semibold">
          Categoria
          <select
            className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
            value={state.categoryId}
            onChange={(event) => setState((current) => ({ ...current, categoryId: event.target.value }))}
            disabled={loading}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {error ? <p className="m-0 font-semibold text-red-700">{error}</p> : null}

        <div className="mt-2 flex gap-2.5">
          <button
            type="submit"
            className="pm-btn-green cursor-pointer rounded-[10px] border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={loading}
          >
            {editingProduct ? "Salvar alteracoes" : "Criar produto"}
          </button>
          {editingProduct ? (
            <button
              type="button"
              className="cursor-pointer rounded-[10px] border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={onCancelEdit}
              disabled={loading}
            >
              Cancelar edicao
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
