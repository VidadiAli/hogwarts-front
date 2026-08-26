import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderStatus, type basketType, type OrderCreateDto, type ProfileProps } from "../../types/TotalTypes";
import "./Basket.css";
import api from "../../api/api";

const STORE_LOCATION = "Sehrli Mağaza, Əsas Filial";

const Basket: React.FC<ProfileProps> = ({profile}) => {
  const [basketItems, setBasketItems] = useState<basketType[]>([]);
  const [selectedItem, setSelectedItem] = useState<basketType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeliveryChoice, setIsDeliveryChoice] = useState<boolean>(true);
  const [userAddress, setUserAddress] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedBasket = localStorage.getItem("magicBasket");
    if (storedBasket) {
      try {
        const parsed: basketType[] = JSON.parse(storedBasket);
        setBasketItems(parsed);
      } catch (err) {
        console.error("Basket parse error:", err);
      }
    }
  }, []);

  const updateLocalStorage = (updatedItems: basketType[]) => {
    setBasketItems(updatedItems);
    localStorage.setItem("magicBasket", JSON.stringify(updatedItems));
  };

  const handleIncrease = (productId: string | number) => {
    const updated = basketItems.map((item) => {
      if (item.product.id === productId) {
        return { ...item, productCount: item.productCount + 1 };
      }
      return item;
    });
    updateLocalStorage(updated);
  };

  const handleDecrease = (productId: string | number) => {
    const updated = basketItems
      .map((item) => {
        if (item.product.id === productId) {
          return { ...item, productCount: item.productCount - 1 };
        }
        return item;
      })
      .filter((item) => item.productCount > 0);

    updateLocalStorage(updated);
  };

  const handleRemove = (productId: string | number) => {
    const updated = basketItems.filter((item) => item.product.id !== productId);
    updateLocalStorage(updated);
  };

  const sendOrderToBackend = async (payload: OrderCreateDto) => {
    try {
      await api.post('/orders/createOrder', payload);
      alert(`Sifariş yaradıldı!\nStatus: ${payload.status}\nÜnvan: ${payload.location}`);
      setIsModalOpen(false);
      setUserAddress("");
      setSelectedItem(null);
      handleRemove(payload.product)
    } catch (error) {
      console.error("Sifariş göndərilərkən xəta yarandı:", error);
    }
  };

  const handleSingleOrder = (item: basketType) => {
    console.log(profile)
    if (!profile?.id) {
      alert("Zəhmət olmasa ilk öncə daxil olun!");
      return;
    }

    const hasDelivery = item.product.hasDelivery ?? false;

    if (!hasDelivery) {
      const payload: OrderCreateDto = {
        isDelivery: false,
        location: STORE_LOCATION,
        status: OrderStatus.CREATED,
        productCount: item.productCount,
        product: Number(item.product.id),
        user: Number(profile.id),
      };
      sendOrderToBackend(payload);
    } else {
      setSelectedItem(item);
      setIsDeliveryChoice(true);
      setUserAddress("");
      setIsModalOpen(true);
    }
  };

  const handleConfirmModalOrder = () => {
    if (!selectedItem || !profile?.id) return;

    if (isDeliveryChoice && !userAddress.trim()) {
      alert("Çatdırılma ünvanı boş ola bilməz!");
      return;
    }

    const payload: OrderCreateDto = {
      isDelivery: isDeliveryChoice,
      location: isDeliveryChoice ? userAddress.trim() : STORE_LOCATION,
      status: OrderStatus.CREATED,
      productCount: selectedItem.productCount,
      product: Number(selectedItem.product.id),
      user: Number(profile.id),
    };

    sendOrderToBackend(payload);
  };

  if (basketItems.length === 0) {
    return (
      <div className="basket-empty-wrapper">
        <h2>Səbətiniz boşdur 🛒</h2>
        <button onClick={() => navigate(-1)} className="btn-back-shop">
          Alış-verişə davam et
        </button>
      </div>
    );
  }

  return (
    <div className="basket-wrapper">
      <div className="basket-header">
        Sehrli Səbət ✨
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Geri
        </button>
      </div>

      <div className="basket-grid">
        {basketItems.map((item) => {
          const pro = item.product;
          const unitPrice = pro.hasDiscount
            ? pro.price - (pro.price * pro.discount) / 100
            : pro.price;
          const totalItemPrice = (unitPrice * item.productCount).toFixed(2);
          const mainImage = pro.imageUrl?.image;

          return (
            <div key={pro.id} className="basket-card">
              <div className="basket-card-img-wrapper">
                {mainImage ? (
                  <img src={mainImage} alt={pro.name} />
                ) : (
                  <div className="no-img">Şəkil Yoxdur</div>
                )}
                {pro.hasDiscount && (
                  <span className="basket-discount-badge">-{pro.discount}%</span>
                )}
              </div>

              <div className="basket-card-info">
                <h3 className="basket-item-title">{pro.name}</h3>

                <div className="basket-price-row">
                  <span className="price-label">Vahid qiymət:</span>
                  <span className="price-val">{unitPrice.toFixed(2)} AZN</span>
                </div>

                <div className="basket-quantity-controls">
                  <button onClick={() => handleDecrease(pro.id)}>-</button>
                  <span>{item.productCount}</span>
                  <button onClick={() => handleIncrease(pro.id)}>+</button>
                </div>

                <div className="basket-item-total">
                  <span>Cəmi: </span>
                  <span className="total-val">{totalItemPrice} AZN</span>
                </div>
              </div>

              <div className="basket-card-order-box">
                <button
                  className="btn-single-order"
                  onClick={() => handleSingleOrder(item)}
                >
                  Bu Məhsulu Sifariş Et
                </button>
                <button
                  className="btn-remove-item"
                  onClick={() => handleRemove(pro.id)}
                >
                  Səbətdən Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="order-modal">
            <h3>Çatdırılma Seçimi</h3>
            <p className="modal-product-name">{selectedItem.product.name}</p>

            <div className="delivery-option-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="deliveryChoice"
                  checked={isDeliveryChoice}
                  onChange={() => setIsDeliveryChoice(true)}
                />
                Ünvana çatdırılsın
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="deliveryChoice"
                  checked={!isDeliveryChoice}
                  onChange={() => setIsDeliveryChoice(false)}
                />
                Mağazadan təhvil alacam ({STORE_LOCATION})
              </label>
            </div>

            {isDeliveryChoice && (
              <div className="address-input-group">
                <label htmlFor="delivery-address-input">Çatdırılma Ünvanı:</label>
                <input
                  id="delivery-address-input"
                  type="text"
                  placeholder="Ünvanı daxil edin..."
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-confirm-order" onClick={handleConfirmModalOrder}>
                Təsdiqlə
              </button>
              <button
                className="btn-close-modal"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItem(null);
                }}
              >
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Basket;