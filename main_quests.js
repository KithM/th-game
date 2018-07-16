// Quests
function updateQuests(){
    let quests_ = document.getElementById(`quests`);
    let questsHTML = `<p>Quests</p>`;
    quests_.innerHTML = questsHTML;
    if(ActiveQuests.length > 0){
        for (var i = 0; i < ActiveQuests.length; i++) {
            let q_ = document.createElement(`button`);
            let id = ActiveQuests[i].name;
            let aq = getQuestFromName(id);
            q_.className = `button`;
            q_.id = id;
            q_.innerHTML = `<span style="padding:4px; display:block;"><w>${id}</w> (${getQuestProgress(aq)}%)</span>`;
            q_.style.fontSize = `14px`;
            q_.style.fontWeight = `normal`;
            q_.style.width = `100%`;
            q_.style.marginLeft = `0px`;
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
        q_.style.width = `100%`;
        quests_.appendChild(q_);
    }
}
function toggleQuestDisplay(id){
    let q = document.getElementById(id);
    let aq = getQuestFromName(id);

    q.innerHTML = `<span style="padding:4px; display:block;"><w>${id}</w> (${getQuestProgress(aq)}%)</span>`;

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
    if(p > 99){
        return true;
    }
    return false;
}
function isQuestProgressChanged(quest){
    let p = getQuestProgress(quest);
    if(quest == null){
        return;
    }
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
    let tasks_required = qr.length;

    for (var i = 0; i < qr.length; i++) {
        if( qr[i].reachLevel != null && Level >= qr[i].reachLevel ){
            tasks_done++;
        } else if( qr[i].discover != null && Discovered.indexOf(getLocationByName(qr[i].discover)) > -1 ){
            tasks_done++;
        } else if( qr[i].haveItemMat != null ){
            let items_ = Inventory.filter(function(a){ if(a != null && a.baseMaterial.name == qr[i].haveItemMat){ return a; } });
            if( items_.length > 0 ){
                if(qr[i].count == null){
                    tasks_done++;
                } else {
                    let items_count = items_.reduce(function(total,num){ return total.count + num.count; });
                    if(items_.length == 1){ items_count = items_[0].count; }

                    if(items_count >= qr[i].count){
                        tasks_done++;
                    }
                }
            }
        } else if(  qr[i].haveItemType != null ){
            let items_ = Inventory.filter(function(a){ if(a != null && a.itemType == qr[i].haveItemType){ return a; } });
            if( items_.length > 0 ){
                if(qr[i].count == null){
                    tasks_done++;
                } else {
                    let items_count = items_.reduce(function(total,num){ return total.count + num.count; });
                    if(items_.length == 1){ items_count = items_[0].count; }

                    if(items_count >= qr[i].count){
                        tasks_done++;
                    }
                }
            }
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
            if(i == qrq.length-2){
                desc += `, and `;
            }
        }
    }
    return `${desc}.`;
}
function completeQuest(quest){
    //console.dir(quest);
    ActiveQuests.splice(ActiveQuests.indexOf(quest),1);

    for (var i = 0; i < quest.rewards.length; i++) {
        addItem(quest.rewards[i]);
    }
    if(quest.xp != null){ changeExperience(quest.xp); }
    if(quest.next != null){
        for (var i = 0; i < quest.next.length; i++) {
            let a = getQuestFromName(quest.next[i]);
            addQuest(a);
        }
    }

    important(`<w>Quest Completed</w>: ${quest.name}.`);
    updateQuests();
}
