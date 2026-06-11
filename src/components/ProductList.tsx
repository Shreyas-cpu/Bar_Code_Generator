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

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No products yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Products ({products.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">MRP</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Barcode</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
                  selectedProductId === product.id ? 'bg-blue-100' : ''
                }`}
              >
                <td
                  className="px-6 py-4 text-sm font-mono text-gray-900"
                  onClick={() => onSelectProduct(product)}
                >
                  {product.code}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-900"
                  onClick={() => onSelectProduct(product)}
                >
                  {product.name}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-900"
                  onClick={() => onSelectProduct(product)}
                >
                  ₹{product.mrp.toFixed(2)}
                </td>
                <td
                  className="px-6 py-4 text-sm font-mono text-gray-900"
                  onClick={() => onSelectProduct(product)}
                >
                  {product.barcode}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-900"
                  onClick={() => onSelectProduct(product)}
                >
                  {product.category || '-'}
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
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
