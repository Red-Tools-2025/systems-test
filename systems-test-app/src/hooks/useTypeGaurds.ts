import { SaleEvent } from "@/types/events";

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

export default useTypeGaurds;
