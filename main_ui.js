var displayedMenu;

// Document elements
function drawDocument(){
    if(document.getElementById(`a_level`).innerHTML != `Level <w>${Level}</w>`){ document.getElementById(`a_level`).innerHTML = `Level <w>${Level}</w>`; }
    if(document.getElementById(`a_health`).innerHTML != `<w>${getSmallNumberString(Health)}</w> / ${getSmallNumberString(MaxHealth)} HP`){ document.getElementById(`a_health`).innerHTML = `<w>${getSmallNumberString(Health)}</w> / ${getSmallNumberString(MaxHealth)} HP`; }
    if(document.getElementById(`a_experience`).innerHTML != `<w>${getSmallNumberString(Experience)}</w> / ${getSmallNumberString(ExperienceToNext)} XP`){ document.getElementById(`a_experience`).innerHTML = `<w>${getSmallNumberString(Experience)}</w> / ${getSmallNumberString(ExperienceToNext)} XP`; }

    if(document.getElementById(`bronze`).innerHTML != `<w>${Bronze}</w>b`){ document.getElementById(`bronze`).innerHTML = `<w>${Bronze}</w>b`; }
    if(document.getElementById(`silver`).innerHTML != `<w>${Silver}</w>s`){ document.getElementById(`silver`).innerHTML = `<w>${Silver}</w>s`; }
    if(document.getElementById(`gold`).innerHTML != `<w>${Gold}</w>g`){ document.getElementById(`gold`).innerHTML = `<w>${Gold}</w>g`; }

    if(document.getElementById(`bar`).style != `width: ${Math.round((Experience/ExperienceToNext)*100)}%`){ document.getElementById(`bar`).style = `width: ${Math.round((Experience/ExperienceToNext)*100)}%`; }

    if(document.getElementById(`actions`).style.display == `none` && document.getElementById(`actions`).childNodes.length > 1){
        updateActions();
    }
}

// Create HTML elements
function createHTMLButton(name, e, parent){
    let b = document.createElement("button");

    b.className = "button";
    b.id = name;
    b.innerHTML = name;
    b.onclick = e;

    document.getElementById(parent).appendChild(b);
}
function createItemButton(item, chest){
    let button = document.createElement(`button`);
    let dname = item.displayName;

    if(isEquipped(item)){
        dname = `<w>${item.displayName}</w>`;
    }
    if(item.count > 1){
        dname += ` (${item.count})`;
    }

    button.className = `button`;
    button.id = `chest ${item.displayName}`;
    button.innerHTML = dname;
    button.style.fontWeight = `normal`;
    button.style.fontSize = `11px`;
    button.style.borderColor = `black`;
    button.style.backgroundColor = `black`;
    if(item.itemType == `Weapon`){
        button.style.borderColor = `#d0382d`;
        button.style.backgroundColor = `#d0382d`;
    } else if(item.itemType == `Wearable`){
        button.style.borderColor = `#25b72b`;
        button.style.backgroundColor = `#25b72b`;
    } else if(item.itemType == `Inventory`){
        button.style.borderColor = `#e2c322`;
        button.style.backgroundColor = `#e2c322`;
    } else if(item.itemType == `Junk`){
        button.style.borderColor = `gray`;
        button.style.backgroundColor = `gray`;
    } else if(item.itemType == `Material`){
        button.style.borderColor = `#a55234`;
        button.style.backgroundColor = `#a55234`;
    } else if(item.itemType == `Quest`){
        button.style.borderColor = `#38adce`;
        button.style.backgroundColor = `#38adce`;
    } else if(item.itemType == `Bronze`){
        button.style.borderColor = `#cd7f32`;
        button.style.backgroundColor = `#cd7f32`;
    } else if(item.itemType == `Silver`){
        button.style.borderColor = `#c0c0c0`;
        button.style.backgroundColor = `#c0c0c0`;
    } else if(item.itemType == `Gold`){
        button.style.borderColor = `#d8c250`;
        button.style.backgroundColor = `#d8c250`;
    }
    if(item.enchant != null && item.enchant.name != null){
        button.style.borderLeft = `5px solid white`;
    }

    if(item.itemType == `Bronze`){
        button.onclick = function(){ Bronze += item.count; chest.splice(chest.indexOf(item),1); updateChestInventory(chest, false); };
    } else if(item.itemType == `Silver`){
        button.onclick = function(){ Silver += item.count; chest.splice(chest.indexOf(item),1); updateChestInventory(chest, false); };
    } else if(item.itemType == `Gold`){
        button.onclick = function(){ Gold += item.count; chest.splice(chest.indexOf(item),1); updateChestInventory(chest, false); };
    } else {
        button.onclick = function(){ toggleItemInfo(item); };
    }
    return button;
}
function createModal(){
    var modal = document.getElementById(`modal`);
    var span = document.getElementById(`close`);
    var ver = document.getElementById(`ver`);
    let mcontent = document.getElementById(`mcontent`);

    modal.style.display = "block";
    span.onclick = function() {
        modal.style.display = "none";
    };
    ver.innerHTML = `<w>Version <d>${Version}</d></w>`;
    let ver_y = Number( Version.split(/(\d+)\.\d+\.\d+/gmi)[1] );
    let ver_m = Number( Version.split(/\d+\.(\d+)\.\d+/gmi)[1] );
    let ver_d = Number( Version.split(/\d+\.\d+\.(\d+)/gmi)[1] );

    let span_ver = document.createElement(`span`);
    ver.appendChild(span_ver);
    span_ver.style.marginRight = `-4px`;
    span_ver.style.marginLeft = `5px`;
    span_ver.style.border = `none`;
    span_ver.style.borderRadius = `0px`;

    if( ver_d < today.getDate() || ver_m < today.getMonth() + 1 || ver_y < today.getFullYear() ){
        let last = getDaysElapsed( new Date(`${ver_m} ${ver_d}, ${ver_y} 12:00:00`) );
        span_ver.className = `warnversion`;
        ver.className = `warnversion`;
        span_ver.innerHTML = `<w>${last} days since update</w>`;
        span_ver.style.borderLeft = `2px solid #d6353a`;
    } else {
        span_ver.className = `version`;
        ver.className = `version`;
        span_ver.innerHTML = `<w>Up to date</w>`;
        span_ver.style.borderLeft = `2px solid #256dd1`;
    }

    let changelog = document.getElementById(`changelog`);
    changelog.innerHTML = Changelog;
}

// Update Events
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
                let b_ = document.createElement(`span`);
                b_.className = `default_colors`;
                b_.style.color = `white`;
                b_.style.background = `#00000026`;
                b_.style.borderRadius = `4px`;
                b_.style.fontSize = `12px`;
                b_.style.marginLeft = `5px`;
                b_.style.padding = `5px`;

                b_.style.margin = `-5px`;
                b_.style.marginRight = `-10px`;
                b_.style.float = `right`;

                b_.style.width = `30px`;
                b_.style.height = `100%`;

                let s_ = document.createElement(`span`);
                s_.style.marginLeft = `-30px`;

                if(loc.city == true){ b_.innerHTML = `City`; } else if(loc.inn != null) { b_.innerHTML = `Inn`; } else if (loc.shop != null){ b_.innerHTML = `Shop`; }

                b.appendChild(b_);
                b.appendChild(s_);
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

// Menues
function sortInventory(by){
    if(by == `value`){
        Inventory = Inventory.filter(function(a){ if(a != null){ return a; } }).sort(function(a,b){ return getItemValue(b)-getItemValue(a); });
    } else if(by == `name`){
        Inventory = Inventory.filter(function(a){ if(a != null){ return a; } }).sort(function(a,b){
            if(a.displayName < b.displayName) return -1;
            if(a.displayName > b.displayName) return 1;
            return 0;
        });
    } else if(by == `equipped`){
        Inventory = Inventory.filter(function(a){ if(a != null){ return a; } }).sort(function(a,b){
            if(isEquipped(a) == true && isEquipped(b) == false) return -1;
            if(isEquipped(a) == false && isEquipped(b) == true) return 1;
            return 0;
        });
    }
    updateInventory();
}
function toggleSortInventory(){
    document.getElementById("myDropdown").classList.toggle("show");
}
window.onclick = function(event) {
    if(event.target.id != `sortInventory`){
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++){
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) { openDropdown.classList.remove('show'); }
        }
    }
}
function toggleChestInventory(chest, isStore, name){
    if(displayedMenu == null){
        showChestInventory(chest, isStore, name);
    } else if(displayedMenu != chest){
        hideMenu();
        showChestInventory(chest, isStore, name);
    } else {
        hideMenu();
    }
    updateActions();
}
function showChestInventory(chest, isStore, name){
    var chestinv = document.getElementById("chestinv");
    displayedMenu = chest;

    chestinv.style.display = "block";
    updateChestInventory(chest, isStore, name);
}
function updateChestInventory(chest, isStore, name){
    var chestinv = document.getElementById("chestinv");
    if(chestinv.style.display == `block` && displayedMenu.length > 0){
        let itemHTML = `<p>Chest Inventory</p>`;
        if(isStore == true){
            itemHTML = `<p>${Room.shop.name}</p>`;
        } else if(name != null){
            itemHTML = `<p>${name} Inventory</p>`;
        }
        chestinv.innerHTML = itemHTML;
        for (var i = 0; i < chest.length; i++) {
            let item = chest[i];
            let button = createItemButton(item, chest);
            chestinv.appendChild(button);
        }
    } else {
        chestinv.style.display = `none`;
        updateActions();
    }
}
function updateInventory(){
    var inv = document.getElementById(`inventory`);
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory.length > inventorySlots){
            if(Inventory[Inventory.length-1] != null){
                if(getObjectFromName(`Chest`) == null){
                    createObject({name:`Chest`,chest:[]});
                }
                let chest = getObjectFromName(`Chest`);
                chest.chest.push(Inventory[Inventory.length-1]);

                if(isEquipped(Inventory[Inventory.length-1])){
                    unequipItem(Inventory[Inventory.length-1]);
                }
            }
            Inventory.splice(Inventory.length-1,1);
        } else if(Inventory.length < inventorySlots){
            Inventory.push(null);
        }
    }
    if(Inventory.length > 0){
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
        for (var i = 0; i < Inventory.length; i++) {
            if(Inventory[i] == null){
                continue;
            }
            let item = Inventory[i];
            let button = createItemButton(item, Inventory);
            inv.appendChild(button);
        }
    } else {
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
    }
}
function toggleMenu(menu, name){
    if(displayedMenu == null){
        showMenu(menu, name);
    } else if(displayedMenu != menu){
        hideMenu();
        showMenu(menu, name);
    } else {
        hideMenu();
    }
    updateActions();
}
function showMenu(menu, name){
    var chestinv = document.getElementById("chestinv");
    chestinv.innerHTML = `<p>${name}</p>`;
    displayedMenu = menu;

    for (var i = 0; i < menu.length; i++) {
        let dir = menu[i].name;
        let loc = getLocationByName(dir);
        let n = getLocationByName(dir).displayName;
        let price = getCurrencyAmountString(getTravelPrice(loc));
        if(dir != null){
            let b = document.createElement(`button`);
            b.innerHTML = `<w>${n}, ${loc.region.name}</w><br>(${price})`;
            b.className = `button`;
            b.id = dir;
            b.style.width = `min-content`;
            b.style.marginLeft = `0px`;
            b.style.fontSize = `11px`;
            b.onclick = function(){ fastTravel(dir); };
            chestinv.appendChild(b);
        }
    }
    chestinv.style.display = "block";
}
function hideMenu(){
    var chestinv = document.getElementById("chestinv");
    displayedMenu = null;

    chestinv.style.display = "none";
    chestinv.innerHTML = ``;
}
