const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const User = require("../models/users");
const product = require('../models/product');

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            return products;
        })
        .then(products => {
            //Çizge üzerinde dolaşan algoritma
            Category.find()
                .then((categories) => {
                    res.render('shop/products',
                        {
                            title: 'Shopping',
                            products: products,
                            path: '/',
                            categories: categories
                        });
                })
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.getProducts = (req, res, next) => {
    //her bir ürünün kategori bilgilerini içeren bir sonuç setini oluşturmal için aggregation kullanımı.
    //veri kümeleme kullanarak iki koleksiyonu birleştirme (join) işlemi.
    Product.aggregate([
        {
            //Birleştirme işlemini gerçekleştiren opratör.
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        }
    ])
        .then(productsWithCategories => {
            Category.find()
                .then(categories => {
                    res.render('shop/products', {
                        title: 'Shopping',
                        products: productsWithCategories,
                        path: '/',
                        categories: categories
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
}


exports.getProductsByCategoryId = (req, res, next) => {

    const categoryid = req.params.categoryid;
    const model = [];

    Category.find()
        .then((categories) => {
            model.categories = categories;
            return Product.find({
                categories: categoryid
            });
        })
        .then((products) => { 
            res.render('shop/products',
                {
                    title: 'Products',
                    products: products,
                    categories: model.categories,
                    selectedCategory: categoryid,
                    path: '/products'
                });
        })
        .catch((err) => {

        });


}

exports.getProduct = (req, res, next) => {

    //Çizge üzerinde dolaşan algoritma
    Product.findById(req.params.productid)
        .then(product => {
            res.render('shop/product-detail', {
                title: product.name,
                product: product,
                path: '/products'
            })
        }).catch((err) => {
            console.log(err);
        });

}

exports.getCart = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .then(user => {
            console.log(user.cart.items);
            res.render('shop/cart', {
                title: 'Cart',
                path: '/cart',
                products: user.cart.items               
            });
        }).catch(err => {
            console.log(err);
        });
}

exports.postCart = (req, res, next) => {

    const productid = req.body.productId;
    Product.findById(productid)
        .then(product => {
            console.log(product)
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

exports.postCartItemDelete = (req, res, next) => {

    const productid = req.body.productid;

    req.user
        .deleteCartItem(productid)
        .then(() => {
            res.redirect('/cart');
        }).catch((err) => {
            console.log(err);
        });
}

exports.getOrders = (req, res, next) => {

    //Sorgu performansı için kullanılan strateji: Sorgularda yalnızca ihtiyaç duyulan alanları seçmek, ağ trafiğini azaltır.
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                title: 'Orders',
                path: '/orders',
                orders: orders
            });

        })
        .catch(err => console.log(err));

}

exports.postOrder = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .then(user => {
            const order = new Order({
                user: {
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                },
                items: user.cart.items.map(p => {
                    return {
                        product: {
                            _id: p.productId._id,
                            name: p.productId.name,
                            price: p.productId.price,
                            imageUrl: p.productId.imageUrl
                        },
                        quantity: p.quantity
                    }
                })
            })
            return order.save()
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            console.log(err);
        })

}

exports.getProductDetails = (req, res, next) => {
    res.render('shop/details',
        {
            title: 'Details',
            path: '/details'
        });
}

exports.getAddProduct = (req, res, next) => {
    res.render('add-product',
        {
            title: 'Add a New Product',
            path: '/admin/add-product'
        });
}

exports.postAddProduct = (req, res, next) => {

    const product = new Product(
        req.body.name,
        req.body.price,
        req.body.imageUrl,
        req.body.description);

    product.saveProduct();
    res.redirect('/');
}