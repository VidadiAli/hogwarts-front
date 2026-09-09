import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaFont, FaHashtag, FaDotCircle, FaEdit } from "react-icons/fa";
import "./Properties.css";
import type { PropertyType, PropertyTypeResponse } from "../../../types/TotalTypes";
import api from "../../../api/api";

type FeatureType = "TEXT" | "NUMBER" | "RADIO";

const Properties: React.FC = () => {
  const [products, setProducts] = useState<PropertyTypeResponse[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [editingProduct, setEditingProduct] = useState<PropertyTypeResponse | null>(null);

  const [formData, setFormData] = useState<PropertyType>({
    name: "",
    type: "TEXT",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/properties/getAllProperties");
      const data = response.data as PropertyTypeResponse[];
      setProducts(data);
    } catch (error) {
      console.error("Məhsullar gətirilərkən xəta yarandı:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (selectedType: FeatureType) => {
    setFormData((prev) => ({
      ...prev,
      type: selectedType,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", type: "TEXT" });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setEditingProduct(null);
      setFormData({ name: "", type: "TEXT" });
      setShowForm(true);
    }
  };

  const startEditing = (product: PropertyTypeResponse) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type as FeatureType,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const response = await api.patch(`/properties/updateProperty/${editingProduct.id}`, formData);
        const updatedItem = response.data as PropertyTypeResponse;

        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? { ...item, ...formData, ...updatedItem } : item))
        );
      } else {
        const response = await api.post("/properties/createProperty", formData);
        setProducts((prev) => [...prev, response.data]);
      }

      resetForm();
    } catch (error) {
      console.error("Əməliyyat zamanı xəta yarandı:", error);
    }
  };

  return (
    <div className="properties-container">
      <div className="properties-header">
        <h1 className="properties-title">Xüsusiyyətlər və Məhsullar</h1>
        <button className="properties-add-btn" onClick={handleOpenAddForm}>
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? "Bağla" : "Məhsul Əlavə Et"}
        </button>
      </div>

      {showForm && (
        <div className="properties-form-card">
          <div className="properties-watermark">{formData.type || "TYPE"}</div>

          <h2 className="properties-form-title">
            {editingProduct ? "Xüsusiyyətə Düzəliş Et" : "Yeni Məhsul Xüsusiyyəti"}
          </h2>

          <form className="properties-form" onSubmit={handleSubmit}>
            <div className="properties-form-group">
              <label>Xüsusiyyətin Adı</label>
              <input
                type="text"
                name="name"
                className="properties-input"
                placeholder="Məs: Rəng, Ölçü, Çəki..."
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="properties-form-group">
              <label>Xüsusiyyətin Tipi (Type)</label>
              <div className="properties-type-selector">
                <button
                  type="button"
                  className={`properties-type-btn ${formData.type === "TEXT" ? "active" : ""}`}
                  onClick={() => handleTypeSelect("TEXT")}
                >
                  <FaFont /> Text
                </button>
                <button
                  type="button"
                  className={`properties-type-btn ${formData.type === "NUMBER" ? "active" : ""}`}
                  onClick={() => handleTypeSelect("NUMBER")}
                >
                  <FaHashtag /> Number
                </button>
                <button
                  type="button"
                  className={`properties-type-btn ${formData.type === "RADIO" ? "active" : ""}`}
                  onClick={() => handleTypeSelect("RADIO")}
                >
                  <FaDotCircle /> Radio
                </button>
              </div>
            </div>

            <div className="properties-form-group">
              <label>Tipe Uyğun Önizləmə (Read-Only)</label>
              <div className="properties-preview-box">
                {formData.type === "TEXT" && (
                  <input
                    type="text"
                    className="properties-readonly-input"
                    value="Mətn daxil etmə sahəsi"
                    readOnly
                  />
                )}

                {formData.type === "NUMBER" && (
                  <input
                    type="number"
                    className="properties-readonly-input"
                    value="12345"
                    readOnly
                  />
                )}

                {formData.type === "RADIO" && (
                  <div className="properties-radio-preview">
                    Yalnız iki seçimli tiplər üçün:
                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="radio" checked readOnly name="preview" /> Var / Yoxdur
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="properties-submit-btn">
                {editingProduct ? "Yenilə" : "Yadda Saxla"}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  className="properties-submit-btn"
                  style={{ background: "#6c757d" }}
                  onClick={resetForm}
                >
                  Ləğv et
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="properties-empty">Yüklənir...</div>
      ) : products.length === 0 ? (
        <div className="properties-empty">Hələ ki heç bir məhsul yoxdur.</div>
      ) : (
        <div className="properties-grid">
          {products.map((product) => (
            <div key={product.id} className="properties-card">
              <div className="properties-card-watermark">{product.type}</div>

              <div className="properties-card-header">
                <div className="properties-card-title-group">
                  <div className="properties-type-icon">
                    {product.type === "TEXT" && <FaFont />}
                    {product.type === "NUMBER" && <FaHashtag />}
                    {product.type === "RADIO" && <FaDotCircle />}
                  </div>
                  <h3 className="properties-card-name">{product.name}</h3>
                </div>

                <div className="properties-card-actions">
                  <button
                    className="properties-action-btn edit"
                    onClick={() => startEditing(product)}
                    title="Düzəliş et"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>

              <p className="properties-card-desc">Tip: {product.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;