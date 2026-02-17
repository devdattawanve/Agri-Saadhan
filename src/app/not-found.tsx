import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-3xl font-bold font-headline mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground mb-6">Could not find the requested resource.</p>
      <Button asChild>
        <Link href="/dashboard">Return Home</Link>
      </Button>
    </div>
  )
}
