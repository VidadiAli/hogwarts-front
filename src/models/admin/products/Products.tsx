import React, { useEffect, useState } from "react";
import "./Products.css";
import type {
  ProductImageDto,
  ProductListResponseDto,
  ProductDetailResponseDto,
  ProductTypePayload,
  ProductPropertyInput
} from "../../../types/TotalTypes";
import api from "../../../api/api";
import { deleteImage, uploadImage } from "../../../utilities/Cloudinary";
import { FaPen } from "react-icons/fa";

interface Category { id: number; name: string; }
interface Property { id: number; name: string; type?: "TEXT" | "NUMBER" | "CHECKBOX" | string; }

const initialFormState: ProductTypePayload = {
  name: "",
  price: 0,
  hasDiscount: false,
  discount: 0,
  productCount: 0,
  viewCount: 0,
  hasDelivery: false,
  barkod: "",
  categoryId: "",
  images: [],
  properties: [],
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductListResponseDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);

  const [formData, setFormData] = useState<ProductTypePayload>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Detail Modal Vəziyyəti (getProductById)
  const [detailProduct, setDetailProduct] = useState<ProductDetailResponseDto | null>(null);
  const [selectedDetailImg, setSelectedDetailImg] = useState<string>("");

  // Şəkil yükləmə
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageColor, setImageColor] = useState<string>("#000000");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [publicIds, setPublicIds] = useState<string[]>([]);
  const [allPublicIds, setAllPublicIds] = useState<string[]>([]);
  const [showColorInput, setShowColorInput] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, propRes] = await Promise.all([
          api.get("/categories/getAllCategories"),
          api.get("/properties/getAllProperties")
        ]);
        setCategories(catRes.data || []);
        setAvailableProperties(propRes.data || []);
      } catch (error) {
        console.error("Kateqoriya və ya xüsusiyyətlər yüklənərkən xəta:", error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchProducts = async (currentPage: number = 0) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/getAllProducts?page=${currentPage}&size=10`);
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Məhsullar yüklənərkən xəta:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Ətraflı Məhsul Məlumatı (Backend: getProductById)
  const handleOpenDetail = async (id: number) => {
    try {
      const response = await api.get(`/products/getProductById/${id}`);
      const data: ProductDetailResponseDto = response.data;
      setDetailProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedDetailImg(data.images[0].image);
      } else {
        setSelectedDetailImg("");
      }
    } catch (error) {
      console.error("Ətraflı məlumat gətirilərkən xəta:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  // Dinamik Property Əlavə/Silmə
  const handleAddProperty = () => {
    if (availableProperties.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      properties: [...prev.properties, { propertyId: availableProperties[0].id, value: "" }]
    }));
  };

  const handlePropertyChange = (index: number, field: "propertyId" | "value", val: string | number) => {
    setFormData((prev) => {
      const updatedProps = [...prev.properties];
      updatedProps[index] = {
        ...updatedProps[index],
        [field]: field === "propertyId" ? Number(val) : val
      };
      return { ...prev, properties: updatedProps };
    });
  };

  const handleRemoveProperty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index)
    }));
  };

  // Şəkil Yükləmə (Cloudinary -> ProductImageDto)
  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const uploadedData = await uploadImage(selectedFile);
      const newImg: ProductImageDto = {
        image: uploadedData.url, // Cloudinary-dən gələn link 'image' sahəsinə mənimsədilir
        publicId: uploadedData.publicId,
        color: imageColor,
      };
      setFormData((prev) => ({ ...prev, images: [...prev.images, newImg] }));
      setAllPublicIds((prev) => [...prev, uploadedData.publicId]);
      setSelectedFile(null);
      document.querySelector<HTMLInputElement>('input[type="file"]')!.value = "";
      document.querySelector<HTMLInputElement>('input[type="color"]')!.value = "";
    } catch (error) {
      console.error("Şəkil yüklənərkən xəta:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    const itemPublicId: string | undefined = formData?.images[index]?.publicId;
    if (itemPublicId) setPublicIds(prev => [...prev, itemPublicId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/products/updateProduct/${editingId}`, formData);
      } else {
        await api.post("/products/createProduct", formData);
      }

      console.log(publicIds)
      if (publicIds.length > 0) {
        await Promise.all(publicIds.map(element => deleteImage(element)));
      }

      resetForm();
      fetchProducts(page);
    } catch (error) {
      console.error("Məhsul saxlanılarkən xəta:", error);
    }
  };

  const handleCancelForm = async () => {
    // Yalnız saxlanılmadan ləğv edilən şəkilləri silirik
    if (allPublicIds.length > 0) {
      await Promise.all(allPublicIds.map((element) => deleteImage(element)));
    }
    resetForm();
  };

  // Redaktə üçün məlumatın gətirilməsi
  const handleEdit = async (id: number) => {
    try {
      const response = await api.get(`/products/getProductById/${id}`);
      const detail: ProductDetailResponseDto = response.data;

      const formattedProperties: ProductPropertyInput[] = detail.properties?.map((p) => ({
        propertyId: p.propertyId,
        value: p.value
      })) || [];

      setFormData({
        name: detail.name,
        price: detail.price,
        hasDiscount: detail.hasDiscount,
        discount: detail.discount,
        productCount: detail.productCount,
        viewCount: detail.viewCount,
        hasDelivery: detail.hasDelivery,
        barkod: detail.barkod,
        categoryId: detail.categoryId || "",
        images: detail.images || [],
        properties: formattedProperties
      });

      setEditingId(detail.id);
      setIsFormOpen(true);
      setAllPublicIds([]);
      setPublicIds([]);
    } catch (error) {
      console.error("Düzəliş üçün məlumat gətirilərkən xəta:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bu məhsulu silmək istədiyinizdən əminsiniz?")) {
      try {
        await api.delete(`/products/deleteProduct/${id}`);
        fetchProducts(page);
      } catch (error) {
        console.error("Silinmə xətası:", error);
      }
    }
  };


  const selectImage = (publicId: string) => {
    setShowColorInput(publicId);
  }

  const changeColor = (publicId: string, color: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.publicId === publicId ? { ...img, color } : img
      ),
    }));
  };

  const resetForm = async () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="admin-products-container">
      <div className="admin-header">
        <h2>Məhsulların İdarə Edilməsi</h2>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setIsFormOpen(!isFormOpen);
            setAllPublicIds([]);
            setPublicIds([]);
          }}
        >
          {isFormOpen ? "Formu Bağla" : "+ Yeni Məhsul"}
        </button>
      </div>

      {/* YARATMA / YENİLƏMƏ MODAL */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editingId ? "Məhsulu Yenilə" : "Yeni Məhsul Əlavə Et"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Ad</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Kateqoriya</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                    <option value="">Kateqoriya seçin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Qiymət (AZN)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Say</label>
                  <input type="number" name="productCount" value={formData.productCount} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Barkod</label>
                  <input type="text" name="barkod" value={formData.barkod} onChange={handleInputChange} required />
                </div>

                <div className="form-group checkbox-group">
                  <input type="checkbox" id="hasDiscount" name="hasDiscount" checked={formData.hasDiscount} onChange={handleInputChange} />
                  <label htmlFor="hasDiscount">Endirim Var?</label>
                </div>

                {formData.hasDiscount && (
                  <div className="form-group">
                    <label>Endirim (%)</label>
                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} />
                  </div>
                )}

                <div className="form-group checkbox-group">
                  <input type="checkbox" id="hasDelivery" name="hasDelivery" checked={formData.hasDelivery} onChange={handleInputChange} />
                  <label htmlFor="hasDelivery">Çatdırılma Var?</label>
                </div>
              </div>

              {/* Xüsusiyyətlər (Properties) */}
              <div className="form-section">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <strong>Xüsusiyyətlər</strong>
                  <button type="button" className="btn-secondary" onClick={handleAddProperty}>+ Əlavə Et</button>
                </div>

                {formData.properties.map((propItem, index) => {
                  // Seçilmiş ID-yə uyğun obyekti tapırıq (string/number fərqini aradan qaldırmaq üçün == istifadə olunur)
                  const selectedProp = availableProperties.find(
                    (p) => String(p.id) === String(propItem.propertyId)
                  );

                  // Tip dəyərini alırıq (böyük hərflə)
                  const propType = selectedProp?.type?.toUpperCase() || "TEXT";

                  return (
                    <div key={index} className="dynamic-row">
                      {/* 1. SELECT: Dəyişən kimi dərhal state yenilənir */}
                      <select
                        value={propItem.propertyId}
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);

                          // Seçilən yeni xüsusiyyətin tipini tapırıq
                          const newSelected = availableProperties.find((p) => p.id === selectedId);
                          const newType = newSelected?.type?.toUpperCase();

                          // Əgər CHECKBOX seçilərsə "false", əks halda boş mətn veririk
                          const defaultValue = newType === "RADIO" ? "false" : "";

                          // İki sahəni də state-də dərhal yeniləyirik
                          handlePropertyChange(index, "propertyId", selectedId);
                          handlePropertyChange(index, "value", defaultValue);
                        }}
                      >
                        <option value={0}>Xüsusiyyət seçin</option>
                        {availableProperties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      {/* 2. DİNANİK INPUT: propType dəyərinə uyğun dərhal tipi dəyişir */}
                      {propType === "RADIO" ? (
                        <input
                          type="checkbox"
                          checked={propItem.value === "true"}
                          onChange={(e) =>
                            handlePropertyChange(index, "value", e.target.checked ? "true" : "false")
                          }
                        />
                      ) : (
                        <input
                          type={propType === "NUMBER" ? "number" : "text"}
                          placeholder={propType === "NUMBER" ? "Rəqəm daxil edin" : "Dəyər daxil edin"}
                          value={propItem.value}
                          onChange={(e) => handlePropertyChange(index, "value", e.target.value)}
                          required
                        />
                      )}

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleRemoveProperty(index)}
                      >
                        Sil
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Şəkillər Və Rənglər */}
              <div className="form-section">
                <strong>Şəkil Və Rəng Əlavə Et</strong>
                <div className="dynamic-row" style={{ marginTop: "8px" }}>
                  <input className="file-field" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  <span className="color-text">Rəng seçin</span>
                  <input type="color" value={imageColor} onChange={(e) => setImageColor(e.target.value)} />
                  <button type="button" className="btn-secondary" onClick={handleImageUpload} disabled={!selectedFile || uploadingImage}>
                    {uploadingImage ? "Yüklənir..." : "Yüklə"}
                  </button>
                </div>

                <div className="image-previews">
                  {formData.images.map((img, index) => (
                    <div key={index} className="img-card">
                      <img src={img.image} alt="preview" />
                      <div style={{ background: img?.color }} className="img-color-box" onClick={() => selectImage(img.publicId || "")}>
                        <FaPen style={{ color: "white", fontSize: '8px' }} />
                      </div>
                      {
                        showColorInput === img.publicId && <input className="color-input" type="color" onChange={(e) => changeColor(img.publicId || "", e.target.value)} />
                      }
                      <button type="button" className="btn-remove-img" onClick={() => handleRemoveImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button type="submit" className="btn-primary">{editingId ? "Yenilə" : "Yadda Saxla"}</button>
                <button type="button" className="btn-secondary" onClick={handleCancelForm}>Ləğv Et</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ƏTRAFLI MƏLUMAT MODAL */}
      {detailProduct && (
        <div className="modal-overlay" onClick={() => setDetailProduct(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>{detailProduct.name} (Ətraflı)</h3>
              <button className="btn-secondary" onClick={() => setDetailProduct(null)}>×</button>
            </div>

            <div className="detail-grid">
              <div className="detail-gallery">
                {selectedDetailImg ? (
                  <img src={selectedDetailImg} className="detail-main-img" alt="Product" />
                ) : (
                  <div className="no-image">Şəkil yoxdur</div>
                )}

                <div className="detail-thumbs">
                  {detailProduct.images?.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image}
                      className={`detail-thumb ${selectedDetailImg === img.image ? "active" : ""}`}
                      onClick={() => setSelectedDetailImg(img.image)}
                      alt="Thumb"
                    />
                  ))}
                </div>
              </div>

              <div>
                <p><strong>Qiymət:</strong> {detailProduct.price} AZN</p>
                <p><strong>Barkod:</strong> {detailProduct.barkod}</p>
                <p><strong>Stok Sayı:</strong> {detailProduct.productCount} ədəd</p>
                <p><strong>Baxış Sayı:</strong> {detailProduct.viewCount}</p>
                <p><strong>Çatdırılma:</strong> {detailProduct.hasDelivery ? "Mövcuddur" : "Yoxdur"}</p>
                <p><strong>Endirim:</strong> {detailProduct.hasDiscount ? `${detailProduct.discount}%` : "Yoxdur"}</p>

                <div style={{ marginTop: "12px" }}>
                  <strong>Xüsusiyyətlər:</strong>
                  <div style={{ marginTop: "6px" }}>
                    {detailProduct.properties?.length > 0 ? (
                      detailProduct.properties.map((p, idx) => (
                        <span key={idx} className="prop-badge">
                          {p.propertyName}: <b>{p.value}</b>
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#94a3b8" }}>Xüsusiyyət yoxdur</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SİYAHI - KARTLAR (getAllProducts) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Yüklənir...</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="card-image-wrapper">
                {product.imageUrl?.image ? (
                  <img src={product.imageUrl.image} alt={product.name} />
                ) : (
                  <div className="no-image">Şəkil Yoxdur</div>
                )}

                {product.imageUrl?.color && (
                  <span
                    className="color-dot"
                    style={{ backgroundColor: product.imageUrl.color }}
                    title={`Rəng: ${product.imageUrl.color}`}
                  />
                )}

                {product.hasDiscount && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
              </div>

              <div className="card-content">
                <h4 className="product-title">{product.name}</h4>

                <div className="price-box">
                  <span className="current-price">{product.price} AZN</span>
                </div>

                <div className="card-stats">
                  <span>Stok: {product.productCount}</span>
                  <span>Baxış: {product.viewCount}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => handleOpenDetail(product.id)}>
                  Ətraflı
                </button>
                <button className="btn-secondary" onClick={() => handleEdit(product.id)}>
                  Düzəliş
                </button>
                <button className="btn-danger" onClick={() => handleDelete(product.id)}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((prev) => prev - 1)}>
          Əvvəlki
        </button>
        <span>Səhifə {page + 1} / {totalPages || 1}</span>
        <button className="btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Növbəti
        </button>
      </div>
    </div>
  );
};

export default Products;