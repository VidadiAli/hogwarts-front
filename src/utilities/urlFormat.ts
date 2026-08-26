export const formatUrl = (txt: string): string => {
    return txt
        .toLowerCase()
        .trim()
        .replace(/ə/g, 'e')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/[^a-z0-9 -]/g, '') // Hərf, rəqəm və tire-dən başqa bütün xüsusi simvolları silir
        .replace(/\s+/g, '-')        // Boşluqları '-' ilə əvəz edir
        .replace(/-+/g, '-');        // Arxa-arxaya gələn tireləri tək tire edir
}