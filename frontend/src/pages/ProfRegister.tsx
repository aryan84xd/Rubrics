"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  sapid: z.string().length(12, "SAP ID must be exactly 12 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["hod", "assistant professor", "professor", "associate professor"]),
})

export default function ProfRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sapid: "",
      password: "",
      name: "",
      role: "professor",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)
    setTimeout(() => {
      setIsSubmitting(false)
      form.reset()
    }, 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-black">
      <div className="w-full max-w-md bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-black mb-6">Professor Registration</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sapid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">SAP ID</FormLabel>
                  <FormControl>
                    <Input className="text-black" placeholder="98765432" {...field} />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Your unique 12-digit SAP identification number.
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="text-black" placeholder="********" {...field} />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Choose a strong password with at least 8 characters.
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">Name</FormLabel>
                  <FormControl>
                    <Input className="text-black" placeholder="Dr. John Doe" {...field} />
                  </FormControl>
                  <FormDescription className="text-black flex justify-start ml-1">
                    Your full name, including title if applicable.
                  </FormDescription>
                  <FormMessage className="text-red-500 text-left ml-1"/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black flex justify-start ml-1">Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white text-black border border-gray-300 rounded-md">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black z-50">
                      <SelectItem className="text-black" value="hod">HOD</SelectItem>
                      <SelectItem className="text-black" value="professor">Professor</SelectItem>
                      <SelectItem className="text-black" value="associate professor">Associate Professor</SelectItem>
                      <SelectItem className="text-black" value="assistant professor">Assistant Professor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-left ml-1"/>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
