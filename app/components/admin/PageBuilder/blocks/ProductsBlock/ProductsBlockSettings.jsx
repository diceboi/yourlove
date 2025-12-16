"use client"

import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput"
import CategoryPathMultiSelect from "@/app/components/UI/Inputfield/CategoryPathMultiSelect"
import TagsMultiSelect from "@/app/components/UI/Inputfield/TagsMultiSelect"
import ProductsMultiSelect from "@/app/components/UI/Inputfield/ProductsMultiSelect"

export default function ProductsBlockSettings({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value })
  }

  return (
    <div className="space-y-4">
      <SmallTextInput
        legend="Szekció címe"
        value={config.title || ''}
        handleChange={(e) => handleChange('title', e.target.value)}
        placeholder="Termékek"
      />

      <CategoryPathMultiSelect
        label="Kategóriák"
        value={config.categoryPaths || []}
        onChange={(paths) => handleChange('categoryPaths', paths)}
        from="product-categories"
      />

      <TagsMultiSelect
        label="Címkék"
        value={config.tagIds || []}
        onChange={(ids) => handleChange('tagIds', ids)}
        from="product-tags"
      />

      <ProductsMultiSelect
        label="Egyedi termékek"
        value={config.productIds || []}
        onChange={(ids) => handleChange('productIds', ids)}
        placeholder="Válassz ki termékeket…"
      />

      <SmallTextInput
        legend="Maximum termékek"
        value={config.limit || 8}
        handleChange={(e) => handleChange('limit', parseInt(e.target.value) || 8)}
        placeholder="8"
        type="number"
      />
    </div>
  )
}
