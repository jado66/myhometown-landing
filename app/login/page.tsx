import { LoginForm } from "@/components/login/login-form";
import PatternBackground from "@/components/ui/pattern-background";

export default function LoginPage() {
  return (
    <PatternBackground
      patternSize={40}
      opacity={1}
      color="#e9e9e9ff"
      backgroundColor="#ddddddff"
      id="login-background"
    >
      <main className="min-h-screen flex items-center justify-center p-4 ">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Admin Portal Login
            </h1>
            <p className="text-muted-foreground text-lg text-balance">
              Unified login for admin, missionaries, and volunteers
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
    </PatternBackground>
  );
}
