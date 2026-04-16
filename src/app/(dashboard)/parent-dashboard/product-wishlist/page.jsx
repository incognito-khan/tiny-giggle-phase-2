"use client";

import { useState, useEffect } from "react";
import CategoryTabs from "@/components/parent-dashboard/shopping/category-tabs";
import ProductGrid from "@/components/parent-dashboard/shopping/product-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "@/store/slices/productSlice";
import { getAllCategories } from "@/store/slices/categorySlice";
import { addToCart } from '@/store/slices/cartSlice';
import { toggleFavoriteProduct, getProductFavorites } from "@/store/slices/favoriteSlice";
import Loading from "@/components/loading";
import ParentHeader from '@/components/layout/header/parent-header';
import { toast } from "react-toastify";

export default function BabyShoppingPage() {
    const user = useSelector((state) => state.auth.user)
    const products = useSelector((state) => state.favorite.favoriteProducts);
    console.log(products);
    const categories = useSelector((state) => state.category.categories);
    console.log(categories);
    const [activeCategory, setActiveCategory] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState(products);
    const dispatch = useDispatch();

    const gettingAllProducts = () => {
        dispatch(getProductFavorites({ setLoading, parentId: user?.id }));
    };

    const gettingAllCategories = () => {
        dispatch(getAllCategories({ setLoading }));
    };

    useEffect(() => {
        gettingAllProducts();
        gettingAllCategories();
    }, []);

    useEffect(() => {
        if (activeCategory === 1) {
            setFilteredProducts(products);
        } else {
            const filterd = products.filter(
                (product) => product.categoryId === activeCategory
            );
            setFilteredProducts(filterd);
        }
    }, [activeCategory, products]);

    const handelAddToCart = (productId, price) => {
        dispatch({
            type: "cart/updateLocalQuantity",
            payload: { productId, change: 1, price }
        });
        toast.success("Added To Cart")
        dispatch(addToCart({ productId, parentId: user?.id, quantity: 1 }))
    }

    const toggleFavorites = (productId, product) => {
        dispatch({
            type: "favorite/toggleLocalFavorite",
            payload: { productId, product }
        });
        dispatch(toggleFavoriteProduct({ productId, parentId: user?.id }));
        // const updatedFavProducts = products?.filter((product) => product.product.id !== productId);
        // setFilteredProducts(updatedFavProducts);
    }

    return (
        <div className="min-h-screen w-screen bg-background">
            {loading && <Loading />}
            <ParentHeader />
            {/* Category Tabs */}
            <CategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                categories={categories}
                type={"Products"}
            />

            {/* Product Grid */}
            {filteredProducts?.length > 0 ? (
                <ProductGrid products={filteredProducts} handelAddToCart={handelAddToCart} toggleFavorites={toggleFavorites} isWishlist={true} />
            ) : (
                <div className="flex justify-center">
                    No Favorite Product Found
                </div>
            )}
        </div>
    );
}
