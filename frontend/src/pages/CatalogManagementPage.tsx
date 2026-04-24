import { useEffect, useState, type FormEvent } from "react";
import { FeedbackPopup } from "../components/FeedbackPopup";
import { ProductForm } from "../components/ProductForm";
import { createCategory, getCategories } from "../services/categoriesService";
import { createProduct } from "../services/productsService";
import type { Category, ProductUpsertRequest } from "../types/api";

interface CategoryFormState {
  name: string;
}

const EMPTY_CATEGORY_STATE: CategoryFormState = {
  name: ""
};

export function CatalogManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryState, setCategoryState] = useState<CategoryFormState>(EMPTY_CATEGORY_STATE);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadCategories();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar categorias.");
      }
    };

    void load();
  }, []);

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

  const handleProductSubmit = async (payload: ProductUpsertRequest) => {
    setProductLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createProduct(payload);
      setSuccessMessage("Produto criado com sucesso.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao criar produto.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      name: categoryState.name.trim()
    };

    if (!payload.name) {
      setErrorMessage("Nome da categoria e obrigatorio.");
      return;
    }

    setCategoryLoading(true);

    try {
      await createCategory(payload);
      setSuccessMessage("Categoria criada com sucesso.");
      setCategoryState(EMPTY_CATEGORY_STATE);
      await loadCategories();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao criar categoria.");
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <main className="mx-auto my-6 mb-12 w-[min(1200px,calc(100%-32px))] text-slate-800 max-lg:my-4 max-lg:mb-6 max-lg:w-[min(1200px,calc(100%-20px))]">
      <header className="mb-4">
        <h1 className="m-0 text-[clamp(1.7rem,3vw,2.4rem)] font-bold">Cadastros</h1>
        <p className="mt-1.5 text-slate-600">Crie produtos e categorias na mesma pagina.</p>
      </header>

      {errorMessage ? <FeedbackPopup kind="erro" message={errorMessage} onClose={() => setErrorMessage("")} /> : null}
      {successMessage ? <FeedbackPopup kind="sucesso" message={successMessage} onClose={() => setSuccessMessage("")} /> : null}

      <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ProductForm
          categories={categories}
          editingProduct={null}
          loading={productLoading}
          onSubmit={handleProductSubmit}
          onCancelEdit={() => undefined}
        />

        <section className="mb-4 rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="mb-3.5 text-[1.1rem] font-semibold">Criar categoria</h2>
          </div>

          <form className="grid gap-2" onSubmit={handleCategorySubmit}>
            <label className="mb-2.5 block text-[0.92rem] font-semibold">
              Nome
              <input
                className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
                type="text"
                value={categoryState.name}
                maxLength={120}
                onChange={(event) => setCategoryState((current) => ({ ...current, name: event.target.value }))}
                disabled={categoryLoading}
                required
              />
            </label>

            <div className="mt-2 flex gap-2.5">
              <button
                type="submit"
                className="pm-btn-green cursor-pointer rounded-[10px] border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={categoryLoading}
              >
                Criar categoria
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
