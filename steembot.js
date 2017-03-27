var conf = {
  upvoteThreshold: 9,
  waitTime: 2500,
  failsafeTime: 60000,
  scrollTime: 1500,
  scoreMoney: 300,
  scoreVotes: 1000,
  scoreComments: 600,
  scoreReputation: 500,
  lowTime: 10,
  highTime: 180
}

chrome.storage.sync.get(conf, function(newConfig) {
  if (newConfig) conf=newConfig;
  console.log('Injected JS Bot', conf);
  setTimeout(function() {
    location.reload();
  }, conf.failsafeTime);
  loadingPosts = setInterval(function(){ scrollToBottom(); }, conf.scrollTime);
});

function scorePost(post) {
  score = 0;
  // money is good
  score += conf.scoreMoney*post.money/1000;
  // votes are better
  score += conf.scoreVotes*post.votesPerMin;
  // comments can help
  score += conf.scoreComments*post.commentsPerMin;
  // reputation is interesting
  score += conf.scoreReputation*post.reputation/1000;

  // dont vote too early
  if (post.diffMs < conf.lowTime) {
    score *= post.diffMs/conf.lowTime
  }

  // dont vote too late
  if (post.diffMs > conf.highTime) {
    score -= (post.diffMs-conf.highTime)
  }
  return score;
}

function scrollToBottom() {
  if (getData().length > 200) {
    clearInterval(loadingPosts);
    processData();
    setTimeout(function() {
      location.reload();
    }, conf.waitTime);
  } else {
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
  }
}

// parses the raw information from the document
function getData() {
  var rawPosts = document.getElementsByClassName('PostSummary');
  var posts = [];
  for (var i = 0; i < rawPosts.length && i < 1000; i++) {
    var post = {};
    post.author = getAuthor(rawPosts[i]);
    post.comments = getCommentsCount(rawPosts[i]);
    post.datetime = getDateTime(rawPosts[i]);
    post.money = getMoney(rawPosts[i]);
    post.raw = rawPosts[i];
    post.title = getTitle(rawPosts[i]);
    post.upvoted = isUpvoted(rawPosts[i]);
    post.votes = getUpvotesCount(rawPosts[i]);
    post.reputation = getReputation(rawPosts[i]);
    posts.push(post);
  }
  return posts;
}

// calculates averages, scores, and upvotes if possible
function processData() {
  var posts = getData();
  var averages = {
    comments: 0,
    votes: 0,
    votesPerMin: 0,
    commentsPerMin: 0,
    score: 0
  }
  for (var i = 0; i < posts.length; i++) {
    posts[i].diffMs = (new Date() - new Date(posts[i].datetime))/60000;
    posts[i].votesPerMin = posts[i].votes / posts[i].diffMs;
    posts[i].commentsPerMin = posts[i].comments / posts[i].diffMs;
    posts[i].score = scorePost(posts[i]);
    averages.comments += posts[i].comments;
    averages.votes += posts[i].votes;
    averages.commentsPerMin += posts[i].commentsPerMin;
    averages.votesPerMin += posts[i].votesPerMin;
    averages.score += posts[i].score;
  }
  averages.comments /= posts.length;
  averages.votes /= posts.length;
  averages.commentsPerMin /= posts.length;
  averages.votesPerMin /= posts.length;
  averages.score /= posts.length;

  // sorting by decreasing score
  posts.sort(function(a, b){
    return b.score-a.score;
  });
  console.log(averages, posts.length);

  // see if we can upvote anything now
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].score < conf.upvoteThreshold*averages.score) break;
    if (!posts[i].upvoted) {
      upvote(posts[i].raw);
      console.log('Upvoted', posts[i]);
      saveUpvote(posts[i], averages)
      break;
    }
  }
  return posts;
}

function saveUpvote(post, averages) {
  // saving upvote into vote history
  chrome.storage.sync.get('voteHistory', function(r) {
    var newVoteHistory = [];
    if (!r || !r.voteHistory) var r = { voteHistory: [] };
    var history = {
      post: post,
      averages: averages,
      d: new Date().toISOString()
    }
    newVoteHistory.push(history);
    for (var i = 0; i < r.voteHistory.length; i++) {
      if (newVoteHistory.length >= 100) break;
      newVoteHistory.push(r.voteHistory[i])
    }
    console.log(newVoteHistory)
    chrome.storage.sync.set({'voteHistory': newVoteHistory}, function() {
    });
  });
}
function upvote(rawPost) {
  rawPost.getElementsByClassName('Voting__button-up')[0].getElementsByTagName('A')[0].click();
  rawPost.getElementsByClassName('Voting__button-up')[0].getElementsByClassName('confirm_weight')[0].click();
}
function isUpvoted(rawPost) {
  var upvoteButton = rawPost.getElementsByClassName('Voting__button-up')[0];
  if (!upvoteButton) return false;
  if (upvoteButton.classList.contains('Voting__button--upvoted')) return true;
  return false;
}
function getUpvotesCount(rawPost) {
  var rawText = rawPost.getElementsByClassName('VotesAndComments__votes')[0].title;
  var count = parseInt(rawText)
  if (!count) count=0;
  return count;
}
function getCommentsCount(rawPost) {
  var rawText = rawPost.getElementsByClassName('VotesAndComments__comments')[0].getElementsByTagName('A')[0].title;
  var count = parseInt(rawText)
  if (!count) count=0;
  return count;
}
function getDateTime(rawPost) {
  return rawPost.getElementsByClassName('vcard')[0].getElementsByTagName('SPAN')[0].title;
}
function getMoney(rawPost) {
  var money = parseInt(rawPost.getElementsByClassName('integer')[0].innerHTML)
  money += parseInt(rawPost.getElementsByClassName('decimal')[0].innerHTML.split('.')[1])/100
  return money;
}
function getAuthor(rawPost) {
  var link = getLink(rawPost).outerHTML;
  var author = link.substr(link.indexOf('@'));
  author = author.substr(0, author.indexOf('/'))
  return author;
}
function getTitle(rawPost) {
  return getLink(rawPost).innerHTML;
}
function getLink(rawPost) {
  return rawPost.getElementsByClassName('entry-title')[0].getElementsByTagName('A')[0];
}
function getReputation(rawPost) {
  return parseInt(rawPost.getElementsByClassName('Reputation')[0].innerHTML);
}
