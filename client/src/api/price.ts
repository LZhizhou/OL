import Price from "../types/price";

class PriceApi {
  async getPrices(): Promise<Price[]> {
    const response = await fetch("/api/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  }
}

export const priceApi = new PriceApi();
