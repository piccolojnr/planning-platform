import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { LinkButton } from "@/components/ui/link-button";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof formSchema>;

export function AuthForm({ isSignUp = false }: { isSignUp?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      if (isSignUp) {
        await signUp(data.email, data.password);
        toast.success("Account created! Please sign in.");
      } else {
        await signIn(data.email, data.password);
      }
    } catch (error) {
      console.error("Failed to authenticate:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <p className="text-xs text-right">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <LinkButton
              type="button"
              variant="link"
              size="sm"
              className="ml-1 p-0"
              to={isSignUp ? "/signin" : "/signup"}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </LinkButton>
          </p>
        </div>
      </form>
    </Form>
  );
}
