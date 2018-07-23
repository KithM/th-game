// GAME
const Version = `2018.7.22`;
var today = new Date();

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
    moveTo(locations[1].name);
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

    important(`<big><w>Level Up!</w></big><br>
        You reached
        <w><d>Level ${Level}</d></w>!
        Your maximum health has been increased to <w>${getMaxHealth()} ${(MaxHealth > getMaxHealth())?`(+${MaxHealth - getMaxHealth()})`:``}</w>
        and your health has been fully restored.`
    );
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
function updateDirections(){
    let el = document.getElementById("locations");
    el.innerHTML = `<p>${Room.displayName} Locations</p>`;

    if(Room.directions == null){
        return;
    }

    Room.directions.sort(function(a){ if(a.shop != null || a.inn != null || a.city != null){ return Room.directions.length-1; } return -1; });

    for (var i = 0; i < Room.directions.length; i++) {
        let dir = Room.directions[i];
        let loc = getLocationByName(dir);
        let n = getLocationByName(dir).displayName;
        if(dir != null){
            let b = document.createElement(`button`);
            b.innerHTML = n;
            if(Discovered.indexOf(loc) < 0){
                b.innerHTML = `Undiscovered location`;
            }
            b.className = `button`;
            b.id = dir;
            b.style.marginLeft = `0px`;
            b.style.fontSize = `14px`;
            if(loc.city == true || loc.shop != null || loc.inn != null){
                let b_ = document.createElement(`div`);
                let s_ = document.createElement(`span`);
                b_.style.position = `absolute`;
                b_.style.color = `white`;
                b_.style.fontSize = `10px`;
                b_.style.transform = `rotateZ(45deg)`;

                b_.style.left = `8px`;
                b_.style.width = `25px`;
                b_.style.height = `25px`;
                b_.style.display = `inline`;

                s_.style.marginRight = `25px`;
                b.appendChild(s_);
                if(loc.city == true){ b_.innerHTML = `City`; } else if(loc.inn != null) { b_.innerHTML = `Inn`; } else if (loc.shop != null){ b_.innerHTML = `Shop`; }

                b.appendChild(b_);
                b.style.borderLeft = `25px solid #0d4c7d25`;
            }
            b.style.width = `100%`;
            b.onclick = function(){ moveTo(dir); };
            el.appendChild(b);
        }
    }
}
function updateActions(){
    let actionsHTML = `<p>Actions</p>`;
    let actions = document.getElementById(`actions`);
    let chestinv = document.getElementById(`chestinv`);
    actions.innerHTML = actionsHTML;

    if(Room.shop != null){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `buy`;
        b.innerHTML = `Buy (${Room.shop.name})`;
        actions.appendChild(b);

        b.onclick = function(){
            toggleChestInventory(Room.shop.items, true);
        };
    }
    if(Room.inn != null){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `sleep`;
        b.innerHTML = `Sleep (${getCurrencyAmountString(Room.inn.bedPrice)})`;
        actions.appendChild(b);

        b.onclick = function(){
            sleep();
        };
    }
    if(Room.enemies.length > 0){
        for (var i = 0; i < Room.enemies.length; i++) {
            let enemy = Room.enemies[i];
            let b = document.createElement(`button`);

            b.className = `button`;
            b.id = `attack${i}`;
            b.innerHTML = `Attack ${enemy.name} (${Math.round((enemy.health / enemy.maxhealth)*100)}%)`;
            actions.appendChild(b);

            b.onclick = function(){
                attack(enemy);
            };
        }
    }
    // TODO
    if(Room.objects.length > 0){
        for (var i = 0; i < Room.objects.length; i++) {
            let obj = Room.objects[i];
            let b = document.createElement(`button`);

            b.className = `button`;
            b.id = `obj${i}`;
            b.innerHTML = `${obj.name}`;
            actions.appendChild(b);

            if(obj.chest != null){
                if(displayedMenu == obj.chest && obj.chest.length > 0){
                    b.innerHTML = `Close ${obj.name}`;
                } else if (obj.chest.length > 0){
                    b.innerHTML = `Open ${obj.name}`;
                } else {
                    //b.innerHTML = `${obj.name} (empty)`;
                    actions.removeChild(b);
                }
                b.onclick = function(){
                    toggleChestInventory(obj.chest, false, obj.name);
                };
            } else if(obj.loot != null){
                if(displayedMenu == obj.loot && obj.loot.length > 0){
                    b.innerHTML = `Leave ${obj.name}`;
                } else if (obj.loot.length > 0){
                    b.innerHTML = `Search ${obj.name}`;
                } else {
                    //b.innerHTML = `${obj.name} (empty)`;
                    actions.removeChild(b);
                }
                b.onclick = function(){
                    toggleChestInventory(obj.loot, false, obj.name);
                };
            } else if(obj.corpse != null){
                if(displayedMenu == obj.corpse && obj.corpse.length > 0){
                    b.innerHTML = `Leave ${obj.name} Corpse`;
                } else if(obj.corpse.length > 0){
                    b.innerHTML = `Search ${obj.name} Corpse`;
                } else {
                    actions.removeChild(b);
                }
                b.onclick = function(){
                    toggleChestInventory(obj.corpse, false, obj.name);
                };
            } else if(obj.travel != null){
                if(displayedMenu == obj.travel && obj.travel.length > 0){
                    b.innerHTML = `Hide ${obj.name}`;
                } else if(obj.travel.length > 0){
                    b.innerHTML = `Show ${obj.name}`;
                } else {
                    actions.removeChild(b);
                }
                b.onclick = function(){
                    toggleMenu(obj.travel, obj.name);
                };
            }
        }
    }

    if(actions.style.display == `none` && actions.childNodes.length > 1 ){ //Room.inn != null || Room.shop != null || Room.enemies.length > 0 || Room.objects.length > 0 )){
        actions.style.display = `block`;
    } else {
        actions.style.display = `none`;
    }

    if(chestinv.style.display == `block` && (displayedMenu && displayedMenu.length < 1 || displayedMenu && displayedMenu.length < 1)){
        chestinv.style.display = `none`;
    }
    //console.log(actions.style.display,chestinv.style.display);
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
