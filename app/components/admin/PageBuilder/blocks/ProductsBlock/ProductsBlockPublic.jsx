import { createClient } from "@/utils/supabase/server"
import ProductList from "@/app/components/UI/ProductList"

function parseIds(val) {
  try {
    if (Array.isArray(val)) return val.map(Number).filter(Number.isFinite)
    if (typeof val === "string" && val.trim()) {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isFinite)
    }
  } catch {}
  return []
}

function parsePaths(val) {
  try {
    if (Array.isArray(val)) {
      return val
        .map(p => Array.isArray(p) ? p.map(n => Number(n)).filter(Number.isFinite) : [])
        .filter(p => p.length > 0)
    }
    if (typeof val === "string" && val.trim()) {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) {
        return parsed
          .map(p => Array.isArray(p) ? p.map(n => Number(n)).filter(Number.isFinite) : [])
          .filter(p => p.length > 0)
      }
    }
  } catch {}
  return []
}

async function fetchProducts(categoryPaths, tagIds, productIds, limit) {
  const supabase = await createClient()
  
  let results = []
  
  // 1. Manual product selection - specific product IDs
  if (productIds && productIds.length > 0) {
    const { data: manualProducts } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("kozzeteve", true)
    
    results = manualProducts || []
  }
  
  // 2. Category/Tag filtering
  const categoryIds = categoryPaths
    .map(path => path[path.length - 1])
    .filter(id => id)
  
  if (categoryIds.length > 0 || tagIds.length > 0) {
    const { data: allProducts } = await supabase
      .from("products")
      .select("*")
      .eq("kozzeteve", true)
    
    if (allProducts) {
      const filtered = allProducts.filter(product => {
        const productCategories = parsePaths(product.kategoria || [])
        
        // Hierarchical category matching: check if any selected categoryId appears in ANY position of the path
        const hasCategory = categoryIds.length > 0 && productCategories.some(path => 
          path.some(pathId => categoryIds.includes(pathId))
        )

        const productTags = parseIds(product.cimkek || [])
        const hasTag = tagIds.length > 0 && tagIds.some(tagId => productTags.includes(tagId))

        return hasCategory || hasTag
      })
      
      // Merge with manual selection (avoid duplicates)
      const manualIds = new Set(results.map(p => p.id))
      const uniqueFiltered = filtered.filter(p => !manualIds.has(p.id))
      results = [...results, ...uniqueFiltered]
    }
  }
  
  // 3. If no manual selection and no filters, return all published products
  if (!productIds?.length && categoryIds.length === 0 && tagIds.length === 0) {
    const { data: allProducts } = await supabase
      .from("products")
      .select("*")
      .eq("kozzeteve", true)
      .limit(limit || 8)
    
    return allProducts || []
  }

  return results.slice(0, limit || 8)
}

export default async function ProductsBlockPublic({ config }) {
  const products = await fetchProducts(
    config.categoryPaths || [],
    config.tagIds || [],
    config.productIds || [],
    config.limit || 8
  )

  // Debug mode when no products found
  if (products.length === 0 && (config.categoryPaths?.length > 0 || config.tagIds?.length > 0)) {
    const supabase = await createClient()
    const categoryIds = (config.categoryPaths || [])
      .map(path => path[path.length - 1])
      .filter(id => id)
    
    // Get sample products to show their category structure
    const { data: sampleProducts } = await supabase
      .from("products")
      .select("id, fo_cim, kozzeteve, kategoria")
      .eq("kozzeteve", true)
      .limit(5)
    
    return (
      <div className="py-12 px-4 md:px-8 lg:px-12 bg-yellow-50 border-2 border-yellow-400">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-bold text-yellow-900 mb-4">⚠️ DEBUG: Kategória szűrés - Nincs találat</h3>
          
          <div className="bg-white p-4 rounded mb-4">
            <h4 className="font-bold mb-2">Kiválasztott kategória ID-k:</h4>
            <p className="text-sm">categoryPaths: <code className="bg-gray-100 px-2 py-1 rounded">{JSON.stringify(config.categoryPaths)}</code></p>
            <p className="text-sm">Extracted IDs: <code className="bg-gray-100 px-2 py-1 rounded">{JSON.stringify(categoryIds)}</code></p>
          </div>
          
          <div className="bg-white p-4 rounded">
            <h4 className="font-bold mb-2">Minta termékek kategória struktúrája:</h4>
            <p className="text-xs text-gray-600 mb-2">Első 5 közzétett termék:</p>
            <div className="space-y-2">
              {sampleProducts?.map((p, i) => {
                const parsed = parsePaths(p.kategoria || [])
                const lastIds = parsed.map(path => path[path.length - 1])
                const match = lastIds.some(id => categoryIds.includes(id))
                return (
                  <div key={i} className={`text-xs p-2 rounded ${match ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}`}>
                    <p><strong>{p.fo_cim}</strong></p>
                    <p>Category JSON: <code className="text-xs">{JSON.stringify(p.kategoria)}</code></p>
                    <p>Parsed paths: <code className="text-xs">{JSON.stringify(parsed)}</code></p>
                    <p>Utolsó ID-k: <code className="text-xs">{JSON.stringify(lastIds)}</code></p>
                    <p className={match ? 'text-green-700 font-bold' : 'text-red-600'}>
                      {match ? '✅ ILLESZKEDIK' : '❌ NEM ILLESZKEDIK'}
                    </p>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm"><strong>💡 Tipp:</strong></p>
              <p className="text-xs">Ha egyik termék sem illeszkedik, válassz másik kategóriát!</p>
              <p className="text-xs">A "category JSON" és "Utolsó ID-k" mutatja, hogy milyen kategóriákban vannak a termékek.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="py-12 px-4 md:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {config.title && (
          <h2 className="text-3xl font-bold mb-8">{config.title}</h2>
        )}
        <ProductList
          products={products}
          slidesPerView640={1.5}
          slidesPerView768={2.5}
          slidesPerView1024={3}
          slidesPerView1280={4}
          slidesPerView1440={5}
        />
      </div>
    </div>
  )
}
