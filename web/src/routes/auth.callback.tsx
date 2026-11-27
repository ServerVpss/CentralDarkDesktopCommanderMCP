import { finishAuth } from "@/lib/return-to";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";



export default function AuthCallback() {
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function concluir() {
      const parametros = new URLSearchParams(window.location.search);
      const fragmento = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const erroOAuth =
        parametros.get("error_description") ??
        parametros.get("error") ??
        fragmento.get("error_description") ??
        fragmento.get("error");
      if (erroOAuth) {
        if (ativo) setErro("O provedor não concluiu o acesso.");
        return;
      }

      const codigo = parametros.get("code");
      if (codigo) {
        const { error } = await supabase.auth.exchangeCodeForSession(codigo);
        if (error) {
          if (ativo) setErro("O retorno do acesso expirou ou já foi utilizado.");
          return;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        if (ativo) setErro("Nenhuma sessão válida foi recebida.");
        return;
      }

      if (ativo) finishAuth();
    }

    void concluir().catch(() => { if (ativo) setErro("Não foi possível validar o retorno do acesso."); });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center px-4 pb-44 pt-16">
      <section className="panel-gold w-full max-w-md p-7 text-center">
        {erro ? (
          <>
            <ShieldAlert className="mx-auto size-8 text-destructive" />
            <h1 className="mt-4 text-2xl font-semibold">Acesso não concluído</h1>
            <p role="alert" className="mt-3 text-sm text-muted-foreground">
              {erro}
            </p>
            <Button asChild variant="outline" className="mt-6">
              <a href="/auth">Voltar ao acesso</a>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-gold" />
            <h1 className="mt-4 text-2xl font-semibold">Concluindo acesso</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Validando sua sessão e retomando a conexão.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
