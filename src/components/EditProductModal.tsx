import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';
import { useStore } from '../store/productStore';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    code: product.code,
    name: product.name,
    mrp: product.mrp.toString(),
    sellingPrice: product.sellingPrice ? product.sellingPrice.toString() : '',
    category: product.category || '',
  });

  const updateProduct = useStore((state) => state.updateProduct);
  const products = useStore((state) => state.products);

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.mrp) {
      alert('Please fill all required fields');
      return;
    }

    // Check uniqueness only if the code changed
    if (formData.code.toLowerCase() !== product.code.toLowerCase()) {
      if (products.some(p => p.code.toLowerCase() === formData.code.toLowerCase())) {
        alert('A product with this code already exists! Please use a unique Product Code.');
        return;
      }
    }

    const updates: Partial<Product> = {
      code: formData.code,
      name: formData.name,
      mrp: parseFloat(formData.mrp),
      sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : undefined,
      category: formData.category,
    };

    await updateProduct(product.id, updates);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Product</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Product Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input-field"
                maxLength={9}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                MRP (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                step="0.01"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Selling Price (₹) <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                step="0.01"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <input
                type="text"
                name="category"
                list="edit-category-options"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              />
              <datalist id="edit-category-options">
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" form="edit-product-form" className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
