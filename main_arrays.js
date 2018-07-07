// Arrays
var loot = [
    { name: `Dagger`, minDamage: 4, maxDamage: 13, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.14 },
    { name: `Sword`, minDamage: 5, maxDamage: 15, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.23 },
    { name: `Axe`, minDamage: 6, maxDamage: 15, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.20 },
    { name: `Mace`, minDamage: 8, maxDamage: 13, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.18 },
    { name: `Longsword`, minDamage: 9, maxDamage: 14, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.18 },
    { name: `Greatsword`, minDamage: 10, maxDamage: 16, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.11 },
    { name: `Battleaxe`, minDamage: 12, maxDamage: 15, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.14 },
    { name: `Warhammer`, minDamage: 11, maxDamage: 17, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.12 },

    { name: `Shortbow`, minDamage: 5, maxDamage: 11, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.13 },
    { name: `Longbow`, minDamage: 6, maxDamage: 15, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.09 },
    { name: `Crossbow`, minDamage: 8, maxDamage: 16, itemType: `Weapon`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.06 },

    { name: `Shield`, armorRating: 8, itemType: `Wearable`, ignoreTypes: [`Cloth`], p: 0.11 },
    { name: `Wall Shield`, armorRating: 13, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`], p: 0.04 },

    { name: `Shirt`, armorRating: 1, itemType: `Wearable`, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.22 },
    { name: `Duster`, armorRating: 1, itemType: `Wearable`, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.10 },
    { name: `Jacket`, armorRating: 2, itemType: `Wearable`, onlyTypes: [`Hide`,`Basic Leather`,`Leather`], p: 0.16 },
    { name: `Chestpiece`, armorRating: 6, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`,`Wood`], p: 0.16 },

    { name: `Helmet`, armorRating: 3, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Hide`,`Wood`], p: 0.16 },
    { name: `Heavy Helmet`, armorRating: 5, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Hide`,`Wood`], p: 0.06 },

    { name: `Shoes`, armorRating: 1, itemType: `Wearable`, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.13 },
    { name: `Boots`, armorRating: 3, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Wood`], p: 0.17 },
    { name: `Heavy Boots`, armorRating: 4, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Wood`,`Hide`,`Basic Leather`], p: 0.07 },

    { name: `Gauntlets`, armorRating: 3, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Wood`], p: 0.18 },
    { name: `Heavy Gauntlets`, armorRating: 5, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Hide`,`Wood`], p: 0.08 },

    { name: `Pants`, armorRating: 1, itemType: `Wearable`, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.20 },
    { name: `Leggings`, armorRating: 4, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Wood`], p: 0.15 },
    { name: `Heavy Leggings`, armorRating: 7, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Hide`,`Wood`], p: 0.07 },

    { name: `Small Sack`, itemType: `Inventory`, slots: 3, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.11 },
    { name: `Medium Sack`, itemType: `Inventory`, slots: 5, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.10 },
    { name: `Large Sack`, itemType: `Inventory`, slots: 7, onlyTypes: [`Hide`,`Basic Leather`,`Leather`], p: 0.09 },

    { name: `Small Knapsack`, itemType: `Inventory`, slots: 6, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.10 },
    { name: `Medium Knapsack`, itemType: `Inventory`, slots: 10, onlyTypes: [`Hide`,`Basic Leather`,`Leather`], p: 0.09 },
    { name: `Large Knapsack`, itemType: `Inventory`, slots: 15, onlyTypes: [`Basic Leather`,`Leather`], p: 0.08 },

    { name: `Small Backpack`, itemType: `Inventory`, slots: 10, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.09 },
    { name: `Medium Backpack`, itemType: `Inventory`, slots: 15, onlyTypes: [`Basic Leather`,`Leather`], p: 0.06 },
    { name: `Large Backpack`, itemType: `Inventory`, slots: 20, onlyTypes: [`Basic Leather`,`Leather`], p: 0.06 },
    { name: `Traveler's Pack`, itemType: `Inventory`, slots: 30, onlyTypes: [`Basic Leather`,`Leather`], p: 0.04 },
    { name: `Adventurer's Pack`, itemType: `Inventory`, slots: 40, onlyTypes: [`Leather`], p: 0.03 }
];

var enchantments = [
    { p: 0.75 },

    { name: `Breathing`, minDamage: 0, maxDamage: 9, p: 0.15, onlyTypes: [`Weapon`] },

    { name: `Scouring`, minDamage: 2, maxDamage: 13, p: 0.14, onlyTypes: [`Weapon`] },
    { name: `Dread`, minDamage: 3, maxDamage: 14, p: 0.12, onlyTypes: [`Weapon`] },

    { name: `Bleeding`, minDamage: 4, maxDamage: 15, p: 0.10, onlyTypes: [`Weapon`] },
    { name: `Hemorrhaging`, minDamage: 5, maxDamage: 16, p: 0.08, onlyTypes: [`Weapon`] },

    { name: `Light`, minHeal: 0, maxHeal: 1, minDamage: 1, maxDamage: 10, p: 0.11, onlyTypes: [`Weapon`] },
    { name: `Shining`, minHeal: 0, maxHeal: 3, minDamage: 1, maxDamage: 11, p: 0.10, onlyTypes: [`Weapon`] },
    { name: `Blinding Light`, minHeal: 1, maxHeal: 5, minDamage: 1, maxDamage: 12, p: 0.08, onlyTypes: [`Weapon`] },

    { name: `Healing Light`, minHeal: 0, maxHeal: 5, p: 0.09, onlyTypes: [`Weapon`] },
    { name: `Healing Hands`, minHeal: 1, maxHeal: 5, p: 0.08, onlyTypes: [`Weapon`] }
];

var lootTypes = [
    { name: `Cloth`, enchants: [{p:1.00}], p: 0.30, m: 0.25, level: 1 },
    { name: `Hide`, enchants: [{p:1.00}], p: 0.32, m: 0.5, level: 1 },
    { name: `Basic Leather`, enchants: [{p:1.00}], p: 0.35, m: 0.65, level: 1 },
    { name: `Wood`, enchants: [{p:1.00}], p: 0.35, m: 0.75, level: 1 },
    { name: `Leather`, enchants: [{p:1.00}], p: 0.35, m: 1.0, level: 1 },
    { name: `Iron`, enchants: enchantments, p: 0.35, m: 1.125, level: 2 },
    { name: `Steel`, enchants: enchantments, p: 0.34, m: 1.22, level: 3 },
    { name: `Steel Plate`, enchants: enchantments, p: 0.34, m: 1.5, level: 5 },
    { name: `Caxium`, enchants: enchantments, p: 0.34, m: 1.75, level: 7 },
    { name: `Silver`, enchants: enchantments, p: 0.33, m: 1.75, level: 7 },
    { name: `Imperial Caxium`, enchants: enchantments, p: 0.33, m: 2.0, level: 9 },
    { name: `Glass`, enchants: enchantments, p: 0.33, m: 2.5, level: 10 },
    { name: `Acrylic`, enchants: enchantments, p: 0.31, m: 3.75, level: 12 },
    { name: `Metallic`, enchants: enchantments, p: 0.30, m: 5.0, level: 13 },
    { name: `Seeker`, enchants: enchantments, p: 0.29, m: 7.5, level: 15 },
    { name: `Warlord`, enchants: enchantments, p: 0.27, m: 10.0, level: 20 },
    { name: `Vampiric`, enchants: enchantments, p: 0.25, m: 12.5, level: 21 },
    { name: `Iceshield`, enchants: enchantments, p: 0.22, m: 15.0, level: 22 },
    { name: `Platinum`, enchants: enchantments, p: 0.20, m: 20.0, level: 35 },
    { name: `Oladium`, enchants: enchantments, p: 0.17, m: 27.0, level: 40 },
    { name: `Dragon Plate`, enchants: enchantments, p: 0.14, m: 30.0, level: 50 },
    { name: `Master Dragon Plate`, enchants: enchantments, p: 0.12, m: 35.0, level: 55 },
    { name: `Demonic`, enchants: enchantments, p: 0.10, m: 40.0, level: 55 },
    { name: `Demonic Warlord`, enchants: enchantments, p: 0.08, m: 50.0, level: 60 },
    { name: `Celestial`, enchants: enchantments, p: 0.05, m: 55.0, level: 65 },
    { name: `Ascension`, enchants: enchantments, p: 0.03, m: 65.75, level: 70 },
    { name: `Diamond Plate`, enchants: enchantments, p: 0.01, m: 75.0, level: 90 }
];

var quests = [
    { name:`A New Journey`, items:
        [{
            displayName: `Basic Leather Leggings`, level: 1,
            minDamage: 0, maxDamage: 0, minHeal: 0, maxHeal: 0,
            armorRating: 3, count: 1,
            itemType: `Wearable`,
            baseItem: { name: `Leggings`, armorRating: 4, itemType: `Wearable`, ignoreTypes: [`Cloth`,`Wood`], p: 0.15 },
            baseMaterial: { name: `Basic Leather`, enchants: [{p:1.00}], p: 0.35, m: 0.65, level: 1 }
        },
        {
            displayName: `Basic Leather Shirt`, level: 1,
            minDamage: 0, maxDamage: 0, minHeal: 0, maxHeal: 0,
            armorRating: 1, count: 1,
            itemType: `Wearable`,
            baseItem: { name: `Shirt`, armorRating: 1, itemType: `Wearable`, onlyTypes: [`Cloth`,`Hide`,`Basic Leather`,`Leather`], p: 0.22 },
            baseMaterial: { name: `Basic Leather`, enchants: [{p:1.00}], p: 0.35, m: 0.65, level: 1 }
        }]
    }
];

var directions = [
    `North`,`East`,`South`,`West`
];
