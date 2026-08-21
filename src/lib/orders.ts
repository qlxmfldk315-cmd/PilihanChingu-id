// This file defines what one item in a customer's cart looks like.
// "interface" here is just a description/shape, not code that runs —
// it tells TypeScript "every cart item must have these fields."

export interface OrderItemInput {
  name: string        // item name, e.g. "Round Lab Sunscreen"
  priceKRW: number     // price in Korean Won as a plain number
  url?: string          // optional link to the item (the "?" means it's not required)
}