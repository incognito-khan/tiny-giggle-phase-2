import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ShoppingCart, Star } from "lucide-react";
import { useSelector } from "react-redux";

// const products = [
//   {
//     id: 1,
//     name: "Organic Cotton Onesies Set",
//     price: "$24.99",
//     image: "/baby-onesies-organic-cotton.jpg",
//     description:
//       "Soft, breathable organic cotton onesies perfect for your little one's sensitive skin. Available in multiple colors and sizes.",
//   },
//   {
//     id: 2,
//     name: "Anti-Colic Baby Bottle",
//     price: "$18.99",
//     image: "/baby-bottle-anti-colic-feeding.jpg",
//     description:
//       "Advanced anti-colic system reduces feeding issues and promotes comfortable digestion for happier babies.",
//   },
//   {
//     id: 3,
//     name: "Plush Teddy Bear",
//     price: "$16.99",
//     image: "/soft-teddy-bear-baby-toy-plush.jpg",
//     description:
//       "Ultra-soft, hypoallergenic teddy bear made with premium materials. Perfect cuddle companion for newborns.",
//   },
//   {
//     id: 4,
//     name: "Gentle Baby Shampoo",
//     price: "$12.99",
//     image: "/baby-shampoo-gentle-organic-bottle.jpg",
//     description:
//       "Tear-free, organic formula with natural ingredients. Gentle cleansing for delicate baby hair and scalp.",
//   },
//   {
//     id: 5,
//     name: "Swaddle Blanket Set",
//     price: "$32.99",
//     image: "/baby-swaddle-blankets-soft-muslin.jpg",
//     description:
//       "Premium muslin swaddle blankets that provide comfort and security. Breathable fabric helps regulate temperature.",
//   },
//   {
//     id: 6,
//     name: "Baby Monitor with Camera",
//     price: "$89.99",
//     image: "/baby-monitor-camera-white-modern.jpg",
//     description: "HD video monitoring with night vision, two-way audio, and smartphone connectivity for peace of mind.",
//   },
//   {
//     id: 7,
//     name: "Convertible Car Seat",
//     price: "$199.99",
//     image: "/baby-car-seat-convertible-safety.jpg",
//     description:
//       "5-in-1 convertible car seat that grows with your child. Top safety ratings and premium comfort features.",
//   },
//   {
//     id: 8,
//     name: "Wooden Baby Rattle",
//     price: "$14.99",
//     image: "/wooden-baby-rattle-natural-organic-toy.jpg",
//     description: "Handcrafted wooden rattle with smooth finish. Natural, non-toxic materials safe for teething babies.",
//   },
// ]

export default function ProductGrid({ products, handelAddToCart, toggleFavorites, isWishlist }) {
  const favorites = useSelector((state) => state.favorite.favoriteProducts);
  console.log(favorites, 'favorites from ProductGrid')
  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((item) => {
          const product = isWishlist ? item?.product : item;
          const isFavorite = favorites?.some((f) => f.productId === product?.id);
          return (
            <Card
              key={product?.id}
              className="group rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden py-0"
            >
              <CardContent className="p-0 !pt-0">
                <div className="h-[220px] overflow-hidden rounded-t-2xl bg-muted">
                  <img
                    src={product?.image || "/placeholder.svg"}
                    alt={product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-card-foreground text-balance leading-tight">
                    {product?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product?.slug}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-pink-500">
                      {product?.salePrice} <small className="text-xs text-gray-500">In stock ({product?.quantity})</small>
                    </span>
                    <div className="flex items-center gap-3">
                      <Star
                        className={`w-7 h-7 cursor-pointer`}
                      stroke={isFavorite ? "#facc15" : "#e5e7eb"}
                      fill={isFavorite ? "#facc15" : "none"}
                      onClick={() => toggleFavorites(product?.id, product)}
                      />
                      <Button
                        size="sm"
                        className="rounded-xl bg-pink-500 text-white hover:bg-pink-600 cursor-pointer shadow-sm"
                        onClick={() => handelAddToCart(product?.id, product?.salePrice)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
