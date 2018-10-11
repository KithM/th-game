// Quests
function updateQuests(){
    let quests_ = document.getElementById(`quests`);
    let questsHTML = `<p>Quests</p>`;
    quests_.innerHTML = questsHTML;
    ActiveQuests.sort(function(a,b){ return getQuestProgress(b)-getQuestProgress(a); });

    if(ActiveQuests.length > 0){
        for (var i = 0; i < ActiveQuests.length; i++) {
            let q_ = document.createElement(`button`);
            let id = ActiveQuests[i].name;
            let aq = getQuestFromName(id);
            q_.className = `button`;
            q_.id = id;
            q_.innerHTML = `<span><w>${id}</w></span> <span style="float:right">${getQuestProgress(aq)}%</span><br>`;
            q_.style.fontSize = `14px`;
            q_.style.fontWeight = `normal`;
            q_.style.width = `100%`;
            q_.style.marginLeft = `0px`;
            q_.style.textAlign = `left`;
            q_.onclick = function(){ toggleQuestDisplay(id); };
            quests_.appendChild(q_);
        }
    } else {
        let q_ = document.createElement(`button`);
        q_.className = `button`;
        q_.id = `not-a-quest`;
        q_.innerHTML = `You currently have no active quests.`;
        q_.style.fontSize = `14px`;
        q_.style.fontWeight = `normal`;
        q_.style.marginLeft = `0px`;
        q_.style.textAlign = `left`;
        q_.style.width = `100%`;
        quests_.appendChild(q_);
    }
}
function toggleQuestDisplay(id){
    let q = document.getElementById(id);
    let aq = getQuestFromName(id);

    q.innerHTML = `<span><w>${id}</w></span> <span style="float:right">${getQuestProgress(aq)}%</span><br>`;

    if(q.style.height == `90px`){
        q.style.height = `auto`;
    } else if(aq != null){
        q.style.height = `90px`;
        let d_ = getQuestDescription(aq);
        let desc = `<span style="font-size:${Math.max(Math.round(14-(d_.length/15)),11)}px;">${d_}</span>`;
        q.innerHTML += `${desc}`;
    }
}
function getQuestFromName(name){
    for (var i = 0; i < quests.length; i++) {
        if(quests[i].name == name){
            return quests[i];
        }
    }
    return null;
}
function addQuest(quest){
    if(ActiveQuests.indexOf(quest) > -1){
        return;
    }
    ActiveQuests.push(quest);
    important(`<w>Quest Started</w>: ${quest.name}.`);
    updateQuests();
}
function isQuestComplete(quest){
    let p = getQuestProgress(quest);
    if(p >= 100){
        return true;
    }
    return false;
}
function isQuestProgressChanged(quest){
    if(quest == null){
        return;
    }
    let p = getQuestProgress(quest);
    let prev_p = document.getElementById(quest.name).innerHTML.split(/(\d+)%/gmi)[1];
    if(prev_p != p){
        return true;
    }
    return false;
}
function getQuestProgress(quest){
    if(quest == null){
        return;
    }
    let qr = quest.requirements;
    let tasks_done = 0;
    let tasks_required = 0;

    for (var i = 0; i < qr.length; i++) {
        if( qr[i].reachLevel != null ){
            tasks_required += qr[i].reachLevel;
            if(Level > qr[i].reachLevel){
                tasks_done += Level - (Level - qr[i].reachLevel);
            } else {
                tasks_done += Level;
            }
        } else if( qr[i].discover != null ){
            tasks_required += 1;
            if(Discovered.indexOf(getLocationByName(qr[i].discover)) > -1){
                tasks_done++;
            }
        } else if( qr[i].haveItemMat != null ){
            tasks_required += 1;
            let items_ = Inventory.filter(function(a){ if(a != null && a.baseMaterial.name == qr[i].haveItemMat){ return a; } });
            if( items_.length > 0 ){
                if(qr[i].count == null){
                    tasks_done++;
                } else {
                    let items_count = items_.reduce(function(total,num){ return total.count + num.count; });
                    if(items_.length == 1){ items_count = items_[0].count; }

                    tasks_required += qr[i].count-1;
                    tasks_done += items_count;
                }
            }
        } else if( qr[i].haveItemType != null ){
            tasks_required += 1;
            let items_ = Inventory.filter(function(a){ if(a != null && a.itemType == qr[i].haveItemType){ return a; } });
            if( items_.length > 0 ){
                if(qr[i].count == null){
                    tasks_done++;
                } else {
                    let items_count = items_.reduce(function(total,num){ return total.count + num.count; });
                    if(items_.length == 1){ items_count = items_[0].count; }

                    tasks_required += qr[i].count-1;
                    tasks_done += items_count;
                }
            }
        } else if( qr[i].haveBronze != null ){
            tasks_required += qr[i].haveBronze;
            tasks_done += Bronze + (Silver * 100) + (Gold * 10000);
        } else if( qr[i].haveSilver != null ){
            tasks_required += qr[i].haveSilver * 100;
            tasks_done += Bronze + (Silver * 100) + (Gold * 10000);
        } else if( qr[i].haveGold != null ){
            tasks_required += qr[i].haveGold * 10000;
            tasks_done += Bronze + (Silver * 100) + (Gold * 10000);
        }
    }
    //console.log(tasks_done,tasks_required);
    return Math.min(Math.round((tasks_done/tasks_required)*100),100);
}
function getQuestDescription(quest){
    let qrq = quest.requirements;
    let desc = ``;
    if(qrq != null){
        desc += `Requirements: `;
        for (var i = 0; i < qrq.length; i++) {
            if(i > 0 && i < qrq.length-1){
                desc += `, `;
            }
            if(qrq[i].reachLevel != null){
                desc += `Reach <w>Level ${qrq[i].reachLevel}</w>`;
            }
            if(qrq[i].discover != null){
                desc += `Discover <w>${getLocationByName(qrq[i].discover).displayName}</w>`;
            }
            if(qrq[i].haveItemMat != null){
                if(qrq[i].count == null){
                    desc += `Have any <w>${qrq[i].haveItemMat}</w> item`;
                } else {
                    desc += `Have <w>${qrq[i].count} ${qrq[i].haveItemMat}</w> items`;
                }
            }
            if(qrq[i].haveItemType != null){
                if(qrq[i].count == null){
                    desc += `Have any <w>${qrq[i].haveItemType}</w> item`;
                } else {
                    desc += `Have <w>${qrq[i].count} ${qrq[i].haveItemType}</w> items`;
                }
            }
            if(qrq[i].haveBronze != null){
                desc += `Have <w>${qrq[i].haveBronze} Bronze</w>`;
            }
            if(qrq[i].haveSilver != null){
                desc += `Have <w>${qrq[i].haveSilver} Silver</w>`;
            }
            if(qrq[i].haveGold != null){
                desc += `Have <w>${qrq[i].haveGold} Gold</w>`;
            }
            if(i == qrq.length-2){
                desc += `, and `;
            }
        }
    }
    return `${desc}.`;
}
function completeQuest(quest){
    //console.dir(quest);
    quest.completed = true;

    ActiveQuests.splice(ActiveQuests.indexOf(quest),1);
    important(`<w>Quest Completed</w>: ${quest.name}.`);

    for (var i = 0; i < quest.rewards.length; i++) {
        addItem(quest.rewards[i]);
    }
    if(quest.xp != null){ changeExperience(quest.xp); }
    if(quest.currency != null){ setCurrencyToTotal( (Bronze + (Silver * 100) + (Gold * 10000)) + quest.currency ); }
    if(quest.next != null){
        for (var i = 0; i < quest.next.length; i++) {
            let a = getQuestFromName(quest.next[i]);
            addQuest(a);
        }
    }

    updateQuests();
}
function hasCompletedQuest(quest){
    if(quest.completed){
        return true;
    }
    return false;
}
