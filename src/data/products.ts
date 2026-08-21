export interface Product {
  id: string
  name: string
  priceKRW: number
  url?: string
  image?: string
}

const products: Array<Product> = [
  {
    id: 'olive-young-sunscreen',
    name: 'Medicube Zero Pore Pad',
    priceKRW: 18000,
    url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000161681',
    image: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/10/0000/0016/A00000016168148ko.png?l=ko&QT=100&SF=webp&sharpen=1x0.5'
  },
  {
    id: 'daiso-photocard-sleeve',
    name: 'High-Transparency Thick Mini Sleeves for Photocard Decorating (Pack of 30)',
    priceKRW: 12000,
    url: 'https://www.daisomall.co.kr/pd/pdr/SCR_PDR_0001?pdNo=B202604179519',
    image: 'https://cdn.daisomall.co.kr/file/PD/20241002/iMgrrBeHaFkEgCXISdDe1053552_00_00iMgrrBeHaFkEgCXISdDe.jpg',
  },
  {
    id: 'zigzag-chiffon-skirt',
    name: 'Sophia Chiffon Mermaid Skirt',
    priceKRW: 29200,
    url: 'https://zigzag.kr/catalog/products/129150099',
    image: 'https://cf.product-image.s.zigzag.kr/original/d/2026/2/19/7355_202602190941540024_94163.jpeg',
  },
]

export default products