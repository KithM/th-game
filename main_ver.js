const Version = `2018.7.24`;
const Changelog = `
    <br><big><w>Changelog Version <big>${Version}</big></w></big><br><hr>
    <span style="font-size:12px; line-height:16px;">

    <li><span class="changed fixed">Fix</span>Resolved an issue where level-related quests were being completed even though the player did not finish the quest.</li>
    <li><span class="changed new">New</span>Added a sorting function for the player inventory. The inventory can now be sorted by name, value, or equipped.</li>
    <li><span class="changed new">New</span>Added \'make a suggestion\' and \'report a bug\' buttons to the modal which automatically links the player to a pre-filled issue template.</li>
    <li><span class="changed new">New</span>Added days since update to the modal. This shows how long it has been since the latest commit.</li>
    <li><span class="changed new">New</span>Added scrollbar to modal if content is too large to fit vertically.</li>
    <li><span class="changed new">New</span>Added changelog to modal. The changelog is useful for providing information to the player about what has been modified.</li>
    <li><span class="changed updated">Update</span>Updated level up message to display a list of unlocked gameplay features and locations if there are any.</li>
    <li><span class="changed updated">Update</span>Updated some css graphical elements.</li>

    </span>
`;

var today = new Date();
