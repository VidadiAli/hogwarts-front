import type { basketType, ProductListResponseDto } from "../types/TotalTypes";

export const handleBasket = (element: ProductListResponseDto) => {
    const storedBasket = localStorage.getItem('magicBasket');
    const data: basketType[] = storedBasket ? JSON.parse(storedBasket) : [];

    const index = data.findIndex((item) => item.product.id === element.id);

    if (index === -1) {
        data.push({
            product: element,
            productCount: 1,
        });
    } else {
        data[index].productCount += 1;
    }

    localStorage.setItem('magicBasket', JSON.stringify(data));
};