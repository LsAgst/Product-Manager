import { useEffect, useState } from "react";
import { ProductForm } from "../components/ProductForm";
import { getCategories } from "../services/categoriesService";
import { createProduct } from "../services/productsService";
import type { Category, ProductUpsertRequest } from "../types/api";

export function CreateProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar categorias.");
      }
    };

    void load();
  }, []);

  const handleSubmit = async (payload: ProductUpsertRequest) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createProduct(payload);
      setSuccessMessage("Produto criado com sucesso.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao criar produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto my-6 mb-12 w-[min(1200px,calc(100%-32px))] text-slate-800 max-lg:my-4 max-lg:mb-6 max-lg:w-[min(1200px,calc(100%-20px))]">
      <header className="mb-4">
        <h1 className="m-0 text-[clamp(1.7rem,3vw,2.4rem)] font-bold">Criacao de Produto</h1>
        <p className="mt-1.5 text-slate-600">Preencha os dados para criar um novo produto.</p>
      </header>

      {errorMessage ? (
        <p className="mb-4 rounded-[10px] border border-red-200 bg-red-100 px-3.5 py-3 font-semibold text-red-800">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mb-4 rounded-[10px] border border-emerald-200 bg-emerald-100 px-3.5 py-3 font-semibold text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <ProductForm
        categories={categories}
        editingProduct={null}
        loading={loading}
        onSubmit={handleSubmit}
        onCancelEdit={() => undefined}
      />
    </main>
  );
}
