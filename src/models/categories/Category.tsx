import { useEffect, useState } from "react";
import { FaChevronRight, FaFolder, FaTimes, FaArrowLeft, FaLayerGroup } from "react-icons/fa";
import api from "../../api/api";
import "./Category.css";
import type { CategoryProps, CategoryType } from "../../types/TotalTypes";

const Category: React.FC<CategoryProps> = ({ categoryClass, showCategory, filter, setFilter }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [history, setHistory] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const callCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callCategories();
  }, []);

  // Alt kateqoriyaları həm flat, həm nested struktur üçün tapır
  const getSubCategories = (category: CategoryType): CategoryType[] => {
    const nested = category.subCategories || category.children || [];
    if (nested.length > 0) return nested;

    return categories.filter(
      (cat) => cat.parentId && String(cat.parentId) === String(category.id)
    );
  };

  const handleCategoryClick = (category: CategoryType) => {
    setFilter({...filter, categoryId: category.id})
    setSelectedCategory(category);
    setHistory([category]);
  };

  const handleSubCategoryClick = (subCat: CategoryType) => {
    setFilter({...filter, categoryId: subCat.id})
    setSelectedCategory(subCat);
    setHistory((prev) => [...prev, subCat]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, history.length - 1);
      setHistory(newHistory);
      setSelectedCategory(newHistory[newHistory.length - 1]);
    } else {
      closeDrawer();
    }
  };

  const closeDrawer = () => {
    setSelectedCategory(null);
    setHistory([]);
  };

  // Əsas kateqoriyalar (Parent-i olmayanlar)
  const mainCategories = categories.filter((cat) => !cat.parentId);

  const activeSubCategories = selectedCategory ? getSubCategories(selectedCategory) : [];

  return (
    <div className={`user-categories-container ${showCategory ? categoryClass : ''}`}>
      <div className="user-categories-header">
        <h2><FaLayerGroup /> Kateqoriyalar</h2>
        <p>Axtardığınız məhsul və ya bölməni tapmaq üçün kateqoriya seçin</p>
      </div>

      {loading ? (
        <div className="user-categories-loading">Yüklənir...</div>
      ) : (
        <div className="user-categories-grid">
          {mainCategories.map((category) => {
            const subs = getSubCategories(category);
            const hasSubs = subs.length > 0;

            return (
              <div
                key={category.id}
                className={`user-category-card ${hasSubs ? 'has-subs' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="user-category-icon">
                  <FaFolder />
                </div>
                <div className="user-category-info">
                  <h3>{category.name}</h3>
                  {category.description && <p>{category.description}</p>}
                  {hasSubs && (
                    <span className="user-sub-count">{subs.length} alt kateqoriya</span>
                  )}
                </div>
                {hasSubs && <FaChevronRight className="user-arrow-icon" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Sağdan Açılan Panel (Drawer/Sidebar) */}
      <div className={`user-drawer-overlay ${selectedCategory ? 'open' : ''}`} onClick={closeDrawer} />
      
      <aside className={`user-drawer ${selectedCategory ? 'open' : ''}`}>
        {selectedCategory && (
          <>
            <div className="user-drawer-header">
              <div className="user-drawer-actions">
                {history.length > 1 ? (
                  <button className="user-drawer-back-btn" onClick={handleBack}>
                    <FaArrowLeft /> Geri
                  </button>
                ) : <span />}
                <button className="user-drawer-close-btn" onClick={closeDrawer}>
                  <FaTimes />
                </button>
              </div>

              {/* Naviqasiya yolu (Breadcrumb) */}
              <div className="user-breadcrumb">
                {history.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 && " / "}
                    <strong className={index === history.length - 1 ? "active" : ""}>
                      {item.name}
                    </strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="user-drawer-body">
              {selectedCategory.description && (
                <p className="user-drawer-description">{selectedCategory.description}</p>
              )}

              <h4 className="user-drawer-section-title">
                {activeSubCategories.length > 0 ? "Alt Bölmələr" : "Bu kateqoriyada alt bölmə yoxdur"}
              </h4>

              <div className="user-drawer-sub-list">
                {activeSubCategories.map((subCat) => {
                  const subHasSubs = getSubCategories(subCat).length > 0;

                  return (
                    <div
                      key={subCat.id}
                      className="user-drawer-sub-item"
                      onClick={() => handleSubCategoryClick(subCat)}
                    >
                      <div className="user-drawer-sub-info">
                        <span>{subCat.name}</span>
                        {subCat.description && <small>{subCat.description}</small>}
                      </div>
                      {subHasSubs && <FaChevronRight className="user-sub-arrow" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default Category;