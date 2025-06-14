import { Metadata } from "next"
import { Layout } from '@/components/layout/Layout'

type ProductAreaPageProps = {
  params: {
    slug: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: ProductAreaPageProps): Promise<Metadata> {
  return {
    title: `Product Area: ${params.slug}`,
  }
}

export default function ProductAreaPage({ params }: ProductAreaPageProps) {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Product Area: {params.slug}</h1>
        {/* Content will be added later */}
      </div>
    </Layout>
  )
} 