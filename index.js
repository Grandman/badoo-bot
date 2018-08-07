const Nightmare = require("nightmare");
const _ = require("lodash");
const co = require("co");
const nightmare = Nightmare({ show: true });
const dotenv = require("dotenv").config({ silent: true });
const { email, password, location, score } = process.env;

const selectors = [
  { key: "name", selector: ".profile-header__name .ellipsis" },
  { key: "location", selector: ".js-location-label" },
  { key: "score", selector: ".scale-value" },
  { key: "interests", selector: ".js-interests-board" },
  { key: "riseup", selector: ".js-explanation-open" },
  { key: "premium", selector: ".icon--premium" },
  { key: "last_online", selector: "#app_c > div > div.profile__header.js-profile-header-container.js-core-events-container > header > div.profile-header__txt > div.profile-header__info > div.profile-header__online-status > i > span > span" }
];

const getContents = (selectors) => {
  let userInfo = {};
  selectors.map(sel => {
    const ele = document.querySelector(sel.selector);
    return (userInfo[sel.key] = ele && ele.innerHTML.replace(/\s/g, ''));
  });
  return userInfo;
}
var liked = 0;
var total = 0;

const like = function*() {
  yield nightmare.wait(600);
  yield nightmare.click(".js-profile-header-name");
  yield nightmare.wait(".location-map-wrap");
  yield nightmare
    .evaluate(getContents, selectors)
    .then((userInfo) => {
      total += 1;
      if (
        userInfo &&
        (userInfo.location == location && userInfo.last_online != "Онлайн7+днейназад")
      ) {
        liked += 1;
        console.log(`\t yes -> click -- Info: ${userInfo.location}, Name: ${userInfo.name}, "Score: ${userInfo.score}, Interests": ${userInfo.interests}, Last Online: ${userInfo.last_online}`);
        console.log(`LIKED: ${liked}; TOTAL: ${total}`);
        return nightmare.type("body", "1");
      } else {
        console.log(`\t no -> click -- Info: ${userInfo.location}, Name: ${userInfo.name}, "Score: ${userInfo.score}, Interests": ${userInfo.interests}, Last Online: ${userInfo.last_online}`);
        console.log(`LIKED: ${liked}; TOTAL: ${total}`);
        return nightmare.type("body", "2");
      }
    })
    .catch(e => console.log(e));
};

const auth = function*() {
  yield nightmare.goto("https://badoo.com/ru/signin/?f=top");
  yield nightmare.wait(".js-signin-password");
  yield nightmare
    .type(".js-signin-login", email)
    .type(".js-signin-password", password)
    .click(".sign-form__submit");
  yield nightmare
    .wait(".js-profile-layout-container")
    .catch(e => console.log(e));
};

co(function*() {
  yield auth();
  for (let i = 0; i < 5000; i++) {
    yield like();
  }
}).then(() => console.log("finished!"), e => console.log(e));
