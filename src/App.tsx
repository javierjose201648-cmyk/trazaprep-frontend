import { BrowserRouter, Route, Routes } from "react-router-dom";
import Masthead from "./components/Masthead/Masthead";
import Busqueda from "./pages/Busqueda/Busqueda";
import Inicio from "./pages/Inicio/Inicio";
import Verificador from "./pages/Verificador/Verificador";

export default function App() {
  return (
    <BrowserRouter>
      <main className="page">
        <Masthead />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/busqueda" element={<Busqueda />} />
          <Route path="/verificador" element={<Verificador />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
