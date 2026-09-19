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
  {
    id: 'zigzag-slowand-tshirt',
    name: 'Slowand Wool-Blend Layered T-Shirt (3 colors)',
    priceKRW: 26400,
    url: 'https://zigzag.kr/catalog/products/171349199',
    image: 'https://cf.product-image.s.zigzag.kr/original/c/17/134/919/171349199-6586984151104064797.jpeg',
  },
  {
    id: 'zigzag-ateo-lip-gloss',
    name: 'Ateo Lip Gloss Balm Duo (+ Blur Cream Cheek Set)',
    priceKRW: 38900,
    url: 'https://zigzag.kr/catalog/products/160479683',
    image: 'https://cf.product-image.s.zigzag.kr/original/d/2026/9/18/51699_202609181435442353_56687.jpeg',
  },
  {
    id: 'daiso-vt-pdrn-toner',
    name: 'VT PDRN Glow Toner 200ml',
    priceKRW: 5000,
    url: 'https://www.daisomall.co.kr/pd/pdr/SCR_PDR_0001?pdNo=1067495',
    image: 'https://cdn.daisomall.co.kr/file/PD/20260908/3J2IVmbWFVgnei1tyfv71067495_00_003J2IVmbWFVgnei1tyfv7.jpg',
  },
  {
    id: 'daiso-mimo-mamonde-mask',
    name: 'Mimo by Mamonde Rosy Hyaluron Hydrogel Mask (1pc)',
    priceKRW: 2000,
    url: 'https://www.daisomall.co.kr/pd/pdr/SCR_PDR_0001?pdNo=1083813',
    image: 'https://cdn.daisomall.co.kr/file/PD/20260914/jLpnJvaYmFraeDorbBP81083813_00_00jLpnJvaYmFraeDorbBP8.jpg',
  },
  {
    id: 'daiso-vt-reedle-shot',
    name: 'VT Reedle Shot 300 Facial Boosting First Ampoule (2ml x 6)',
    priceKRW: 3000,
    url: 'https://www.daisomall.co.kr/pd/pdr/SCR_PDR_0001?pdNo=1049276',
    image: 'https://cdn.daisomall.co.kr/file/PD/20251226/biuEYxzjCmX6JMJEi1e01049276_00_01biuEYxzjCmX6JMJEi1e0.jpg',
  },
  {
    id: 'daiso-truelab-hair-mask',
    name: "True.LAB Expert Nourishing Hair Mask 250ml",
    priceKRW: 5000,
    url: 'https://www.daisomall.co.kr/pd/pdr/SCR_PDR_0001?pdNo=1076110',
    image: 'https://cdn.daisomall.co.kr/file/PD/20260421/HehzRtIoWpVaEyJr66gn1076110_00_00HehzRtIoWpVaEyJr66gn.jpg',
  },
  {
    id: 'daiso-dailycomma-hair-perfume',
    name: 'Daily Comma Most Hair Perfume Clean Veil 30ml',
    priceKRW: 3000,
    url: 'https://www.daisomall.co.kr/pd/pdr/SCR_PDR_0001?pdNo=1082391',
    image: 'https://cdn.daisomall.co.kr/file/PD/20260708/DdhaX5kJr7aX3PbI4nXp1082391_00_01DdhaX5kJr7aX3PbI4nXp.jpg',
  },
  {
    id: 'oliveyoung-mediheal-mask-set',
    name: 'Mediheal Essential Mask Pack — 10+1 Set, Choose 7 Types',
    priceKRW: 10000,
    url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000223414',
    image: 'https://image.oliveyoung.co.kr/cfimages/cf-goods/uploads/images/thumbnails/400/10/0000/0022/A000000223414125ko.png?l=ko&QT=100&SF=webp&sharpen=1x0.5',
  },
]

export default products