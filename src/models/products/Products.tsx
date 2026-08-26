import React, { useEffect, useRef, useState } from "react";
import "./Products.css";
import type { FilterProps, ProductListResponseDto } from "../../types/TotalTypes";
import api from "../../api/api";
import { NavLink } from "react-router-dom";
import { formatUrl } from "../../utilities/urlFormat";
import { handleBasket } from "../../utilities/functions";

const Products: React.FC<FilterProps> = ({ filter }) => {
    const [products, setProducts] = useState<ProductListResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setPage(0);
        setProducts([]);
    }, [filter]);

    const fetchProducts = async (currentPage: number) => {
        setLoading(true);
        try {
            const response = await api.post(`/products/filterProducts?page=${currentPage}&size=20`, filter);
            const newProducts = response.data.content || [];

            // Səhifə 0-dırsa sıfırdan yaz, əks halda əvvəlkilərin üstünə əlavə et
            setProducts((prev) => (currentPage === 0 ? newProducts : [...prev, ...newProducts]));
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, [page, filter]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && page + 1 < totalPages) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [page, totalPages, loading]);

    return (
        <div className="user-products-container">
            <div className="user-products-header">
                <h2 className="user-products-title">Məhsullar</h2>
                <p className="user-products-subtitle">Sehrli aləmin ən müasir və premium seçimlərini kəşf edin</p>
            </div>

            <div className="user-products-grid">
                {products.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="user-product-card">
                        <div className="user-card-image-wrapper">
                            {product.imageUrl?.image ? (
                                <img
                                    src={product.imageUrl.image}
                                    alt={product.name}
                                    className="user-card-image"
                                />
                            ) : (
                                <div className="user-no-image">
                                    <span>Şəkil Yoxdur</span>
                                </div>
                            )}
                            {product.hasDiscount && (
                                <span className="user-discount-badge">-{product.discount}%</span>
                            )}
                        </div>

                        <div className="user-card-body">
                            <h3 className="user-product-name">{product.name}</h3>

                            <div className="user-price-row">
                                <div className="user-price-box">
                                    {product.hasDiscount ? (
                                        <span className="user-product-price old-price">{product.price} AZN</span>
                                    ) : (
                                        <span className="user-product-price">{product.price} AZN</span>
                                    )}
                                </div>
                                {product.hasDelivery && (
                                    <span className="user-delivery-badge">⚡Çatdırılma var</span>
                                )}
                            </div>

                            <div className="user-price-row">
                                {product.hasDiscount && (
                                    <div className="user-price-box">
                                        <span className="user-product-price">
                                            {(product.price - (product.price * product.discount) / 100).toFixed(2)} AZN
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="user-card-actions">
                                <NavLink to={`/product/${product.id}/${formatUrl(product.name)}`} className="user-btn-details">Ətraflı</NavLink>
                                <button
                                    className="user-btn-order"
                                    onClick={() => handleBasket(product)}
                                >
                                    Səbətə at
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="user-products-loading">
                    <div className="user-spinner"></div>
                    <span>Məhsullar yüklənir...</span>
                </div>
            )}

            <div ref={observerRef} className="scroll-trigger" style={{ height: "20px" }} />
        </div>
    );
};

export default Products;