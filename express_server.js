const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const helpers = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["gbefwbiuelrlgburegbukb"],
}))


////// DATA //////////////

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
}

// //return userID if it finds a user corresponds to the email
// const findUserByEmail = email => {
//   for (let user in users) {
//     if (users[user].email === email) {
//       return user;
//     }
//   }
//   return false;
// }

//returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = id => {
  const result = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
}

////// ROUTES //////////////
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = { urls: urlsForUser(userId), user: users[userId] };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars)
  } else {
    res.redirect("/urls");
  }
})


// homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// JSON Page to show urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})

/////////////////////////////////////////////

// urls page (edit) handler
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

// urls (delete) handler
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls")
  }
})

// :shortURL edit handler
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    let editShort = req.params.shortURL;
    urlDatabase[editShort].longURL = req.body.editted;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

/////////////////////////////////////////

// login
app.get("/login", (req,res) => {
  res.render("login");
})

// login submit handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = helpers.getUserByEmail(email,users);
  if (!userID) {
    res.status(403).send("User does not exists!");
  } else {
    if (bcrypt.compareSync(password, users[userID].password)) {
      req.session.user_id = userID;
      // res.cookie("user_id", userID);
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect password!");
    }
  }
})


// logout page
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
})

//////////////////////////////////

// register page
app.get("/register", (req, res) => {
  res.render("register");
})

// register submit handler
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (((email.length === 0) && (password.length === 0))) {
    res.status(400).send("Invalid Email or Password!");
  } else if (helpers.getUserByEmail(email,users)) {
    res.status(400).send("Email already exists!");
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password : hashedPassword,
  }
  // res.cookie("user_id", id);
  req.session.user_id = id;
  res.redirect("/urls");
})


///////////////////////
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
});