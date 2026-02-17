import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useProduct, useCategories } from "@/hooks/useProducts";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useAdmin";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce
    .number()
    .positive("Must be positive")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required").max(100),
  inStock: z.boolean(),
  stockCount: z.coerce.number().int().min(0, "Must be 0 or more"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { data: existingProduct, isLoading: productLoading } = useProduct(id ?? "");
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      compareAtPrice: undefined,
      categoryId: "",
      brand: "",
      inStock: true,
      stockCount: 0,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        compareAtPrice: existingProduct.compareAtPrice ?? undefined,
        categoryId: existingProduct.categoryId,
        brand: existingProduct.brand,
        inStock: existingProduct.inStock,
        stockCount: existingProduct.stockCount,
      });
      setImages(existingProduct.images || []);
    }
  }, [isEditing, existingProduct, reset]);

  function addImage() {
    const url = imageInput.trim();
    if (url && !images.includes(url)) {
      setImages((prev) => [...prev, url]);
      setImageInput("");
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          ...values,
          images,
        });
      } else {
        await createMutation.mutateAsync({
          ...values,
          images,
          compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
        });
      }
      navigate("/admin/products");
    } catch {
      // Error is handled by the mutation
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error;

  if (isEditing && productLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Build a flat list of all categories (parents + children)
  const allCategories: Array<{ id: string; name: string; isChild: boolean }> = [];
  categories?.forEach((cat) => {
    allCategories.push({ id: cat.id, name: cat.name, isChild: false });
    cat.children?.forEach((child) => {
      allCategories.push({ id: child.id, name: child.name, isChild: true });
    });
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/products")}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEditing ? "Edit Product" : "New Product"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? "Update product information"
              : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(submitError as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "An error occurred. Please try again."}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — main info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>

              <div className="mt-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    placeholder="e.g. Boss DS-1 Distortion Pedal"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    {...register("description")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    placeholder="Detailed product description..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    {...register("brand")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    placeholder="e.g. Boss"
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    {...register("categoryId")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    disabled={categoriesLoading}
                  >
                    <option value="">Select a category</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.isChild ? `  └ ${cat.name}` : cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900">Images</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Add image URLs for this product
              </p>

              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                    placeholder="Paste image URL..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={url}
                          alt={`Product ${idx + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-600" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {images.length === 0 && (
                  <div className="mt-4 flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 py-8">
                    <PhotoIcon className="h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No images added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column — pricing & inventory */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900">Pricing</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Compare at Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("compareAtPrice")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    placeholder="Optional — shows strikethrough price"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900">Inventory</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    {...register("stockCount")}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    placeholder="0"
                  />
                  {errors.stockCount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.stockCount.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="inStock"
                    {...register("inStock")}
                    className="h-4 w-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    Available for sale
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 disabled:opacity-50"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
