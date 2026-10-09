import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { BarChart3, BellRing, FolderKanban } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const features = [
  { icon: FolderKanban, title: 'Everything in one place', text: 'Company, role, status and notes for every application.' },
  { icon: BellRing, title: 'Never miss a follow-up', text: 'Add tasks with due dates and spot what is overdue.' },
  { icon: BarChart3, title: 'See your progress', text: 'A dashboard shows where your search stands.' },
]

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof schema>

export default function HomePage() {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Supabase puts auth errors (e.g. an expired email link) in the URL hash.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const description = params.get('error_description')
    if (description) {
      toast.error(description)
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  if (loading) return null
  if (session) return <Navigate to="/applications" replace />

  async function onSubmit(values: FormValues) {
    if (mode === 'signup') {
      // The email confirmation link (if enabled in Supabase) returns to this same site.
      const emailRedirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`
      const { data, error } = await supabase.auth.signUp({ ...values, options: { emailRedirectTo } })
      if (error) return void toast.error(error.message)
      toast.success(data.session ? 'Account created' : 'Account created. Check your email to continue.')
    } else {
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) return void toast.error(error.message)
      toast.success('Signed in')
    }
  }

  const isSignUp = mode === 'signup'

  return (
    <div className="grid items-center gap-10 py-4 lg:grid-cols-2 lg:gap-16 lg:py-12">
      <section className="order-2 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:order-1">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Track every application.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-300 dark:to-pink-300">
              Land the offer.
            </span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            One calm place for your job search: applications, follow-ups and progress.
          </p>
        </div>
        <ul className="space-y-4">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Card className="order-1 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:order-2 lg:mx-auto lg:w-full lg:max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{isSignUp ? 'Create your account' : 'Welcome back'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Use your email and a password.' : 'Sign in to see your applications.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={isSubmitting}>
              {isSignUp ? 'Sign up' : 'Sign in'}
            </Button>
          </form>
          <Button
            type="button"
            variant="link"
            className="mt-2 w-full"
            onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
