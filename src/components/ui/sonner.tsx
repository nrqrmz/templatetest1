import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return <Sonner richColors position="top-right" {...props} />
}

export { Toaster }
