const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


////// DATA //////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "password-example"
  },
}


////// ROUTING //////////////
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = { urls: urlDatabase , user: users[userID]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL= req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] , user: users[req.cookies["user_id"]]};
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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

/////////////////////////////////////////////

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL]=longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});



app.post("/urls/:shortURL", (req, res) => {
  let editShort = req.params.shortURL;
  urlDatabase[editShort] = req.body.editted;
  console.log(urlDatabase)
  res.redirect("/urls/");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
})

app.post("/login", (req,res) => {
  res.cookie("username",req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  }
  res.cookie("user_id",id);
  res.redirect("/urls");
})

///////////////////////
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});