"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  checkEmailExists,
  signInWithPassword,
  verifyMissionaryToken,
  type UserType,
} from "@/app/actions/auth/auth-actions";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const tokenSchema = z.object({
  token: z
    .string()
    .length(6, "Token must be 6 digits")
    .regex(/^\d+$/, "Token must contain only numbers"),
});

type LoginStep = "email" | "password" | "token" | "not_found";

export function LoginForm() {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("not_found");
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const tokenForm = useForm<z.infer<typeof tokenSchema>>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: "" },
  });

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    try {
      const result = await checkEmailExists(values.email);
      setEmail(values.email);
      setUserType(result.userType);

      if (result.userType === "auth_user") {
        setStep("password");
      } else if (result.userType === "missionary") {
        setStep("token");
        toast.info("A 6-digit code has been sent to your phone");
      } else {
        setStep("not_found");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true);
    try {
      const result = await signInWithPassword(email, values.password);
      if (result.success) {
        toast.success("Successfully signed in!");
        // Redirect to dashboard or home
        window.location.href = "/dashboard";
      } else {
        toast.error(result.error || "Invalid password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onTokenSubmit(values: z.infer<typeof tokenSchema>) {
    setIsLoading(true);
    try {
      const result = await verifyMissionaryToken(email, values.token);
      if (result.success) {
        toast.success("Successfully verified!");
        // Redirect to missionary dashboard
        window.location.href = "/missionary-dashboard";
      } else {
        toast.error(result.error || "Invalid token");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    setStep("email");
    setEmail("");
    emailForm.reset();
    passwordForm.reset();
    tokenForm.reset();
  }

  return (
    <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-primary/5 backdrop-blur-sm bg-card/95 bg-white">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {step === "email" && "Welcome Back"}
          {step === "password" && "Enter Password"}
          {step === "token" && "Verify Code"}
          {step === "not_found" && "Account Not Found"}
        </CardTitle>
        <CardDescription className="text-base">
          {step === "email" && "Enter your email to continue"}
          {step === "password" && "Enter your password to sign in"}
          {step === "token" && "Enter the 6-digit code sent to your phone"}
          {step === "not_found" && "We couldn't find your account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "email" && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-5"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-10 h-11 bg-background border-border/60 focus:border-primary/50 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        )}

        {step === "password" && (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-5"
            >
              <div className="rounded-lg bg-accent/50 border border-border/50 p-3">
                <p className="text-sm text-muted-foreground">Signing in as</p>
                <p className="font-semibold text-foreground mt-0.5">{email}</p>
              </div>
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 h-11 bg-background border-border/60 focus:border-primary/50 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="h-11 border-border/60 bg-transparent hover:text-white"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === "token" && (
          <Form {...tokenForm}>
            <form
              onSubmit={tokenForm.handleSubmit(onTokenSubmit)}
              className="space-y-5"
            >
              <div className="rounded-lg bg-accent/50 border border-border/50 p-3">
                <p className="text-sm text-muted-foreground">Verifying</p>
                <p className="font-semibold text-foreground mt-0.5">{email}</p>
              </div>
              <FormField
                control={tokenForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      6-Digit Code
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-center w-full">
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={(val) => {
                              const cleaned = val.replace(/\D/g, "");
                              field.onChange(cleaned);
                              if (cleaned.length === 6) {
                                tokenForm.handleSubmit(onTokenSubmit)();
                              }
                            }}
                            disabled={isLoading}
                            containerClassName="flex items-center gap-4"
                          >
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={0} className="h-12 w-12 text-xl font-semibold bg-background border-border/60" />
                              <InputOTPSlot index={1} className="h-12 w-12 text-xl font-semibold bg-background border-border/60" />
                              <InputOTPSlot index={2} className="h-12 w-12 text-xl font-semibold bg-background border-border/60" />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={3} className="h-12 w-12 text-xl font-semibold bg-background border-border/60" />
                              <InputOTPSlot index={4} className="h-12 w-12 text-xl font-semibold bg-background border-border/60" />
                              <InputOTPSlot index={5} className="h-12 w-12 text-xl font-semibold bg-background border-border/60" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Enter the code sent to your phone
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="h-11 border-border/60 bg-transparent hover:text-white"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === "not_found" && (
          <div className="space-y-5">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-5">
              <p className="font-semibold text-foreground mb-2 text-base">
                Account Not Found
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We couldn't find an account associated with{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Please check your email address or contact your administrator
                for access.
              </p>
            </div>
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full h-11 border-border/60 bg-transparent"
            >
              Try Another Email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
