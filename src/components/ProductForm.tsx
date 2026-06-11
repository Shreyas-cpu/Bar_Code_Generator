import { useState } from 'react';
import { useStore } from '../store/productStore';
import { Product } from '../types';

export const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    mrp: '',
    category: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const addProduct = useStore((state) => state.addProduct);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.mrp) {
      alert('Please fill all required fields');
      return;
    }

    const product: Omit<Product, 'id' | 'createdAt' | 'barcode'> = {
      code: formData.code,
      name: formData.name,
      mrp: parseFloat(formData.mrp),
      category: formData.category,
    };

    addProduct(product);

    setFormData({
      code: '',
      name: '',
      mrp: '',
      category: '',
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/40 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New Product</h2>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-slide-down flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Product added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Product Code <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., WM001"
            className="input-field"
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
            placeholder="e.g., Women's Top"
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
            placeholder="e.g., 499"
            step="0.01"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Tops, Sarees, etc."
            className="input-field"
          />
        </div>

        <button type="submit" className="btn-primary w-full mt-2">
          Add Product
        </button>
      </form>
    </div>
  );
};
