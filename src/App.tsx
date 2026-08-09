import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Aulas from "./pages/Aulas";
import AssistirAula from "./pages/AssistirAula";
import Comunidade from "./pages/Comunidade";
import Post from "./pages/Post";
import Eventos from "./pages/Eventos";
import Membros from "./pages/Membros";
import Membro from "./pages/Membro";
import Ranking from "./pages/Ranking";
import Mensagens from "./pages/Mensagens";
import Conversa from "./pages/Conversa";
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
        <Route path="/comunidade/post/:id" element={<Post />} />
        <Route path="/comunidade/eventos" element={<Eventos />} />
        <Route path="/comunidade/membros" element={<Membros />} />
        <Route path="/comunidade/membros/:id" element={<Membro />} />
        <Route path="/comunidade/ranking" element={<Ranking />} />
        <Route path="/mensagens" element={<Mensagens />} />
        <Route path="/mensagens/:id" element={<Conversa />} />
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
