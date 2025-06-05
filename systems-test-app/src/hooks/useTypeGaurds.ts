type SaleEvent = {
  p_id: number;
  delta: number;
  timestamp: number;
  storeId: number;
};

const useTypeGaurds = () => {
  const isValidSaleEvent = (obj: any): obj is SaleEvent => {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.p_id === "number" &&
      typeof obj.delta === "number" &&
      typeof obj.timestamp === "number" &&
      typeof obj.storeId === "number"
    );
  };

  return { isValidSaleEvent };
};
