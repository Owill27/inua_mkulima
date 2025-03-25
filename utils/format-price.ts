import numeral from "numeral";

export function formatPrice(price: number, currency: string = "Kes") {
  return numeral(price).format("0,0[.]00") + " " + currency;
}
