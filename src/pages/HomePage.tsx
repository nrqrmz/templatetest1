import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
        <p className="text-muted-foreground">Keep track of your job applications and to-dos.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create an account' : 'Sign in'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Use your email and a password.' : 'Welcome back.'}
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
