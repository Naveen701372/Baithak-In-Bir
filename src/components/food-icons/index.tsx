import React from 'react'

interface FoodIconProps {
  className?: string
}

export const TeaIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="55" r="25" fill="#8B4513" opacity="0.9"/>
    <circle cx="50" cy="55" r="20" fill="#D2691E"/>
    <rect x="45" y="30" width="10" height="15" fill="#8B4513" rx="2"/>
    <path d="M75 50 Q85 50 85 60 Q85 70 75 70" stroke="#8B4513" strokeWidth="3" fill="none"/>
    <ellipse cx="50" cy="45" rx="8" ry="3" fill="#F5DEB3" opacity="0.8"/>
    {/* Steam animation */}
    <path d="M42 35 Q45 30 48 35" stroke="#E6E6FA" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <path d="M52 35 Q55 30 58 35" stroke="#E6E6FA" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <path d="M47 32 Q50 27 53 32" stroke="#E6E6FA" strokeWidth="1.5" fill="none" opacity="0.5"/>
  </svg>
)

export const CoffeeIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="55" r="25" fill="#654321"/>
    <circle cx="50" cy="55" r="20" fill="#8B4513"/>
    <rect x="45" y="30" width="10" height="15" fill="#654321" rx="2"/>
    <path d="M75 50 Q85 50 85 60 Q85 70 75 70" stroke="#654321" strokeWidth="3" fill="none"/>
    <ellipse cx="50" cy="45" rx="8" ry="3" fill="#D2B48C" opacity="0.8"/>
    {/* Enhanced steam */}
    <path d="M42 35 Q45 30 48 35" stroke="#F5F5DC" strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M52 35 Q55 30 58 35" stroke="#F5F5DC" strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M47 32 Q50 27 53 32" stroke="#F5F5DC" strokeWidth="1.5" fill="none" opacity="0.6"/>
    {/* Coffee beans */}
    <ellipse cx="45" cy="50" rx="2" ry="3" fill="#4A2C2A" opacity="0.6"/>
    <ellipse cx="55" cy="52" rx="2" ry="3" fill="#4A2C2A" opacity="0.6"/>
  </svg>
)

export const ColdDrinkIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="35" y="25" width="30" height="50" fill="#87CEEB" rx="15"/>
    <rect x="37" y="27" width="26" height="46" fill="#B0E0E6" rx="13"/>
    <circle cx="42" cy="35" r="3" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="55" cy="42" r="2" fill="#FFFFFF" opacity="0.6"/>
    <circle cx="48" cy="55" r="2.5" fill="#FFFFFF" opacity="0.7"/>
    <rect x="47" y="15" width="6" height="15" fill="#FFD700" rx="3"/>
    <ellipse cx="50" cy="22" rx="4" ry="2" fill="#FFA500"/>
  </svg>
)

export const ShakeIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="35" y="30" width="30" height="45" fill="#FFB6C1" rx="15"/>
    <rect x="37" y="32" width="26" height="41" fill="#FFC0CB" rx="13"/>
    <ellipse cx="50" cy="40" rx="10" ry="4" fill="#FFFFFF" opacity="0.9"/>
    {/* Colorful shake ingredients */}
    <circle cx="45" cy="50" r="2.5" fill="#FF69B4" opacity="0.8"/>
    <circle cx="55" cy="55" r="2" fill="#DDA0DD" opacity="0.8"/>
    <circle cx="42" cy="60" r="1.5" fill="#FFB6C1" opacity="0.8"/>
    <circle cx="58" cy="48" r="1.5" fill="#FF1493" opacity="0.8"/>
    {/* Straw */}
    <rect x="47" y="20" width="6" height="15" fill="#FF69B4" rx="3"/>
    <circle cx="50" cy="25" r="3" fill="#FF1493"/>
    {/* Whipped cream */}
    <ellipse cx="50" cy="35" rx="8" ry="3" fill="#FFFACD" opacity="0.9"/>
  </svg>
)

export const MaggiIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="60" rx="30" ry="15" fill="#8B4513"/>
    <ellipse cx="50" cy="58" rx="28" ry="13" fill="#D2691E"/>
    <path d="M25 50 Q30 45 35 50 Q40 55 45 50 Q50 45 55 50 Q60 55 65 50 Q70 45 75 50" 
          stroke="#FFD700" strokeWidth="2" fill="none"/>
    <path d="M28 52 Q33 47 38 52 Q43 57 48 52 Q53 47 58 52 Q63 57 68 52 Q73 47 78 52" 
          stroke="#FFD700" strokeWidth="2" fill="none"/>
    <circle cx="40" cy="52" r="2" fill="#FF6347"/>
    <circle cx="60" cy="54" r="2" fill="#32CD32"/>
  </svg>
)

export const SandwichIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="65" rx="25" ry="8" fill="#8B4513"/>
    <rect x="25" y="45" width="50" height="8" fill="#DEB887" rx="4"/>
    <rect x="27" y="47" width="46" height="4" fill="#32CD32" rx="2"/>
    <rect x="25" y="53" width="50" height="8" fill="#DEB887" rx="4"/>
    <rect x="27" y="55" width="46" height="4" fill="#FF6347" rx="2"/>
    <rect x="25" y="35" width="50" height="8" fill="#DEB887" rx="4"/>
    <circle cx="35" cy="50" r="1.5" fill="#228B22"/>
    <circle cx="65" cy="58" r="1.5" fill="#FF4500"/>
  </svg>
)

export const WrapIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="30" ry="20" fill="#DEB887" transform="rotate(15 50 50)"/>
    <ellipse cx="50" cy="50" rx="25" ry="15" fill="#F5DEB3" transform="rotate(15 50 50)"/>
    <rect x="35" y="45" width="30" height="3" fill="#32CD32" rx="1.5" transform="rotate(15 50 50)"/>
    <rect x="35" y="50" width="30" height="3" fill="#FF6347" rx="1.5" transform="rotate(15 50 50)"/>
    <rect x="35" y="55" width="30" height="3" fill="#FFD700" rx="1.5" transform="rotate(15 50 50)"/>
  </svg>
)

export const BurgerIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top bun */}
    <ellipse cx="50" cy="35" rx="25" ry="8" fill="#DEB887"/>
    <ellipse cx="50" cy="33" rx="23" ry="6" fill="#F5DEB3"/>
    {/* Lettuce */}
    <rect x="25" y="40" width="50" height="6" fill="#90EE90" rx="3"/>
    {/* Patty */}
    <rect x="25" y="48" width="50" height="8" fill="#8B4513" rx="4"/>
    {/* Tomato */}
    <rect x="25" y="58" width="50" height="6" fill="#FF6347" rx="3"/>
    {/* Cheese */}
    <rect x="25" y="66" width="50" height="6" fill="#FFD700" rx="3"/>
    {/* Bottom bun */}
    <ellipse cx="50" cy="75" rx="25" ry="8" fill="#DEB887"/>
    {/* Sesame seeds */}
    <circle cx="40" cy="30" r="1.5" fill="#F5DEB3"/>
    <circle cx="60" cy="32" r="1.5" fill="#F5DEB3"/>
    <circle cx="50" cy="29" r="1" fill="#F5DEB3"/>
    <circle cx="35" cy="33" r="1" fill="#F5DEB3"/>
    <circle cx="65" cy="30" r="1" fill="#F5DEB3"/>
  </svg>
)

export const NachosIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="70" rx="30" ry="10" fill="#8B4513"/>
    <polygon points="30,60 45,40 60,60" fill="#FFD700"/>
    <polygon points="45,60 60,40 75,60" fill="#FFA500"/>
    <polygon points="25,65 40,45 55,65" fill="#FFD700"/>
    <polygon points="55,65 70,45 85,65" fill="#FFA500"/>
    <ellipse cx="50" cy="55" rx="20" ry="8" fill="#FF6347" opacity="0.7"/>
    <circle cx="45" cy="52" r="2" fill="#32CD32"/>
    <circle cx="55" cy="58" r="2" fill="#32CD32"/>
  </svg>
)

export const RiceIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="65" rx="30" ry="15" fill="#8B4513"/>
    <ellipse cx="50" cy="60" rx="28" ry="13" fill="#D2691E"/>
    <ellipse cx="50" cy="55" rx="25" ry="10" fill="#FFFACD"/>
    <circle cx="40" cy="52" r="1" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="1" fill="#FFFFFF"/>
    <circle cx="60" cy="53" r="1" fill="#FFFFFF"/>
    <circle cx="45" cy="55" r="1" fill="#FFFFFF"/>
    <circle cx="55" cy="57" r="1" fill="#FFFFFF"/>
    <ellipse cx="50" cy="45" rx="15" ry="5" fill="#FFD700" opacity="0.6"/>
  </svg>
)

export const LemonadeIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="35" y="25" width="30" height="50" fill="#FFFF99" rx="15"/>
    <rect x="37" y="27" width="26" height="46" fill="#FFFACD" rx="13"/>
    <circle cx="45" cy="40" r="8" fill="#FFD700" opacity="0.3"/>
    <circle cx="55" cy="55" r="6" fill="#FFD700" opacity="0.3"/>
    <circle cx="42" cy="60" r="2" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="58" cy="45" r="2" fill="#FFFFFF" opacity="0.6"/>
    <rect x="47" y="15" width="6" height="15" fill="#32CD32" rx="3"/>
    <ellipse cx="50" cy="22" rx="4" ry="2" fill="#228B22"/>
  </svg>
)

export const IcedTeaIcon: React.FC<FoodIconProps> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="35" y="25" width="30" height="50" fill="#CD853F" rx="15"/>
    <rect x="37" y="27" width="26" height="46" fill="#DEB887" rx="13"/>
    <circle cx="42" cy="35" r="3" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="55" cy="42" r="2" fill="#FFFFFF" opacity="0.6"/>
    <circle cx="48" cy="55" r="2.5" fill="#FFFFFF" opacity="0.7"/>
    <circle cx="58" cy="60" r="2" fill="#FFFFFF" opacity="0.5"/>
    <rect x="47" y="15" width="6" height="15" fill="#8B4513" rx="3"/>
    <ellipse cx="50" cy="22" rx="4" ry="2" fill="#654321"/>
    <path d="M40 40 Q42 38 44 40" stroke="#8B4513" strokeWidth="1" fill="none"/>
  </svg>
)

// Helper function to get the appropriate icon
export const getFoodIcon = (categoryName: string, itemName: string) => {
  if (categoryName === 'Hot Beverages') {
    if (itemName.includes('Tea') || itemName.includes('GLIH')) return TeaIcon
    return CoffeeIcon
  }
  if (categoryName === 'Cold Beverages') {
    if (itemName.includes('Coffee')) return CoffeeIcon
    if (itemName.includes('Lemonade')) return LemonadeIcon
    if (itemName.includes('Iced Tea')) return IcedTeaIcon
    return ColdDrinkIcon
  }
  if (categoryName === 'Shakes & Smoothies') {
    return ShakeIcon
  }
  if (categoryName === 'Quick Bites') {
    return MaggiIcon
  }
  if (categoryName === 'Sandwiches & Wraps') {
    return itemName.includes('Wrap') ? WrapIcon : SandwichIcon
  }
  if (categoryName === 'Mains & Snacks') {
    if (itemName.includes('Burger')) return BurgerIcon
    if (itemName.includes('Nachos')) return NachosIcon
    return SandwichIcon
  }
  if (categoryName === "Today's Special") {
    return RiceIcon
  }
  return SandwichIcon
}