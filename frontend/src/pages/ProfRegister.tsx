"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { registerUser } from "@/utils/Authapi"; // Adjust the path as needed
import { toast } from "react-toastify";

const formSchema = z.object({
  sapid: z.string().min(6, "SAP ID must at least 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["professor"]),
});

export default function ProfRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sapid: "",
      password: "",
      name: "",
      role: "professor",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await registerUser(
        values.sapid,
        values.password,
        values.name,
        values.role
      );
      toast.success("Registration successful!");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-black">
      <div className="w-full max-w-md bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-black mb-6">
          Professor Registration
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sapid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">
                    SAP ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-black"
                      placeholder="98765432"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Your unique 12-digit SAP identification number.
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="text-black"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Choose a strong password with at least 8 characters.
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-black"
                      placeholder="Dr. John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Your full name, including title if applicable.
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1" />
                </FormItem>
              )}
            />
            <div className="flex justify-between space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
              <Link to="/proflogin">
                <Button variant="outline">Log In</Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
