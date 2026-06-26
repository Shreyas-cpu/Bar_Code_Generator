import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useStore } from '../store/productStore';
import { EditProductModal } from './EditProductModal';
import { useAuth } from '../context/AuthContext';

interface ProductListProps {
  onSelectProduct: (product: Product) => void;
  selectedProductId?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ onSelectProduct, selectedProductId }) => {
  const products = useStore((state) => state.products);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'All'>(10);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.mrp.toString().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory ? product.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  // Pagination Logic
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Ensure current page is valid if filtered items change
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);

  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === 'All') return filteredProducts;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

  if (products.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-slate-500 dark:text-slate-400 font-medium">No products yet</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Products
          </h2>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full">
            {filteredProducts.length}
          </span>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Search name, code, or MRP..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="input-field !py-1.5 text-sm w-full sm:w-64"
          />
          <select 
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            className="input-field !py-1.5 text-sm w-full sm:w-32"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No products match your search.</div>
          ) : (
            paginatedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedProductId === product.id
                    ? 'bg-brand-50/60 dark:bg-brand-950/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{product.code}</p>
                    {isAdmin && product.username && (
                      <p className="text-xs text-indigo-400 mt-0.5">By: {product.username}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatter.format(product.mrp)}</span>
                    {isAdmin && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                          className="btn-secondary text-xs !px-2 !py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                          className="btn-danger text-xs !px-2 !py-1"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">MRP</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Added By</th>}
                {isAdmin && <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} className="px-6 py-12 text-center text-slate-500">
                    No products match your search.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedProductId === product.id
                        ? 'bg-brand-50/60 dark:bg-brand-950/20'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td
                      className="px-6 py-4 text-sm font-mono font-medium text-slate-700 dark:text-slate-300"
                      onClick={() => onSelectProduct(product)}
                    >
                      {product.code}
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100"
                      onClick={() => onSelectProduct(product)}
                    >
                      {product.name}
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100"
                      onClick={() => onSelectProduct(product)}
                    >
                      {formatter.format(product.mrp)}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400"
                      onClick={() => onSelectProduct(product)}
                    >
                      {product.category ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                          {product.username || '—'}
                        </span>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                            className="btn-secondary text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                            className="btn-danger text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-200/60 dark:border-slate-800/40 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { 
                setItemsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value)); 
                setCurrentPage(1); 
              }}
              className="input-field !py-1 !px-2 text-xs w-auto bg-white dark:bg-slate-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value="All">All</option>
            </select>
          </div>

          {itemsPerPage !== 'All' && totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};
