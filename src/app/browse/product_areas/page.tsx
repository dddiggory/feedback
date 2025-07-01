import { Layout } from '@/components/layout/Layout'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Browse Product Areas',
  description: 'Browse all product areas and their feedback',
}

export default async function BrowseProductAreasPage() {
  const supabase = await createClient()
  
  const { data: productAreas } = await supabase
    .from('product_areas')
    .select('name, slug, description')
    .order('name')

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Product Areas</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productAreas?.map((area) => (
            <Link 
              key={area.slug}
              href={`/product_areas/${area.slug}`} 
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{area.name}</h2>
              <p className="text-white">{area.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
} 