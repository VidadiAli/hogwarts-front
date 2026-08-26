import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaEdit, FaFolder, FaFolderOpen } from "react-icons/fa";
import type { categoryType, categoryTypeResponse } from "../../../types/TotalTypes";
import api from "../../../api/api";
import "./Categories.css";

interface CategoryItemProps {
  category: categoryTypeResponse;
  allCategories: categoryTypeResponse[];
  startEditing: (category: categoryTypeResponse) => void;
  level?: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  allCategories,
  startEditing,
  level = 0,
}) => {
  const subFromFlatList = allCategories.filter(
    (cat) => cat.parentId && String(cat.parentId) === String(category.id)
  );

  const subFromNested = (category as any).subCategories || (category as any).children || [];

  const subCategories: categoryTypeResponse[] =
    subFromFlatList.length > 0 ? subFromFlatList : subFromNested;

  return (
    <div
      className="admin-categories-group"
      style={{ marginLeft: level > 0 ? `${level * 24}px` : "0px" }}
    >
      <div
        className={`admin-categories-card ${level === 0 ? "admin-categories-card-main" : "admin-categories-card-sub"
          }`}
      >
        <div className="admin-categories-card-info">
          {level === 0 ? (
            <FaFolderOpen className="admin-categories-icon-main" />
          ) : (
            <FaFolder className="admin-categories-icon-sub" />
          )}
          <span className={level === 0 ? "admin-categories-name-main" : "admin-categories-name-sub"}>
            {category.name}
          </span>
          <span className={level === 0 ? "admin-categories-badge-main" : "admin-categories-badge-sub"}>
            {level === 0 ? "Əsas" : `${level}-ci Səviyyə Alt`}
          </span>
        </div>
        <div className="admin-categories-card-actions">
          <button
            className="admin-categories-action-btn edit"
            onClick={() => startEditing(category)}
            title="Düzəliş et"
          >
            <FaEdit />
          </button>
        </div>
      </div>

      {subCategories && subCategories.length > 0 && (
        <div className="admin-categories-sub-list">
          {subCategories.map((subCat) => (
            <CategoryItem
              key={subCat.id}
              category={subCat}
              allCategories={allCategories}
              startEditing={startEditing}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface RenderOption {
  id: string | number;
  name: string;
  depth: number;
}

const getFlattenedCategories = (
  items: categoryTypeResponse[],
  depth = 0
): RenderOption[] => {
  let result: RenderOption[] = [];

  for (const item of items) {
    result.push({
      id: item.id,
      name: item.name,
      depth: depth,
    });

    const subList: categoryTypeResponse[] =
      (item as any).subCategories || (item as any).children || [];

    if (subList && subList.length > 0) {
      const childrenOptions = getFlattenedCategories(subList, depth + 1);
      result = result.concat(childrenOptions);
    }
  }

  return result;
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<categoryTypeResponse[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<categoryTypeResponse | null>(null);

  const [formData, setFormData] = useState<categoryType>({
    name: "",
    parentId: null,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/categories");
      console.log("Gələn DTO Datası:", response.data);
      setCategories(response.data as categoryTypeResponse[]);
    } catch (error) {
      console.error("Kateqoriyalar yüklənərkən xəta yarandı:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "parentId" ? (value === "" ? null : value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", parentId: null });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setEditingCategory(null);
      setFormData({ name: "", parentId: null });
      setShowForm(true);
    }
  };

  const startEditing = (category: categoryTypeResponse) => {
    setEditingCategory(category);
    console.log(category);
    setFormData({
      name: category.name,
      parentId: category.parentId ? String(category.parentId) : null,
    });
    setShowForm(true);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    name: formData.name,
    parentId: formData.parentId ? Number(formData.parentId) : null,
  };

  try {
    if (editingCategory) {
      await api.patch(`/categories/update/${editingCategory.id}`, payload);
    } else {
      await api.post("/categories", payload);
    }
    fetchCategories();
    resetForm();
  } catch (error) {
    console.error("Əməliyyat zamanı xəta yarandı:", error);
  }
};

  const mainCategories = categories.filter((cat) => !cat.parentId);

  return (
    <div className="admin-categories-container">
      <div className="admin-categories-header">
        <h1 className="admin-categories-title">Kateqoriya İdarəetməsi</h1>
        <button className="admin-categories-add-btn" onClick={handleOpenAddForm}>
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? "Bağla" : "Yeni Kateqoriya"}
        </button>
      </div>

      {showForm && (
        <div className="admin-categories-form-card">
          <h2 className="admin-categories-form-title">
            {editingCategory ? "Kateqoriyaya Düzəliş Et" : "Yeni Kateqoriya Əlavə Et"}
          </h2>

          <form className="admin-categories-form" onSubmit={handleSubmit}>
            <div className="admin-categories-form-group">
              <label className="admin-categories-label">Kateqoriya Adı</label>
              <input
                type="text"
                name="name"
                className="admin-categories-input"
                placeholder="Məs: Elektonika, Telefonlar..."
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="admin-categories-form-group">
              <label className="admin-categories-label">Valideyn (Parent) Kateqoriya</label>
              <select
                name="parentId"
                className="admin-categories-select"
                value={formData.parentId !== null && formData.parentId !== undefined ? String(formData.parentId) : ""}
                onChange={handleInputChange}
              >
                <option value="">-- Əsas Kateqoriya (Parent yoxdur) --</option>
                {getFlattenedCategories(categories)
                  .filter((cat) => String(cat.id) !== String(editingCategory?.id))
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.depth > 0 ? "\u00A0\u00A0".repeat(cat.depth * 2) + "↳ " : ""}
                      {cat.name}
                    </option>
                  ))}
              </select>
              <small className="admin-categories-hint">
                Əgər alt kateqoriyadırsa, aid olduğu kateqoriyanı seçin.
              </small>
            </div>

            <div className="admin-categories-form-actions">
              <button type="submit" className="admin-categories-submit-btn">
                {editingCategory ? "Yenilə" : "Yadda Saxla"}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  className="admin-categories-cancel-btn"
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
        <div className="admin-categories-empty">Yüklənir...</div>
      ) : categories.length === 0 ? (
        <div className="admin-categories-empty">Hələ ki heç bir kateqoriya yaradılmayıb.</div>
      ) : (
        <div className="admin-categories-tree">
          {mainCategories.map((mainCat) => (
            <CategoryItem
              key={mainCat.id}
              category={mainCat}
              allCategories={categories}
              startEditing={startEditing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;