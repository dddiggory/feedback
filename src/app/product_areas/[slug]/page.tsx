import { Metadata } from "next"
import { Layout } from '@/components/layout/Layout'

type ProductAreaPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: ProductAreaPageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Product Area: ${slug}`,
  }
}

export default async function ProductAreaPage({ params }: ProductAreaPageProps) {
  const { slug } = await params
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Product Area: {slug}</h1>
        {/* Content will be added later */}
      </div>
    </Layout>
  )
} 