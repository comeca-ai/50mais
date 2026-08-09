import { Routes, Route, Navigate } from "react-router";
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
import Entrar from "./pages/Entrar";
import Cadastro from "./pages/Cadastro";
import Recuperar from "./pages/Recuperar";
import PrimeirosPassos from "./pages/PrimeirosPassos";
import Termos from "./pages/Termos";
import Notificacoes from "./pages/Notificacoes";
import Buscar from "./pages/Buscar";
import Certificado from "./pages/Certificado";
import VerificarCertificado from "./pages/VerificarCertificado";
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
        <Route path="/termos" element={<Termos />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/certificado" element={<Certificado />} />
        <Route path="/verificar" element={<VerificarCertificado />} />
      </Route>
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/primeiros-passos" element={<PrimeirosPassos />} />
      <Route path="/login" element={<Navigate to="/entrar" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
