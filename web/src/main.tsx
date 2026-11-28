import React from "react";
import { createRoot } from "react-dom/client";
import Auth from "./routes/auth";
import Consent from "./routes/mcp-autorizar";
import Callback from "./routes/auth.callback";
import Reset from "./routes/reset-password";
import { configReady, supabase } from "./integrations/supabase/client";
import "./styles.css";
function Home() {
  const [signedIn, setSignedIn] = React.useState(false);
  React.useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({data})=>{if(active)setSignedIn(Boolean(data.session));}).catch(()=>{});
    const {data} = supabase.auth.onAuthStateChange((_, session)=>setSignedIn(Boolean(session)));
    return ()=>{ active=false; data.subscription.unsubscribe(); };
  },[]);
  return <main className="grid min-h-dvh place-items-center px-4">
    <section className="panel-gold w-full max-w-md p-7 space-y-4">
      <p className="text-gold font-mono text-xs tracking-widest">CENTRALDARK · MCP</p>
      <h1 className="text-2xl font-semibold">Conectar dispositivo</h1>
      <p className="text-sm text-muted-foreground">Inicie o pareamento pelo cliente CentralDark autorizado e confirme o código exibido no terminal.</p>
      {signedIn ? <><p role="status" className="text-sm">Sessão da conta iniciada. Aguardando solicitação de pareamento.</p><button className="text-gold underline" onClick={()=>void supabase.auth.signOut({scope:"local"}).then(({error})=>{if(error)window.alert("Não foi possível sair.");})}>Sair</button></> : <a className="block rounded-md bg-primary text-primary-foreground px-4 py-2 text-center" href="/auth">Entrar</a>}
    </section>
  </main>;
}
function App() {
  if (!configReady()) return <main className="grid min-h-dvh place-items-center px-4"><section className="panel-gold max-w-md p-7" role="alert"><h1 className="text-xl font-semibold text-gold">CentralDark · MCP</h1><p className="mt-3">Publicação em preparação. A autenticação ainda não foi configurada neste ambiente.</p></section></main>;
  switch(window.location.pathname) {
    case "/auth": return <Auth />;
    case "/auth/callback": return <Callback />;
    case "/reset-password": return <Reset />;
    case "/mcp-autorizar": return <Consent />;
    case "/": return <Home />;
    default: return <main className="grid min-h-dvh place-items-center"><a className="text-gold" href="/">Página não encontrada. Voltar.</a></main>;
  }
}
createRoot(document.getElementById("root")!).render(<App />);
