import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify';
import Title from './Title';
import ProductItem from './ProductItem';
import axios from 'axios';

const PersonalizeProducts = () => {
    
    const { backendUrl, token} = useContext(ShopContext);
    const [personalizeProducts, setPersonalizeProducts] = useState([]);
    
    const fetchPersonalizeProducts = async () => {
    
        try {
            
            const response = await axios.post(backendUrl + '/api/product/personalize', {}, {headers: {token}})
            
            if (response.data.success) {
                setPersonalizeProducts(response.data.products);
            }
            
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
        
    }
    
    useEffect(() => {
        if (token) {
            fetchPersonalizeProducts();
        } else {
            setPersonalizeProducts([])
        }
    }, [token])
    
    
  return  personalizeProducts ? (
      <div className='my-24'>
          <div className='text-center text-3xl py-2'>
            <Title text1={'PERSONALIZE'} text2={'PRODUCTS'} />
          </div>
          
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
              {personalizeProducts.map((item, index) => (
                <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image} />
            ))}
          </div>
      </div>
  ) : null
}

export default PersonalizeProducts