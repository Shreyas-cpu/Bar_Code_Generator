import { Product } from '../types';
import { useStore } from '../store/productStore';

interface ProductListProps {
  onSelectProduct: (product: Product) => void;
  selectedProductId?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ onSelectProduct, selectedProductId }) => {
  const products = useStore((state) => state.getProducts());
  const deleteProduct = useStore((state) => state.deleteProduct);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

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
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Products
        </h2>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full">
          {products.length}
        </span>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {products.map((product) => (
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
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatter.format(product.mrp)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                  className="btn-danger text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">MRP</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {products.map((product) => (
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
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="btn-danger text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
