import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Star, Award } from 'lucide-react';

const Shop = () => {
  const { focusStats, equipHat, deductPoints, equippedHat, purchasedHats, purchaseHat } = useAppContext();

  const items = [
    {
      id: 1,
      name: "Lion Hat Style 1",
      description: "A classic hat for your lion companion",
      price: 100,
      image: "/src/assets/lion_hat_1_scaled_10x_pngcrushed.png",
      category: "Cosmetic"
    },
    {
      id: 2,
      name: "Lion Hat Style 2",
      description: "Give your lion a stylish new look",
      price: 200,
      image: "/src/assets/lion_hat_2_scaled_10x_pngcrushed.png",
      category: "Cosmetic"
    },
    {
      id: 3,
      name: "Lion Hat Style 3",
      description: "Premium hat for your focused companion",
      price: 150,
      image: "/src/assets/lion_hat_3_scaled_10x_pngcrushed.png",
      category: "Cosmetic"
    }
  ];

  const handlePurchase = (item: typeof items[0]) => {
    const isPurchased = purchasedHats.includes(item.image);
    const isEquipped = equippedHat === item.image;
    
    if (isEquipped) {
      equipHat('');
      return;
    }

    if (!isPurchased && focusStats.points < item.price) {
      return;
    }

    if (!isPurchased) {
      purchaseHat(item.image);
      deductPoints(item.price);
    }
    
    equipHat(item.image);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Focus Shop</h1>
          <p className="text-gray-600">Unlock rewards with your focus points</p>
        </div>
        <div className="bg-orange-100 px-4 py-2 rounded-lg flex items-center space-x-2">
          <Star className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-orange-900">{focusStats.points} Points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => {
          const isEquipped = equippedHat === item.image;
          const isPurchased = purchasedHats.includes(item.image);
          const canAfford = focusStats.points >= item.price;

          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-50 p-4 flex items-center justify-center h-[500px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-[512px] h-[512px] object-contain"
                    style={{ 
                      imageRendering: 'pixelated',
                      transform: 'scale(2)',
                      transformOrigin: 'center'
                    }}
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center text-orange-600">
                    <Star className="w-5 h-5" />
                    <span className="ml-2 text-lg font-semibold">{item.price}</span>
                  </div>
                </div>
                <p className="mt-3 text-gray-600">{item.description}</p>
                <button
                  onClick={() => handlePurchase(item)}
                  className={`mt-6 w-full px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 transform
                    ${isEquipped
                      ? 'bg-green-600 text-white hover:bg-green-500 hover:scale-[1.02] active:bg-green-700 active:scale-[0.98] shadow-md hover:shadow-lg active:shadow cursor-pointer'
                      : isPurchased
                        ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:bg-blue-700 active:scale-[0.98] shadow-md hover:shadow-lg active:shadow cursor-pointer'
                        : canAfford
                          ? 'bg-orange-600 text-white hover:bg-orange-500 hover:scale-[1.02] active:bg-orange-700 active:scale-[0.98] shadow-md hover:shadow-lg active:shadow cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  disabled={!canAfford && !isPurchased}
                >
                  {isEquipped 
                    ? 'Equipped' 
                    : isPurchased
                      ? 'Equip'
                      : canAfford 
                        ? 'Purchase & Equip' 
                        : 'Not Enough Points'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-200 rounded-full">
            <Award className="w-6 h-6 text-orange-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-orange-900">How to earn points</h2>
            <p className="text-orange-700">Earn 10 points for every minute you stay focused!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;