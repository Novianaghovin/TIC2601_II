// YK WILL EDIT THIS

// Create the main container for the page
const app = document.createElement('div');
app.className = 'app';

// Create a menu section
const menu = document.createElement('div');
menu.className = 'menu';

// Create menu buttons
const buttons = ['My Profile', 'My Activity', 'My Goals', 'Friend', 'My Badge', 'Challenge'];
buttons.forEach(buttonText => {
    const button = document.createElement('button');
    button.innerText = buttonText;
    button.id = buttonText.replace(/\s+/g, '').toLowerCase() + 'Btn'; // Set button ID
    menu.appendChild(button);
});

// Append the menu to the main container
app.appendChild(menu);

// Create a container for the challenges
const container = document.createElement('div');
container.className = 'container';

// Create header for "My Challenge"
const myChallengeHeader = document.createElement('h2');
myChallengeHeader.innerText = 'My Challenge';
container.appendChild(myChallengeHeader);

// Create table for My Challenges
const myChallengesTable = document.createElement('table');
myChallengesTable.className = 'table';
const myChallengesThead = document.createElement('thead');
const myChallengesHeaderRow = document.createElement('tr');
['Challenge Type', 'Challenge Name', 'Challenge Deadline', 'Participant Number', ''].forEach(text => {
    const th = document.createElement('th');
    th.innerText = text;
    myChallengesHeaderRow.appendChild(th);
});
myChallengesThead.appendChild(myChallengesHeaderRow);
myChallengesTable.appendChild(myChallengesThead);
const myChallengesTbody = document.createElement('tbody');
myChallengesTable.appendChild(myChallengesTbody);
container.appendChild(myChallengesTable);

// Create header for "Looking to join other challenge?"
const availableChallengesHeader = document.createElement('h2');
availableChallengesHeader.innerText = 'Looking to join other challenge?';
container.appendChild(availableChallengesHeader);

// Create table for Available Challenges
const availableChallengesTable = document.createElement('table');
availableChallengesTable.className = 'table';
const availableChallengesThead = document.createElement('thead');
const availableChallengesHeaderRow = document.createElement('tr');
['Challenge Type', 'Challenge Name', 'Challenge Deadline', 'Participants', 'Join'].forEach(text => {
    const th = document.createElement('th');
    th.innerText = text;
    availableChallengesHeaderRow.appendChild(th);
});
availableChallengesThead.appendChild(availableChallengesHeaderRow);
availableChallengesTable.appendChild(availableChallengesThead);
const availableChallengesTbody = document.createElement('tbody');
availableChallengesTable.appendChild(availableChallengesTbody);
container.appendChild(availableChallengesTable);

// Append the container to the main app
app.appendChild(container);
document.body.appendChild(app);

// Fetching My Challenges from the backend
fetch('/api/my-challenges')
    .then(response => response.json())
    .then(data => {
        data.forEach(challenge => {
            const row = myChallengesTbody.insertRow();
            row.insertCell(0).innerText = challenge.type;
            row.insertCell(1).innerText = challenge.name;
            row.insertCell(2).innerText = challenge.deadline;
            row.insertCell(3).innerText = challenge.participants;
            row.insertCell(4).innerHTML = '<button class="btn">Leaderboard</button>';
        });
    });

// Fetching Available Challenges from the backend
fetch('/api/available-challenges')
    .then(response => response.json())
    .then(data => {
        data.forEach(challenge => {
            const row = availableChallengesTbody.insertRow();
            row.insertCell(0).innerText = challenge.type;
            row.insertCell(1).innerText = challenge.name;
            row.insertCell(2).innerText = challenge.deadline;
            row.insertCell(3).innerText = challenge.participants;
            row.insertCell(4).innerHTML = `<button class="btn join-btn" onclick="joinChallenge(${challenge.id})">Join</button>`;
        });
    });

// Function to join a challenge
function joinChallenge(id) {
    fetch(`/api/join-challenge/${id}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert('Joined Challenge successfully');
            location.reload(); // Reload page to refresh the data
        });
}