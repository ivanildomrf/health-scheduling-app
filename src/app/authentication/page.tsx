import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/constants";

import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen">
        {/* Coluna esquerda - Formulário */}
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="mx-auto flex h-16 w-auto items-center justify-center">
              <Image
                src={APP_CONFIG.logo.local}
                alt={APP_CONFIG.name}
                width={24}
                height={24}
                className="h-18 w-auto"
              />
            </div>

            {/* Formulários */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <SignInForm />
              </TabsContent>
              <TabsContent value="register">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Coluna direita - Ilustração */}
        <div className="hidden lg:flex lg:w-1/2">
          <div className="relative flex w-full items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600 p-12">
            {/* Círculo decorativo */}
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-white/10"></div>
            <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-white/5"></div>

            {/* Ilustração central */}
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg
                  className="h-16 w-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white">
                Cuidando da sua saúde
              </h2>
              <p className="text-lg text-white/90">
                Gerencie seus agendamentos e informações médicas de forma
                simples e segura
              </p>

              {/* Elementos decorativos */}
              <div className="mt-12 flex justify-center space-x-4">
                <div className="h-3 w-3 rounded-full bg-white/40"></div>
                <div className="h-3 w-3 rounded-full bg-white/60"></div>
                <div className="h-3 w-3 rounded-full bg-white/80"></div>
              </div>
            </div>

            {/* Ícones flutuantes */}
            <div className="absolute top-1/4 left-8 animate-pulse">
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="absolute top-1/3 right-8 animate-pulse delay-1000">
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-1/4 left-12 animate-pulse delay-500">
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
