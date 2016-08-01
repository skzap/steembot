// Saves options to chrome.storage
function save_options() {
  chrome.storage.sync.set({
    upvoteThreshold: document.getElementById('upvoteThreshold').value,
    waitTime: document.getElementById('waitTime').value,
    failsafeTime: document.getElementById('failsafeTime').value,
    scrollTime: document.getElementById('scrollTime').value,
    scoreMoney: document.getElementById('scoreMoney').value,
    scoreVotes: document.getElementById('scoreVotes').value,
    scoreComments: document.getElementById('scoreComments').value,
    lowTime: document.getElementById('lowTime').value,
    highTime: document.getElementById('highTime').value
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    upvoteThreshold: 9,
    waitTime: 2500,
    failsafeTime: 60000,
    scrollTime: 1500,
    scoreMoney: 300,
    scoreVotes: 1000,
    scoreComments: 600,
    lowTime: 10,
    highTime: 180
  }, function(items) {
    document.getElementById('upvoteThreshold').value = items.upvoteThreshold;
    document.getElementById('waitTime').value = items.waitTime;
    document.getElementById('failsafeTime').value = items.failsafeTime;
    document.getElementById('scrollTime').value = items.scrollTime;
    document.getElementById('scoreMoney').value = items.scoreMoney;
    document.getElementById('scoreVotes').value = items.scoreVotes;
    document.getElementById('scoreComments').value = items.scoreComments;
    document.getElementById('lowTime').value = items.lowTime;
    document.getElementById('highTime').value = items.highTime;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
