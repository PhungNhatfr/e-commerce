import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify';
import Title from './Title';
import ProductItem from './ProductItem';
import axios from 'axios';

const FrquentlyBoughtTogether = () => {
    
    const { backendUrl, cartItems, getCartCount } = useContext(ShopContext);
    const [frequentBoughtTogetherProducts, setFrequentlyBoughtTogetherProducts] = useState([]);
    
    const fetchFrequentlyBoughtTogetherProducts = async () => {
    
        const productIds = Object.keys(cartItems);
        
        if (productIds.length === 0) {
            setFrequentlyBoughtTogetherProducts([]);
            return;
        }
        
        try {
            
            const response = await axios.post(backendUrl + '/api/product/together', {productIds})
            
            if (response.data.success) {
                setFrequentlyBoughtTogetherProducts(response.data.products);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
        
    }
    
    useEffect(() => {
        fetchFrequentlyBoughtTogetherProducts();
    }, [cartItems])
    
    
  return  getCartCount() && frequentBoughtTogetherProducts ? (
      <div className='my-24'>
          <div className='text-center text-3xl py-2'>
            <Title text1={'RECOMMENDATION'} text2={'PRODUCTS'} />
          </div>
          
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
              {frequentBoughtTogetherProducts.map((item, index) => (
                <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image} />
            ))}
          </div>
      </div>
  ) : null
}

export default FrquentlyBoughtTogether