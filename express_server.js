const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


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
    password: "password-example"
  },
}

const findUserByEmail = email => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}

////// ROUTING //////////////
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = {user: users[req.cookies.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user: users[req.cookies.user_id]};
  res.render("urls_show", templateVars)
})




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/u/:shortURL", (req, res) => {
  console.log("shortURL is: \n" ,req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
})

/////////////////////////////////////////////

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: req.cookies.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})


app.post("/urls/:shortURL", (req, res) => {
  let editShort = req.params.shortURL;
  urlDatabase[editShort] = req.body.editted;
  res.redirect("/urls/");
});

/////////////////////////////////////////


app.get("/login", (req,res) => {
  res.render("login");
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = findUserByEmail(email);
  if (!userID) {
    res.status(403).send("This user is not existing.");
  } else {
    if (users[userID].password === password) {
      res.cookie("user_id",userID);
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect password.");
    }
  }
})



app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//////////////////////////////////

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (((email.length === 0) && (password.length === 0))) {
    res.status(400).send("Invalid Email or Password.");
  } else if (findUserByEmail(email)) {
    res.status(400).send("This Email is already existing.");
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  }
  res.cookie("user_id", id);
  res.redirect("/urls");
})

///////////////////////
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});