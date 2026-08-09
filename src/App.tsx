import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Aulas from "./pages/Aulas";
import AssistirAula from "./pages/AssistirAula";
import Comunidade from "./pages/Comunidade";
import Post from "./pages/Post";
import Vagas from "./pages/Vagas";
import Empresas from "./pages/Empresas";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/aulas" element={<Aulas />} />
        <Route path="/aulas/:id" element={<AssistirAula />} />
        <Route path="/comunidade" element={<Comunidade />} />
        <Route path="/comunidade/:id" element={<Post />} />
        <Route path="/vagas" element={<Vagas />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
