import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Item Component
function Item({ id, name, image, new_price, old_price }) {
  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate(`/product/${id}`); 
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4 max-w-xs mx-2">
      <button onClick={handleClick} className="w-full h-60">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </button>
      <h2 className="text-lg font-semibold mb-2 text-center">{name}</h2>
      <p className="text-gray-500 text-center">
        <span className="line-through">${old_price}</span> 
        <span className="text-red-600 ml-2">${new_price}</span>
      </p>
      
    </div>
  );
}

// Popular Component
export default function Popular() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products`)
      .then((response) => response.json())
      .then((data) => {
        const transformedData = data.map((item) => ({
          id: item.id,
          name: item.title,
          image: item.image,
          new_price: item.price,
          old_price: item.price * 1.2 
        }));
        setProducts(transformedData);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="mt-16 px-4">
      <h1 className="text-3xl font-bold mb-4 flex justify-center relative">
        POPULAR IN WOMEN
      </h1>
      <div className="popular_item flex flex-wrap justify-center gap-4">
        {products.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
}
