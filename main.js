// ATTRIBUTES
var Level = 1;
var MaxHealth = getMaxHealth();
var Health = MaxHealth;
var Experience = 0;
var ExperienceToNext = getExperienceToNext();

// ITEMS
var Inventory = Array(10).fill(null);
var Equipped = Array(8).fill(null);

// CURRENCY
var Bronze = 0;
var Silver = 0;
var Gold = 0;

// LOCATIONS
var Room = {};
var Discovered = [];
var ActiveQuests = [];

// MISC
var displayedMenu;
var roomMoveCooldown = 0;
var attackCooldown = 0;
var inventorySlots = 10;
var isFastTraveling = false;

// System
function setup() {
    createCanvas(0,0);
    updateArrayItems();

    createHTMLButton("Max HP", function(){ Health = MaxHealth; }, "debug");
    createHTMLButton("Level Up", function(){ changeExperience(ExperienceToNext-Experience); }, "debug");
    createHTMLButton("+1 Bronze", function(){ Bronze += 1; }, "debug");
    createHTMLButton("+1 Silver", function(){ Silver += 1; }, "debug");
    createHTMLButton("+1 Gold", function(){ Gold += 1; }, "debug");
    createHTMLButton("Freemove", function(){ canMove = function(){ return true; }; }, "debug");
    createModal();

    setInterval(function(){ if(roomMoveCooldown > 0){ roomMoveCooldown--; } },1000);
    setInterval(function(){ if(attackCooldown > 0){ attackCooldown--; info(`This turn ends in <w>${attackCooldown}s</w>.`); } },1000);
    setInterval(function(){ if( Room.enemies.length < 1 && (Health / MaxHealth < 0.75) ){ changeHealth(Math.round(MaxHealth / 25)); } },5000);
    setInterval(function(){
        if(ActiveQuests.length > 0){
            for (var i = 0; i < ActiveQuests.length; i++) {
                if(isQuestComplete(ActiveQuests[i])){ completeQuest(ActiveQuests[i]); }
                if(isQuestProgressChanged(ActiveQuests[i])){ updateQuests(); }
            }
        }
    },1000);

    addQuest(quests[0]);
    moveTo(`CHQ`);
}
function draw() {
    drawDocument();

    if(Experience > ExperienceToNext - 1){
        Experience -= ExperienceToNext;
        levelUp();
    } else if(Experience < 0){
        Experience = 0;
    }

    if(Bronze > 99 || Silver > 99){
        getCurrencyAmounts();
    }

    if(Level > 100){
        Level = 100;
        error(`You've already reached the highest level!`);
    }

    if(Silver > 4 && hasCompletedQuest(getQuestFromName(`Affluency I`)) == false){
        addQuest(getQuestFromName(`Affluency I`));
    }
}

function updateArrayItems(){
    Discovered.push(continents[0],regions[0]);

    addItem(getItemFromName(`Iron`,`Sword`));
    addItem(getItemFromName(`Basic Leather`,`Shoes`));
    addItem(getItemFromName(`Basic Leather`,`Shirt`));
    addItem(getItemFromName(`Basic Leather`,`Leggings`));
    toggleEquipItem(Inventory[0]);
    toggleEquipItem(Inventory[1]);
    toggleEquipItem(Inventory[2]);
    toggleEquipItem(Inventory[3]);
    changeHealth(MaxHealth - Health);

    addChestItems([getItemFromName(`Steel`,`Sword`,`Grasp`)], getQuestFromName(`Ironworks`).rewards);

    addChestItems(getRandomCurrency(50,125), getLocationByName(`PTW`).objects[0].chest);
    addChestItems([
        getItemFromName(`Leather`,`Boots`),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot()
    ], getLocationByName(`PTW`).objects[0].chest);

    addChestItems([
        new Item(`Letter to a Friend`, {name:`Paper`,enchants:[{p: 1}],p:0.10,m:1,level:1}, {name:`Paper`,itemType:`Quest`,p:0.10},enchantments[0], 1, 1),
        new Item(`Letter`, {name:`Paper`,enchants:[{p: 1}],p:0.35,m:1,level:1}, {name:`Paper`,itemType:`Junk`,p:0.15}, enchantments[0], 1, 2)
    ], getLocationByName(`WOOD`).objects[0].chest);

    addChestItems([
        getItemFromName(`Basic Leather`,`Shoes`),
        getItemFromName(`Basic Leather`,`Shirt`),
        getItemFromName(`Basic Leather`,`Jacket`),
        getItemFromName(`Basic Leather`,`Leggings`),
        getItemFromName(`Basic Leather`,`Gauntlets`),
        getItemFromName(`Iron`,`Sword`),
        getItemFromName(`Iron`,`Axe`),
        getItemFromName(`Steel`,`Sword`),
        getItemFromName(`Cloth`,`Small Sack`),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot()
    ], getLocationByName(`WLC`).shop.items);

    addChestItems(getRandomCurrency(0,35), getLocationByName(`TREL`).objects[0].loot);

    addChestItems([getItemFromName(`Cloth`,`Rag`)], getLocationByName(`WTDI`).shop.items);

    getLocationByName(`CHAR`).objects[0].travel.push(getLocationByName(`WOOD`));
    getLocationByName(`WOOD`).objects[1].travel.push(getLocationByName(`CHAR`));
}

// Checks
function canMove(dir){
    if(Room.enemies != null && Room.enemies.length > 0){
        error(`This area is unavailable. There are still <w>${Room.enemies.length} enemies</w> nearby.`);
        return false;
    }
    if(isFastTraveling == true){
        return false;
    }
    if(roomMoveCooldown < 1 && dir != null){
        roomMoveCooldown = 5;
        if(Level >= dir.region.level && Level >= dir.region.continent.level){
            return true;
        } else if(Level >= dir.region.continent.level){
            error(`This area is unavailable. The minimum required level for this region is <w>Level ${dir.region.level}</w>.`);
        } else {
            error(`This area is unavailable. The minimum required level for this continent is <w>Level ${dir.region.continent.level}</w>.`);
        }
    } else if(roomMoveCooldown > 0){
        error(`You cannot move to this area yet. Please wait <w>${roomMoveCooldown}s</w>.`);
    } else if(dir == null){
        error(`This area is unavailable.`);
    }
    return false;
}

// Misc
function sleep(){
    let our_total = Bronze + (Silver * 100) + (Gold * 10000);
    let item_total = Room.inn.bedPrice;

    if(our_total < item_total){
        error(`You do not have enough to sleep here. You need an additional <w>${getCurrencyAmountString(item_total-our_total)}</w>.`);
        return;
    }

    our_total -= item_total;
    Health = MaxHealth;
    setCurrencyToTotal(our_total);
    info(`Your health has been fully restored.`);
}

// Attributes
function levelUp(){
    if(getExperienceToNext() == Infinity){
        return;
    }
    Level ++;
    MaxHealth = getMaxHealth();
    Health = MaxHealth;

    ExperienceToNext = getExperienceToNext();
    updateAttributeValues();

    let unlockstring = ``;
    for (var i = 0; i < regions.length; i++) {
        if(regions[i].level == Level){
            unlockstring += `<li>${regions[i].name}, ${regions[i].continent.name}</li>`;
        }
    }

    levelupmsg = `<big><w>Level Up!</w></big><br>
        You reached <w><d>Level ${Level}</d></w>!
        Your maximum health has been increased to <w>${getMaxHealth()} ${(MaxHealth > getMaxHealth())?`(+${MaxHealth - getMaxHealth()})`:``}</w>
        and your health has been fully restored.
        Your maximum experience has been increased to <w>${ExperienceToNext}</w>.
    `;

    if(unlockstring.length > 0){
        levelupmsg += `<br><br><w style="font-size:16px">Unlocked:</w><br>${unlockstring}`;
    }

    important(levelupmsg);
}
function changeExperience(amt){
    if(Experience + amt < 1 || amt == Infinity){
        return;
    }
    Experience += amt;
    if(amt > 0){
        info(`You gained <w>${amt} XP</w>.`);
    } else if(amt < 0){
        error(`You lost <w>${-amt} XP</w>.`);
    }
}
function changeHealth(amt){
    if(Health + amt > MaxHealth){
        amt = MaxHealth - Health;
    }
    Health += amt;
}

// Direction
function moveTo(name){
    let newRoom = getLocationByName(name);

    if(canMove(newRoom) == false){
        return;
    }

    if(Discovered.indexOf(newRoom) < 0){
        if(newRoom.city == true){
            changeExperience(Math.round((ExperienceToNext/15)/10)+10);
        }
        if(Discovered.indexOf(newRoom.region.continent) < 0){
            Discovered.push(newRoom.region.continent);
            important(`<big><w>Continent Discovered</w></big><br><w>${newRoom.region.continent.name}</w> discovered.`);
            changeExperience( Math.round(((ExperienceToNext/5)/10)+45)-(Level/newRoom.region.continent.level) );
        }
        if(Discovered.indexOf(newRoom.region) < 0){
            Discovered.push(newRoom.region);
            important(`<big><w>Region Discovered</w></big><br><w>${newRoom.region.name}, ${newRoom.region.continent.name}</w> discovered.`);
            changeExperience( Math.round(((ExperienceToNext/10)/10)+25)-(Level/newRoom.region.level) );
        }
        Discovered.push(newRoom);
        info(`<w>${newRoom.displayName}, ${newRoom.region.name}</w> discovered.`);
    }

    Room = newRoom;
    updateDirections();
    updateActions();
    if(document.getElementById(`chestinv`).style.display != `none`){ hideMenu(); }
    if(document.getElementById(`iteminfo`).style.display != `none`){ hideItemInfo(); }
    spawnEnemy();
}
function fastTravel(name){
    let dir = getLocationByName(name);
    let our_total = Bronze + (Silver * 100) + (Gold * 10000);
    let item_total = getTravelPrice(dir);

    if(our_total < item_total){
        error(`You do not have enough to travel to <w>${dir.displayName}</w>. You need an additional <w>${getCurrencyAmountString(item_total-our_total)}</w>.`);
        return;
    }

    isFastTraveling = true;
    our_total -= item_total;
    setCurrencyToTotal(our_total);

    setTimeout(function(){ info(`Travelling to <w>${dir.displayName}</w>...`); }, 500);
    setTimeout(function(){ info(`Arriving at <w>${dir.displayName}</w>...`); }, item_total * 95);
    setTimeout(function(){ isFastTraveling = false; moveTo(name); }, item_total * 100);
}
function getLocationByName(name){
    for (var i = 0; i < locations.length; i++) {
        if(locations[i].name == name){
            return locations[i];
        }
    }
    return null;
}

// Events
function info(text){
    displayMessage(text, `#0181ff`);
}
function error(text){
    displayMessage(text, `#ef3232`);
}
function important(text){
    displayMessage(text, `#efa616`, Math.round((text.length / 26)+10));//#efa616
}
function displayMessage(text, color, dur){
    let _info = document.getElementById(`info`);
    let index = _info.childNodes.length;
    dur = dur || Math.round((text.length / 26)+5);

    let _infotext = document.createElement(`info`);
    _infotext.id = `info${index}`;
    _infotext.style.backgroundColor = `${color}25`;
    _infotext.style.borderLeft = `solid 5px ${color}`;
    _infotext.style.color = `${color}`;
    _infotext.innerHTML = text;

    _info.appendChild(_infotext);
    _infotext.style.animation = `none`;
    _infotext.style.animation = `fadeInOut ${dur}s`;
    setTimeout(function(){ _info.removeChild(document.getElementById(`info${index}`)); }, (dur*600)+575+dur);
}

// Objects
function getObjectFromName(name){
    for (var i = 0; i < Room.objects.length; i++) {
        if(Room.objects[i].name == name){
            return Room.objects[i];
        }
    }
    return null;
}
function createObject(obj, location){
    location = location || Room;
    let r_obj = location.objects.push(obj);
    return r_obj;
}

// Formatting
function applyUppercaseFirst(str) {
    str = str + `.`;
    return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
        let a = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        return a.substring(0,a.length-1);
    });
}
function applySentenceCase(str) {
    return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
