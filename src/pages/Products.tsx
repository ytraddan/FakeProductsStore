import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { deleteProduct, toggleFavorite } from "@/state/productsSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { Product } from "@/types/product";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LikeButton } from "@/components/ui/LikeButton";
import { RootState } from "@/state/store";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductCardProps = {
  product: Product;
  handleProductClick: (id: number) => void;
  handleDelete: (id: number) => void;
  handleToggleFavorite: (id: number) => void;
  handleIsLiked: (id: number) => boolean;
  navigate: (path: string) => void;
};

type PageHeaderProps = {
  showFavorites: boolean;
  handleToggleShowFavorites: () => void;
  navigate: (path: string) => void;
};

type NavigationProps = {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
};

export const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { items, favorites, loading, error } = useSelector(
    (state: RootState) => state.products,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [priceRange, setPriceRange] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const itemsPerPage = isLg ? 8 : isMd ? 6 : 4;

  const categories = [...new Set(items.map((item) => item.category))];

  const filteredProducts = items
    .filter((product) =>
      showFavorites ? favorites.includes(product.id) : true,
    )
    .filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((product) => {
      if (category === "all") return true;
      return product.category === category;
    })
    .filter((product) => {
      switch (priceRange) {
        case "0-49":
          return product.price <= 49;
        case "50-99":
          return product.price >= 50 && product.price <= 99;
        case "100+":
          return product.price >= 100;
        default:
          return true;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleProductClick = (id: number) => {
    navigate(`/products/${id}`);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteProduct(id));
  };

  const handleToggleFavorite = (id: number) => {
    dispatch(toggleFavorite(id));
  };

  const handleIsLiked = (id: number) => {
    return favorites.includes(id);
  };

  const handleToggleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setCurrentPage(1);
  };

  const handleSetPriceRange = (value: string) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const handleSetCategory = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <LoadingSkeleton itemsPerPage={itemsPerPage} />;
  }

  if (error) {
    return (
      <div className="mt-20 flex h-screen flex-col items-center">
        <h1 className="text-3xl font-bold text-red-500">
          Failed to load products
        </h1>
        <p className="text-md text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        showFavorites={showFavorites}
        handleToggleShowFavorites={handleToggleShowFavorites}
        navigate={navigate}
      />

      <div className="my-6 flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => handleChange(e)}
        />
        <div className="flex gap-2">
          <PriceFilter
            priceRange={priceRange}
            setPriceRange={handleSetPriceRange}
          />
          <CategoryFilter
            category={category}
            categories={categories}
            setCategory={handleSetCategory}
          />
        </div>
      </div>
      <div className="sm:mb-18 mb-20 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            handleProductClick={handleProductClick}
            handleDelete={handleDelete}
            handleToggleFavorite={handleToggleFavorite}
            handleIsLiked={handleIsLiked}
            navigate={navigate}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <Navigation
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

const CategoryFilter = ({
  category,
  categories,
  setCategory,
}: {
  category: string;
  categories: string[];
  setCategory: (value: string) => void;
}) => (
  <Select value={category} onValueChange={setCategory}>
    <SelectTrigger className="w-40">
      <SelectValue placeholder="Category" />
    </SelectTrigger>
    <SelectContent className="relative" position="popper">
      <SelectItem value="all">All Categories</SelectItem>
      {categories.map((category) => (
        <SelectItem key={category} value={category}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const PriceFilter = ({
  priceRange,
  setPriceRange,
}: {
  priceRange: string;
  setPriceRange: (value: string) => void;
}) => (
  <Select value={priceRange} onValueChange={setPriceRange}>
    <SelectTrigger className="w-32">
      <SelectValue placeholder="Price Range" />
    </SelectTrigger>
    <SelectContent className="relative" position="popper">
      <SelectItem value="all">All Prices</SelectItem>
      <SelectItem value="0-49">$0 - $49</SelectItem>
      <SelectItem value="50-99">$50 - $99</SelectItem>
      <SelectItem value="100+">$100+</SelectItem>
    </SelectContent>
  </Select>
);

const PageHeader = ({
  showFavorites,
  handleToggleShowFavorites,
  navigate,
}: PageHeaderProps) => (
  <div className="flex items-start justify-between">
    <h1 className="text-2xl font-bold dark:text-white">Fake Products Store</h1>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <LikeButton isLiked={showFavorites} onClick={handleToggleShowFavorites} />
      <Button onClick={() => navigate("/create-product")}>
        Create Product
      </Button>
    </div>
  </div>
);

const ProductCard = ({
  product,
  handleProductClick,
  handleDelete,
  handleToggleFavorite,
  handleIsLiked,
  navigate,
}: ProductCardProps) => (
  <Card className="overflow-hidden">
    <CardHeader className="p-4">
      <CardTitle className="flex items-center justify-between">
        <span className="max-w-64 truncate">{product.title}</span>
        <span>${product.price}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-2">
      <div
        className="cursor-pointer"
        onClick={() => handleProductClick(product.id)}
      >
        <img
          src={product.image}
          alt={product.title}
          className="mx-auto mb-4 h-20 rounded-xl sm:h-44"
        />
        <p className="line-clamp-2 text-sm text-gray-500 first-letter:uppercase">
          {product.description}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="p-2 sm:p-3"
            onClick={() => navigate(`/products/${product.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 sm:p-3"
            onClick={() => handleDelete(product.id)}
          >
            Delete
          </Button>
        </div>
        <LikeButton
          isLiked={handleIsLiked(product.id)}
          onClick={() => handleToggleFavorite(product.id)}
        />
      </div>
    </CardContent>
  </Card>
);

const Navigation = ({
  currentPage,
  totalPages,
  handlePageChange,
}: NavigationProps) => (
  <Pagination className="fixed bottom-8 left-0 right-0 w-fit rounded-lg bg-zinc-100/80 backdrop-blur-sm dark:bg-zinc-900">
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          onClick={() => {
            if (currentPage > 1) {
              handlePageChange(currentPage - 1);
            }
          }}
          className={
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
      {Array.from({ length: totalPages }, (_, i) => (
        <PaginationItem key={i + 1}>
          <PaginationLink
            onClick={() => handlePageChange(i + 1)}
            isActive={currentPage === i + 1}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem>
        <PaginationNext
          onClick={() => {
            if (currentPage < totalPages) {
              handlePageChange(currentPage + 1);
            }
          }}
          className={
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);

const LoadingSkeleton = ({ itemsPerPage }: { itemsPerPage: number }) => (
  <div className="container mx-auto p-4">
    <div className="flex items-start justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-8 w-32" />
    </div>

    <div className="my-7 flex flex-col gap-4 sm:flex-row">
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(itemsPerPage)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="p-4">
            <Skeleton className="h-5 w-full" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <Skeleton className="mx-auto mb-4 h-20 w-full rounded-xl sm:h-44" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-2 flex items-center justify-between">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
