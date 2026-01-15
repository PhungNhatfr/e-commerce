import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from 'react-toastify';
import ProductItem from "./ProductItem";
import Title from "./Title";

const RelatedProducts = ({ productId, category, subCategory }) => {
  const { products, backendUrl } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  const findRelatedProducts = async () => {
  
    try {
      
      const response = await axios.post(backendUrl + '/api/product/related-product', { productId, category, subCategory });
    
      if (response.data.success) {
        setRelated(response.data.products)
      } 
      
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
    
  };

  useEffect(() => {
    findRelatedProducts();
  }, [products]);

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
