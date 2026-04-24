import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedbackPopup } from "../components/FeedbackPopup";
import { FiltersBar } from "../components/FiltersBar";
import { ProductForm } from "../components/ProductForm";
import { ProductTable } from "../components/ProductTable";
import { getCategories } from "../services/categoriesService";
import { deleteProduct, getProducts, updateProduct } from "../services/productsService";
import type { Category, Product, ProductUpsertRequest } from "../types/api";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  const [searchDraft, setSearchDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [categoryApplied, setCategoryApplied] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const editFormRef = useRef<HTMLDivElement | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [pageSize, totalCount]);

  const loadCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getProducts({
        page,
        pageSize,
        search: searchApplied || undefined,
        categoryId: categoryApplied || undefined
      });

      setProducts(response.items);
      setTotalCount(response.totalCount);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, [categoryApplied, page, pageSize, searchApplied]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!editingProduct || !editFormRef.current) {
      return;
    }

    editFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingProduct]);

  useEffect(() => {
    if (!errorMessage && !successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [errorMessage, successMessage]);

  const handleApplyFilters = () => {
    setPage(1);
    setSearchApplied(searchDraft.trim());
    setCategoryApplied(categoryDraft);
  };

  const handleClearFilters = () => {
    setPage(1);
    setSearchDraft("");
    setCategoryDraft("");
    setSearchApplied("");
    setCategoryApplied("");
  };

  const handleStartEdit = (product: Product) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingProduct(product);
  };

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm("Deseja excluir este produto?");
    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteProduct(productId);
      setSuccessMessage("Produto excluido com sucesso.");
      await loadProducts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao excluir produto.");
    }
  };

  const handleEditSubmit = async (payload: ProductUpsertRequest) => {
    if (!editingProduct) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateProduct(editingProduct.id, payload);
      setSuccessMessage("Produto atualizado com sucesso.");
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao atualizar produto.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const handlePageSizeChange = (value: string) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return;
    }

    setPage(1);
    setPageSize(parsed);
  };

  return (
    <main className="mx-auto my-6 mb-12 w-[min(1200px,calc(100%-32px))] text-slate-800 max-lg:my-4 max-lg:mb-6 max-lg:w-[min(1200px,calc(100%-20px))]">
      <header className="mb-4">
        <h1 className="m-0 text-[clamp(1.7rem,3vw,2.4rem)] font-bold">Gerenciador de Produtos</h1>
        <p className="mt-1.5 text-slate-600">Interface local de teste para produtos e categorias.</p>
      </header>

      {errorMessage ? <FeedbackPopup kind="erro" message={errorMessage} onClose={() => setErrorMessage("")} /> : null}
      {successMessage ? <FeedbackPopup kind="sucesso" message={successMessage} onClose={() => setSuccessMessage("")} /> : null}

      {editingProduct ? (
        <div ref={editFormRef}>
          <ProductForm
            key={editingProduct.id}
            categories={categories}
            editingProduct={editingProduct}
            loading={submitting}
            onSubmit={handleEditSubmit}
            onCancelEdit={() => setEditingProduct(null)}
          />
        </div>
      ) : null}

      <ProductTable
        items={products}
        loading={loading}
        onEdit={handleStartEdit}
        onDelete={handleDelete}
        toolbar={
          <FiltersBar
            search={searchDraft}
            selectedCategoryId={categoryDraft}
            categories={categories}
            onSearchChange={setSearchDraft}
            onCategoryChange={setCategoryDraft}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            disabled={loading}
            compact
          />
        }
      />

      <section className="mb-4 rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span>
            Exibindo {products.length} de {totalCount} produtos
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[0.92rem] font-semibold text-slate-700">
              Itens por pagina
              <select
                className="rounded-[10px] border border-slate-300 bg-white px-2.5 py-2"
                value={pageSize}
                onChange={(event) => handlePageSizeChange(event.target.value)}
                disabled={loading}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-[10px] border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
            >
              Anterior
            </button>
            <span>
              Pagina {page} / {totalPages}
            </span>
            <button
              type="button"
              className="cursor-pointer rounded-[10px] border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={handleNextPage}
              disabled={page >= totalPages || loading}
            >
              Proxima
            </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
