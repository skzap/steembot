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
    scoreReputation: document.getElementById('scoreReputation').value,
    lowTime: document.getElementById('lowTime').value,
    highTime: document.getElementById('highTime').value,
    upvoteAuthors: document.getElementById('upvoteAuthors').value.replace(/ /g, "").split('\n'),
    neverUpvoteBefore: document.getElementById('neverUpvoteBefore').value
  }, function() {
    // Update status to let user know options were saved.
    var status = $('#status')
    status.show();
    setTimeout(function() {
      status.hide();
    }, 1000);
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
    scoreReputation: 500,
    lowTime: 10,
    highTime: 180,
    upvoteAuthors: ['@heimindanger', '@ned'],
    neverUpvoteBefore: 5
  }, function(items) {
    document.getElementById('upvoteThreshold').value = items.upvoteThreshold;
    document.getElementById('waitTime').value = items.waitTime;
    document.getElementById('failsafeTime').value = items.failsafeTime;
    document.getElementById('scrollTime').value = items.scrollTime;
    document.getElementById('scoreMoney').value = items.scoreMoney;
    document.getElementById('scoreVotes').value = items.scoreVotes;
    document.getElementById('scoreComments').value = items.scoreComments;
    document.getElementById('scoreReputation').value = items.scoreReputation;
    document.getElementById('lowTime').value = items.lowTime;
    document.getElementById('highTime').value = items.highTime;
    document.getElementById('upvoteAuthors').value = items.upvoteAuthors.join('\n');
    document.getElementById('neverUpvoteBefore').value = items.neverUpvoteBefore;
    value = $('.range-slider__value');
    value.each(function() {
      var value = $(this).prev().val();
      $(this).html(value);
    });
  });
}

function display_vote_history() {
  $("#voteTable tr").not('thead tr').remove();
  chrome.storage.local.get('voteHistory', function(r) {
    if (!r || !r.voteHistory) return;
    for (var i = 0; i < r.voteHistory.length; i++) {
      var post = r.voteHistory[i].post;
      var time = r.voteHistory[i].d;
      var averages = r.voteHistory[i].averages;
      var htmlLine = '<tr>';
      htmlLine += '<td>'+time+'</td>'
      htmlLine += '<td>'+post.author+'</td>'
      htmlLine += '<td><a href=\''+post.href+'\' target="_blank">'+post.title+'</a></td>'
      htmlLine += '<td>'+Math.round(post.diffMs)+'</td>'
      htmlLine += '<td>'+post.money+'</td>'
      htmlLine += '<td>'+post.votes+'</td>'
      htmlLine += '<td>'+post.comments+'</td>'
      htmlLine += '<td>'+post.reputation+'</td>'
      if (post.score == Number.MAX_SAFE_INTEGER) {
        htmlLine += '<td>&infin;</td><td></td>'
      }
      else {
        htmlLine += '<td>'+Math.round(post.score)+'</td>'
        htmlLine += '<td>'+Math.round(averages.score)+'</td>'
      }
      htmlLine += '</tr>';
      $('#voteTable').append(htmlLine)
    }
  });
}

function wipe_vote_history() {
  chrome.storage.local.set({'voteHistory': null}, function() {});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);


$( document ).ready(function() {
  var rangeSlider = function() {
    var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');

    slider.each(function() {
      value.each(function() {
        var value = $(this).prev().val();
        $(this).html(value);
      });
      range.on('input', function() {
        $(this).next(value).html(this.value);
      });
    });
  };

  rangeSlider();
  display_vote_history()
  $('#wipe_vote_history').click(function() {
    wipe_vote_history()
    display_vote_history()
  })
});
