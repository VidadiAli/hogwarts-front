import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import type { ProductDetailResponseDto, ProductImageDto, ProductListResponseDto } from "../../types/TotalTypes";
import "./Product.css";
import { handleBasket } from "../../utilities/functions";

const Product: React.FC = () => {
    const { id } = useParams<{ id: string; name: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDetailResponseDto | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/getProductById/${id}`);
                const data: ProductDetailResponseDto = response.data;
                setProduct(data);

                if (data.images && data.images.length > 0) {
                    // İlk mövcud rəngi varsayılan seç
                    const initialColor = data.images[0].color || "";
                    setSelectedColor(initialColor);
                    setSelectedImage(data.images[0].image);
                }
            } catch (err) {
                console.error(err);
                setError("Məhsul tapılmadı və ya xəta baş verdi.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const uniqueColors = useMemo(() => {
        if (!product?.images) return [];
        const colorsMap = new Map<string, ProductImageDto>();

        product.images.forEach((img) => {
            const colorKey = img.color;
            if (colorKey && !colorsMap.has(colorKey)) {
                colorsMap.set(colorKey, img);
            }
        });

        return Array.from(colorsMap.values());
    }, [product]);

    const filteredImages = useMemo(() => {
        if (!product?.images) return [];
        if (!selectedColor) return product.images;

        return product.images.filter(
            (img) => (img.color) === selectedColor
        );
    }, [product, selectedColor]);

    // Rəng dəyişdikdə ilk şəkli böyük şəkil et
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const firstImgOfColor = product?.images.find(
            (img) => (img.color) === color
        );
        if (firstImgOfColor) {
            setSelectedImage(firstImgOfColor.image);
        }
    };

    const toBasket = (product: ProductDetailResponseDto) => {
        if (product.productCount <= 0) return;
        const item: ProductListResponseDto = {
            id: product.id,
            name: product.name,
            price: product.price,
            hasDiscount: product.hasDiscount,
            discount: product.discount,
            productCount: product.productCount,
            viewCount: product.viewCount,
            hasDelivery: product.hasDelivery,
            imageUrl: product.images[0]
        }
        handleBasket(item);
    }

    if (loading) {
        return (
            <div className="product-detail-loading">
                <div className="user-spinner"></div>
                <span>Məhsul məlumatları yüklənir...</span>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <h3>{error || "Məhsul tapılmadı."}</h3>
                <button onClick={() => navigate(-1)} className="btn-back">
                    ← Geri Qayıt
                </button>
            </div>
        );
    }

    const finalPrice = product.hasDiscount
        ? (product.price - (product.price * product.discount) / 100).toFixed(2)
        : product.price;

    return (
        <div className="product-detail-wrapper">
            <button onClick={() => navigate(-1)} className="btn-back">
                ← Geri
            </button>

            <div className="product-detail-card">
                <div className="product-detail-media">
                    <div className="product-detail-main-img-wrapper">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="product-detail-main-img"
                            />
                        ) : (
                            <div className="product-detail-no-image">
                                <span>Şəkil Yoxdur</span>
                            </div>
                        )}
                        {product.hasDiscount && (
                            <span className="product-detail-discount-badge">
                                -{product.discount}%
                            </span>
                        )}
                    </div>

                    {filteredImages.length > 0 && (
                        <div className="product-detail-thumbnails">
                            {filteredImages.map((imgObj, idx) => (
                                <img
                                    key={imgObj.id || idx}
                                    src={imgObj.image}
                                    alt=""
                                    className={`thumbnail-img ${selectedImage === imgObj.image ? "active" : ""}`}
                                    onClick={() => setSelectedImage(imgObj.image)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-detail-info-section">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-barcode">Barkod: {product.barkod}</p>

                    <div className="product-detail-price-box">
                        {product.hasDiscount ? (
                            <>
                                <span className="product-detail-old-price">{product.price} AZN</span>
                                <span className="product-detail-current-price">{finalPrice} AZN</span>
                            </>
                        ) : (
                            <span className="product-detail-current-price">{product.price} AZN</span>
                        )}
                    </div>

                    {uniqueColors.length > 0 && (
                        <div className="product-color-selector">
                            <h4>Rəng Seçimi:</h4>
                            <div className="color-options">
                                {uniqueColors.map((imgObj, idx) => {
                                    const colorVal = imgObj.color || `Rəng ${idx + 1}`;
                                    return (
                                        <button
                                            key={imgObj.id || idx}
                                            className={`color-btn ${selectedColor === colorVal ? "active" : ""}`}
                                            onClick={() => handleColorChange(colorVal)}
                                        >
                                            <img src={imgObj.image} alt={colorVal} className="color-btn-thumb" />
                                            <span>{colorVal}</span>
                                            <span style={{ background: colorVal, padding: '6px', borderRadius: '50%' }}></span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="product-detail-meta-list">
                        {product.hasDelivery && (
                            <span className="user-delivery-badge">⚡ Çatdırılma var</span>
                        )}
                        <span className="meta-item">Stokda: {product.productCount > 0 ? product.productCount + ' ədəd' : "Mövcud deyil"}</span>
                    </div>

                    {product.properties && product.properties.length > 0 && (
                        <div className="product-detail-properties">
                            <h4>Xüsusiyyətlər</h4>
                            <ul>
                                {product.properties.map((prop, idx) => (
                                    <li key={prop.id || idx}>
                                        <span className="prop-name">{prop.propertyName}:</span>
                                        <span className="prop-val">{prop.value === 'true'
                                            ? 'Mövcuddur' : prop.value === 'false'
                                                ? 'Mövcud deyil' : prop.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="product-detail-actions">
                        <button
                            onClick={() => toBasket(product)}
                            className={`btn-order-now  ${product.productCount <= 0 && "no-product"}`} >
                            {product.productCount > 0 ? 'Səbətə əlavə et' : 'Bazada mövcud deyil'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;