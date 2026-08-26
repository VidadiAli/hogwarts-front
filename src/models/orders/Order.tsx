import React, { useEffect, useState } from 'react';
import './Order.css';
import api from '../../api/api';

export type OrderStatus = 'CREATED' | 'CANCELED' | 'ACCEPTED' | 'PREPARED' | 'WAITING' | 'COMPLETED';

export interface AllOrderResponseDto {
  id: number;
  productName: string;
  productImage: string;
  productColor: string;
  userName: string;
  userSurname: string;
  status?: OrderStatus;
}

export interface AllProductResponseDto {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface AllUserResponseDto {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export interface OneOrderResponseDto {
  id: number;
  isDelivery: boolean;
  location: string;
  status: OrderStatus;
  productCount: number;
  product: AllProductResponseDto;
  user: AllUserResponseDto;
}

const PROCESS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'CREATED', label: 'Sehr Yaradıldı', icon: '📜' },
  { key: 'ACCEPTED', label: 'Qəbul Edildi', icon: '✅' },
  { key: 'PREPARED', label: 'Hazırlanır', icon: '🧪' },
  { key: 'WAITING', label: 'Gözləmədə', icon: '🧹' },
  { key: 'COMPLETED', label: 'Tamamlandı', icon: '✨' },
];

const Order: React.FC = () => {
  const [allOrders, setAllOrders] = useState<AllOrderResponseDto[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<OneOrderResponseDto | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoadingList(true);
      const response = await api.get('/orders/getMyOrders');
      const list: AllOrderResponseDto[] = response?.data?.content || response?.data || [];
      setAllOrders(list);
      if (list.length > 0) {
        setSelectedOrderId(list[0].id);
      }
    } catch (err: any) {
      setError('Sifarişlərin siyahısı yüklənərkən xəta baş verdi.');
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      fetchSingleOrderDetails(selectedOrderId);
    }
  }, [selectedOrderId]);

  const fetchSingleOrderDetails = async (id: number) => {
    try {
      setLoadingDetails(true);
      const response = await api.get<OneOrderResponseDto>(`/orders/getOrderById/${id}`);
      setOrderDetails(response.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return PROCESS_STEPS.findIndex((step) => step.key === status);
  };

  if (loadingList) return <div className="orders-container"><p style={{ textAlign: 'center', color: '#d4af37' }}>Sifarişlər yüklənir...</p></div>;
  if (error) return <div className="orders-container"><p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p></div>;

  return (
    <div className="orders-container">
      <h2 className="orders-title">Sifarişlərimin İdarə Paneli</h2>

      {allOrders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#8a8a9e' }}>Heç bir sifariş tapılmadı.</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>Bütün Sifarişlər</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allOrders.map((ord) => {
                const isSelected = selectedOrderId === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: isSelected ? '#2d2d44' : '#1e1e2f',
                      border: isSelected ? '1px solid #d4af37' : '1px solid #2d2d44',
                      padding: '12px 15px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {ord.productImage && (
                      <img
                        src={ord.productImage}
                        alt={ord.productName}
                        style={{
                          width: '55px',
                          height: '55px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #3d3d5c',
                          flexShrink: 0
                        }}
                      />
                    )}

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Sifariş #{ord.id}</strong>
                        {ord.productColor && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: '#2b2b40',
                              color: '#d4af37',
                              border: '1px solid #3d3d5c'
                            }}
                          >
                            {ord.productColor}
                          </span>
                        )}
                      </div>

                      <p style={{ margin: '4px 0 2px 0', color: '#e1e1e1', fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ord.productName}
                      </p>

                      <p style={{ margin: 0, color: '#8a8a9e', fontSize: '0.8rem' }}>
                        {ord.userName} {ord.userSurname}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: '2', minWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>Sifariş Xəritəsi və Detalları</h3>

            {loadingDetails ? (
              <p style={{ color: '#d4af37' }}>Detallar yüklənir...</p>
            ) : orderDetails ? (
              <div className="order-card" style={{ marginTop: 0 }}>
                <div className="order-header">
                  <span className="order-id">Sifariş #{orderDetails.id}</span>
                  <span className="order-date">
                    {orderDetails.user ? `${orderDetails.user.name} ${orderDetails.user.surname}` : ''}
                  </span>
                </div>

                {orderDetails.status === 'CANCELED' ? (
                  <div className="canceled-banner">
                    ❌ Bu sifariş ləğv edilmişdir.
                  </div>
                ) : (
                  <div className="status-tracker">
                    {PROCESS_STEPS.map((step, index) => {
                      const currentStepIndex = getStepIndex(orderDetails.status);
                      const isCompleted = index < currentStepIndex;
                      const isActive = index === currentStepIndex;

                      let stepClass = 'status-step';
                      if (isCompleted) stepClass += ' completed';
                      if (isActive) stepClass += ' active';

                      return (
                        <div key={step.key} className={stepClass}>
                          <div className="step-icon-wrapper">
                            {isCompleted ? '✓' : step.icon}
                          </div>
                          <span className="step-label">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="order-details">
                  <div>
                    <span>Məhsul: </span>
                    <strong>{orderDetails.product?.name} ({orderDetails.productCount} ədəd)</strong>
                  </div>
                  <div>
                    <span>Çatdırılma: </span>
                    <strong>{orderDetails.isDelivery ? `Bəli (${orderDetails.location})` : 'Mağazadan təhvil'}</strong>
                  </div>
                  <div>
                    <span>Məbləğ: </span>
                    <strong style={{ color: '#e99f15' }}>
                      {(orderDetails.product?.price || 0)} AZN
                    </strong>
                  </div>
                  <div>
                    <span>Ümumi Məbləğ: </span>
                    <strong style={{ color: '#d4af37' }}>
                      {(orderDetails.product?.price || 0) * orderDetails.productCount} AZN
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#8a8a9e' }}>Zəhmət olmasa soldan bir sifariş seçin.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;