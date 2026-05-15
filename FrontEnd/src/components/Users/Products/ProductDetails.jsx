import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useParams } from "react-router-dom";
import { getProductById } from "../../../Services/api";
import ProductSimilar from "./ProductSimilar";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // إضافة حالة التحميل

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true); // بدء التحميل
        const response = await getProductById(id);
        console.log("Product Response:", response.data);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null); // في حالة الخطأ، لا يوجد منتج
      } finally {
        setLoading(false); // انتهاء التحميل
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-white to-gray-50">
        {/* الشعار - تأثير واحد فقط */}
        <div className="relative mb-8">
          {/* دائرة خلفية واحدة وناعمة */}
          <div className="absolute inset-0 rounded-full bg-zinc-100 animate-pulse opacity-30 blur-sm"></div>

          {/* الشعار الرئيسي - حركة واحدة بسيطة */}
          <img
            src="/Logo1.png"
            alt="جاري التحميل"
            className="relative w-36 h-auto animate-soft-bounce"
          />
        </div>
        {/* نص التحميل */}
        <div className="text-center">
          {/* نقاط متحركة - تصميم أنظف */}
          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
            <div
              className="w-3 h-3 bg-zinc-800 rounded-full animate-fade"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 bg-zinc-800 rounded-full animate-fade"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-zinc-800 rounded-full animate-fade"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-2xl font-bold text-gray-800 mb-2">
            المنتج غير موجود
          </p>
          <p className="text-gray-600">
            عذراً، لم نتمكن من العثور على المنتج المطلوب
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  // عرض تفاصيل المنتج
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProductCard product={product} />
        <ProductSimilar
          categoryId={product.Category?.id}
          currentProductId={product.id}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
