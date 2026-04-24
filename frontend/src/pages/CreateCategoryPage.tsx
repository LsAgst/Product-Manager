import { useState, type FormEvent } from "react";
import { createCategory } from "../services/categoriesService";

interface CategoryFormState {
  name: string;
}

const EMPTY_STATE: CategoryFormState = {
  name: ""
};

export function CreateCategoryPage() {
  const [state, setState] = useState<CategoryFormState>(EMPTY_STATE);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      name: state.name.trim()
    };

    if (!payload.name) {
      setErrorMessage("Nome da categoria e obrigatorio.");
      return;
    }

    setLoading(true);

    try {
      await createCategory(payload);
      setSuccessMessage("Categoria criada com sucesso.");
      setState(EMPTY_STATE);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao criar categoria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto my-6 mb-12 w-[min(1200px,calc(100%-32px))] text-slate-800 max-lg:my-4 max-lg:mb-6 max-lg:w-[min(1200px,calc(100%-20px))]">
      <header className="mb-4">
        <h1 className="m-0 text-[clamp(1.7rem,3vw,2.4rem)] font-bold">Criacao de Categoria</h1>
        <p className="mt-1.5 text-slate-600">Preencha os dados para criar uma nova categoria.</p>
      </header>

      {errorMessage ? (
        <p className="mb-4 rounded-[10px] border border-red-200 bg-red-100 px-3.5 py-3 font-semibold text-red-800">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mb-4 rounded-[10px] border border-emerald-200 bg-emerald-100 px-3.5 py-3 font-semibold text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <section className="mb-4 rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <label className="mb-2.5 block text-[0.92rem] font-semibold">
            Nome
            <input
              className="mt-1.5 w-full rounded-[10px] border border-slate-300 bg-white px-3 py-2.5"
              type="text"
              value={state.name}
              maxLength={120}
              onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
              disabled={loading}
              required
            />
          </label>

          <div className="mt-2 flex gap-2.5">
            <button
              type="submit"
              className="cursor-pointer rounded-[10px] border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={loading}
            >
              Criar categoria
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
