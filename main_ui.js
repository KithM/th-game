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
    modal.style.display = "block";
    span.onclick = function() {
        modal.style.display = "none";
    }
    ver.innerHTML = `<w>Version <d>${Version}</d></w>`;
    let ver_y = Number( Version.split(/(\d+)\.\d+\.\d+/gmi)[1] );
    let ver_m = Number( Version.split(/\d+\.(\d+)\.\d+/gmi)[1] );
    let ver_d = Number( Version.split(/\d+\.\d+\.(\d+)/gmi)[1] );

    if( ver_d < today.getDate() || ver_m < today.getMonth() + 1 || ver_y < today.getFullYear() ){
        let mcontent = document.getElementById(`mcontent`);
        let warnver = document.createElement(`span`);
        let last = getDaysElapsed( new Date(`${ver_m} ${ver_d}, ${ver_y}`) );

        warnver.className = `warnversion`;
        warnver.innerHTML = `<w>${last} days since update</w>`;

        mcontent.appendChild(warnver);
    }
}

// Menues
function toggleInventory(){
    var inv = document.getElementById("inventory");
    var invbutton = document.getElementById("toggleInventory");
    if (inv.style.display == "none") {
        inv.style.display = "block";
        invbutton.innerHTML = "Hide";
        updateInventory();
    } else {
        inv.style.display = "none";
        invbutton.innerHTML = "Show";
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
            b.innerHTML = `<w>${n}</w> (${price})`;
            b.className = `button`;
            b.id = dir;
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
