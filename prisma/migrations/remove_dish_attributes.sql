-- Migration to remove isEggless, isPremium, isSpecialToday and add isVeg field

-- Add isVeg field to Dish collection
db.Dish.updateMany(
  {},
  {
    $set: { isVeg: true },
    $unset: { 
      isEggless: "",
      isPremium: "",
      isSpecialToday: ""
    }
  }
);