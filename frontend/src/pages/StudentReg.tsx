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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

import { registerUser } from "@/utils/api"; // Adjust path as needed
import { toast } from "react-toastify";

const formSchema = z.object({
  sapid: z.string().min(6, "SAP ID must be at least 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["student"]),
  rollNumber: z.string().min(4, "Roll Number must be at least 4 characters"),
  year: z.string().min(4, "Invalid year"),
});

export default function StudentRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sapid: "",
      password: "",
      name: "",
      role: "student",
      rollNumber: "",
      year: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await registerUser(values.sapid, values.password, values.name, values.role, values.rollNumber, values.year);
      toast.success("Registration successful!");
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center overflow-x-hidden min-h-screen w-screen bg-black p-6">
      <div className="w-full max-w-md bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-black mb-6">
          Student Registration
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
                    Your full name, as per Student ID
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1" />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">
                    Role
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white text-black border border-gray-300 rounded-md">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black z-50">
                      <SelectItem className="text-black" value="student">
                        Student
                      </SelectItem>
                      <SelectItem className="text-black" value="alumni">
                        Alumni
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-left" />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">
                    Roll Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-black"
                      placeholder="I020"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Your 4 digit Roll Number
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">
                    Year
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-black"
                      placeholder="2026"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Your Graduation Year
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1" />
                </FormItem>
              )}
            />
            <div className="flex space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
              <Link to="/loginstudent">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
