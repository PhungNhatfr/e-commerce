import {v2 as cloudinary} from "cloudinary" 
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";


// function for add product
const addProduct = async (req, res) => {
    try {
        
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({
            success: true,
            message: "Product Added"
        })


    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }

} 

// function for list product
const listProduct = async (req, res) => {
    
    try {
        
        const products = await productModel.find({});
        res.json({
            success: true,
            products
        })

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
} 

// function for remove product
const removeProduct = async (req, res) => {
    
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({
            success: true, 
            message: "Product Removed"
        })

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }

} 

// function for single product info
const singleProduct = async (req, res) => {
    
    try {
        
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({
            success: true,
            product
        })

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }

} 

// Find related products
const relatedProducts = async (req, res) => {
    try {
        const { productId, category, subCategory } = req.body;

        let products = await productModel.find({
            category: category,
            subCategory: subCategory,
            _id: { $ne: productId } 
        }).limit(5);

        let existingIds = products.map(p => p._id);
        existingIds.push(productId);

        if (products.length < 5) {
            const needed = 5 - products.length;
            const moreCategory = await productModel.find({
                category: category,
                _id: { $nin: existingIds }
            }).limit(needed);

            products = [...products, ...moreCategory];
            
            moreCategory.forEach(p => existingIds.push(p._id));
        }

        if (products.length < 5) {
            const needed = 5 - products.length;
            
            
            const fallbackProducts = await productModel.find({
                _id: { $nin: existingIds } 
            })
            .sort({ bestseller: -1 }) 
            .limit(needed);

            products = [...products, ...fallbackProducts];
        }

        res.json({
            success: true,
            products: products
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

// function find the product that bought together
const frequentlyBoughtTogether = async (req, res) => {

    try {
        
        const { productIds } = req.body;
        
        if (!productIds || productIds.length === 0) {
            return res.json({
                success: true,
                products: [],
            })
        }
        
        const products = await orderModel.aggregate([
        
            { $match: { "items._id": {$in: productIds} } },
            
            { $unwind: "$items" },
            
            { "$match": { "items._id": { $nin: productIds } } },
            
            {
                $group: {
                
                    _id: "$items._id",
                    
                    count: { $sum: 1 },
                    
                    productDetails: { $first: "$items"}
                    
                }
            },
            
            { $sort: { count: -1 } },
            
            { $limit: 5}
        
        ])
        
        const recommended = products.map(p => p.productDetails)
        
        res.json({
            success: true,
            products: recommended
        })
        
    } catch (error) {
        
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
    
}

// Function find the products that were bought by the person who have same style
const getPersonalizeProducts = async (req, res) => {

    try {
        
        const { userId } = req.body;
        
        if (!userId) {
            return res.json({
                success: false,
                message: "User ID is required"
            })
        }
        
        // Find all orders that have userId
        const userOrders = await orderModel.find({ userId })
        
        // Get the product (id product) that user bought
        const personalProducts = new Set();
        userOrders.forEach(order => {
            order.items.forEach(item => {
                personalProducts.add(String(item._id))
            })
        })
        
        if (personalProducts.size === 0) {
            return res.json({
                success: true,
                products: []
            })
        }
        
        // Find all products of maximum 100 users that bought minimum 1 product that the user (userId) bought
        const similarOrders = await orderModel.find({
        
            "items._id": { $in: Array.from(personalProducts) },
            userId: { $ne: userId }
        }).limit(100);
        
        const candidateProduct = {}
        
        similarOrders.forEach(order => {
            order.items.forEach(item => {
                const itemId = String(item._id);
                // We just need the products that the user didn't buy
                if (!personalProducts.has(itemId)) {
                    // if we have this product in candidate, we will increase score 1
                        // if not (it means that this product didn't exist in candidate product), we will save this product in candidiate product and make the score = 1
                    if (candidateProduct[itemId]) {
                        candidateProduct[itemId].score +=1
                    } else {
                        candidateProduct[itemId] = {
                            ...item,
                            scrore: 1
                        }
                    }
                }
            
            })
        
        })
        
        
        // Now we choose the best 5 product (5 products with the most apprearance)
        const recommendations = Object.values(candidateProduct).sort((a, b) => b.score - a.score).slice(0, 5);
        
        res.json({
            success: true,
            products: recommendations,
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }

}

export {listProduct, addProduct, removeProduct, singleProduct, frequentlyBoughtTogether, getPersonalizeProducts, relatedProducts}