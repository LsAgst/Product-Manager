import { useState } from "react";
import { CatalogManagementPage } from "./pages/CatalogManagementPage";
import { ProductsPage } from "./pages/ProductsPage";

type PageKey = "produtos" | "cadastros";

function App() {
  const [selectedPage, setSelectedPage] = useState<PageKey>("produtos");

  const getTabClassName = (page: PageKey) =>
    selectedPage === page
      ? "cursor-pointer rounded-[10px] border-0 bg-blue-600 px-3.5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700"
      : "cursor-pointer rounded-[10px] border-0 bg-slate-200 px-3.5 py-2.5 font-bold text-slate-900 transition-colors hover:bg-slate-300";

  return (
    <div>
      <nav className="mx-auto mt-5 flex w-[min(1200px,calc(100%-32px))] flex-wrap items-center gap-2.5 max-lg:w-[min(1200px,calc(100%-20px))]">
        <button
          type="button"
          className={getTabClassName("produtos")}
          onClick={() => setSelectedPage("produtos")}
        >
          Produtos
        </button>
        <button
          type="button"
          className={getTabClassName("cadastros")}
          onClick={() => setSelectedPage("cadastros")}
        >
          Cadastros
        </button>
      </nav>

      <section style={{ display: selectedPage === "produtos" ? "block" : "none" }}>
        <ProductsPage />
      </section>

      <section style={{ display: selectedPage === "cadastros" ? "block" : "none" }}>
        <CatalogManagementPage />
      </section>
    </div>
  );
}

export default App;
